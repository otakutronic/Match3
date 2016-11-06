import ui.View;
import ui.ImageView;
import math.geom.Point as Point;
import src.lib.Enum as Enum;
import src.Constants as Constants;

exports = Class(ui.View, function (supr) {

	var currentmoves = { col1: 0, row1: 0, col2: 0, row2: 0 };
	var tiles = [];
    var cols;
    var rows;
    var tileTypes;

	this.init = function () {
        cols = Constants.BOARD_COLS;
        rows = Constants.BOARD_ROWS;
        tileTypes = Constants.NUM_OF_TILE_TYPES;
		updateMoves(-1, -1);
	};

    // when the player clicks the board
    this.onPressed = function(x, y) {
        y -= Constants.BOARD_OFFSET;

        if(y < 0) return;

        // set the new moves to the selected grid cell
        var cell = getCell(x, y);
        updateMoves(cell.x, cell.y);
        
        // swap
        this.trySwap(currentmoves);

        // update the game
        var selectData = {type:'board:select', x: currentmoves.col2, y: currentmoves.row2};
        this.emit('board:update', selectData);
    }

    // try the swap of two board pieces
    this.trySwap = function (moves) {   
        // get the board tiles
        var tile1 = getTile(moves.col1, moves.row1);
        var tile2 = getTile(moves.col2, moves.row2);

        if(tile1 != -1 && tile2 != -1) {
            // swap the pieces
            this.swapPieces(moves.col1, moves.row1, moves.col2, moves.row2);
        }
    }

    // swap two pieces
    this.swapPieces = function (x1, y1, x2, y2) {
        if(canSwap(x1, y1, x2, y2)){
            // update the game
            var swapData = {type:'board:goodswap', x1: x1, y1: y1, 
                x2: x2, y2: y2};
            this.emit('board:update', swapData);

            var type1 = getTile(x1, y1);
            var type2 = getTile(x2, y2);

            // swap tiles
            tiles[x1][y1] = type2;
            tiles[x2][y2] = type1;
        } else {
            // update the game
            var swapData = {type:'board:badswap', x1: x1, y1: y1, 
                x2: x2, y2: y2};
            this.emit('board:update', swapData);
        }
    }

    // reset up the board
    this.reset = function () {
        // update the game
        var resetData = {type:'board:reset'};
        this.emit('board:update', resetData);
        // reset board
        this.fillBoard();
        updateMoves(-1, -1);
    }
 
    // check the board for matches
    this.check = function() {
        var chains = getChains(), 
            hadChains = false, score = 0,
            removed = [], moved = [], gaps = [];

        for (var x = 0; x < cols; x++) {
            gaps[x] = 0;
            for (var y = rows-1; y >= 0; y--) {
                if (chains[x][y] > 2) {
                    hadChains = true;
                    gaps[x]++;
                    // update the game
                    var matchData = {type:'board:match', x : x, y : y, 
                       tile : getTile(x,y)};
                    this.emit('board:update', matchData);
                } else if (gaps[x] > 0) {
                    tiles[x][y + gaps[x]] = getTile(x, y);
                    // update the game
                    var shiftData = {type:'board:shift', x1 : x, y1 : y + gaps[x], 
                       x2 : x, y2 : y, tile : getTile(x,y)};
                    this.emit('board:update', shiftData); 
                }
            }
            // fill from top
            for (y = 0; y < gaps[x]; y++) {
                // update the game
                var addData = {type:'board:addTile', x: x, y: y, tile: getRandTile(), 
                   offset: Constants.TILE_SIZE * gaps[x]};
                this.emit('board:update', addData);
                tiles[x][y] = addData.tile;
            }
        }
        if (hadChains) {
            // reset if no more moves
            if (!hasMoves()) {
                this.reset();
            }
        }
    }

    // update the moves
    function updateMoves (col, row) {
        currentmoves.row1 = currentmoves.row2;
        currentmoves.col1 = currentmoves.col2;
        currentmoves.row2 = row;
        currentmoves.col2 = col;

        // unset if not adjacent  
        if (!isAdjacent(currentmoves.col1, currentmoves.row1, 
            currentmoves.col2, currentmoves.row2)) {
            currentmoves.row1 = -1;
            currentmoves.col1 = -1;
        }
    }

    // gets random tile index
    function getRandTile () {
        return Math.floor(Math.random() * tileTypes);
    }

    // gets the row and col the x and y coordinates are over
    function getCell (x, y) {
        return new Point(parseInt(x/Constants.TILE_SIZE,10), 
            parseInt(y/Constants.TILE_SIZE,10) );
    }

    // gets the tiles cell data from col and row
    function getTile (x, y) {
        if (x < 0 || x > cols-1 || y < 0 || y > rows-1) {
            return -1;
        } else {
            return tiles[x][y];
        }
    }

    // returns a two-dimensional map of chain-lengths
    function getChains () {
        var x, y,
            chains = [];
        for (x = 0; x < cols; x++) {
            chains[x] = [];
            for (y = 0; y < rows; y++) {
                chains[x][y] = checkChain(x, y);
            }
        }
        return chains;
    }
    
    // fill the board with tiles
    this.fillBoard = function() {
        var x, y,
            type;
        tiles = [];
        for (x = 0; x < cols; x++) {
            tiles[x] = [];
            for (y = 0; y < rows; y++) {
                type = getRandTile();
                while ((type === getTile(x-1, y) &&
                        type === getTile(x-2, y)) ||
                       (type === getTile(x, y-1) &&
                        type === getTile(x, y-2))) {
                    type = getRandTile();
                }
                tiles[x][y] = type;
            }
        }
        // recursive fill if new board has no moves
        if (!hasMoves()) {
            this.fillBoard();
        }
        // update the game
        var addData = {type:'board:add', dataTiles : tiles};
        this.emit('board:update', addData);
    }

    // creates a copy of the tile board
    function getBoard () {
        var copy = [],
            x;
        for (x = 0; x < cols; x++) {
            copy[x] = tiles[x].slice(0);
        }
        return copy;
    }

    // returns true if (x1,y1) can be swapped with (x2,y2)
    // to form a new match
    function canSwap (x1, y1, x2, y2) {
        var type1 = getTile(x1,y1),
            type2 = getTile(x2,y2),
            chain;

        if (!isAdjacent(x1, y1, x2, y2)) {
            return false;
        }

        // temporarily swap tiles
        tiles[x1][y1] = type2;
        tiles[x2][y2] = type1;

        chain = (checkChain(x2, y2) > 2
              || checkChain(x1, y1) > 2);

        // swap back
        tiles[x1][y1] = type1;
        tiles[x2][y2] = type2;

        return chain;
    }

    // returns true if (x1,y1) is adjacent to (x2,y2)
    function isAdjacent (x1, y1, x2, y2) {
        var dx = Math.abs(x1 - x2),
            dy = Math.abs(y1 - y2);
        return (dx + dy === 1);
    }

    // returns true if at least one match can be made
    function hasMoves () {
        for (var x = 0; x < cols; x++) {
            for (var y = 0; y < rows; y++) {
                if (canTileMove(x, y)) {
                    return true;
                }
            }
        }
        return false;
    }

    // returns true if (x,y) is a valid position and if 
    // the tile at (x,y) can be swapped with a neighbor
    function canTileMove (x, y) {
        return ((x > 0 && canSwap(x, y, x-1 , y)) ||
                (x < cols-1 && canSwap(x, y, x+1 , y)) ||
                (y > 0 && canSwap(x, y, x , y-1)) ||
                (y < rows-1 && canSwap(x, y, x , y+1)));
    }

    // returns the number tiles in the longest chain that includes (x,y)
    function checkChain (x, y) {
        var type = getTile(x, y),
            left = 0, right = 0,
            down = 0, up = 0

        // look right
        while (type === getTile(x + right + 1, y)) {
            right++;
        }
        // look left
        while (type === getTile(x - left - 1, y)) {
            left++;
        }
        // look up
        while (type === getTile(x, y + up + 1)) {
            up++;
        }
        // look down
        while (type === getTile(x, y - down - 1)) {
            down++; 
        }
        return Math.max(left + 1 + right, up + 1 + down);
    }
});
