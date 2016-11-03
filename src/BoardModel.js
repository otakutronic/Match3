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
		this.updateMoves(-1, -1);
	};

    // when the play clicks the board
	this.onPressed = function(x, y) {
        y -= Constants.BOARD_OFFSET;

        if(y < 0) return;

        // set the new moves to the selected grid cell
		var cell = this.getCell(x, y);
        this.updateMoves(cell.x, cell.y);
        
        // swap
		this.trySwap(currentmoves);
	}

	// update the moves
	this.updateMoves = function (col, row) {
        currentmoves.row1 = currentmoves.row2;
        currentmoves.col1 = currentmoves.col2;
        currentmoves.row2 = row;
        currentmoves.col2 = col;

        // unset if not adjacent  
        if (!this.isAdjacent(currentmoves.col1, currentmoves.row1, 
        	currentmoves.col2, currentmoves.row2)) {
            currentmoves.row1 = -1;
            currentmoves.col1 = -1;
        }
    }

    // try the swap of two board pieces
    this.trySwap = function (moves) {	
        // get the board tiles
    	var tile1 = this.getTile(moves.col1, moves.row1);
        var tile2 = this.getTile(moves.col2, moves.row2);

        if(tile1 != -1 && tile2 != -1) {
            // swap the pieces
		    this.swapPieces(moves.col1, moves.row1, moves.col2, moves.row2);
        }
        // update the game
        var selectData = {type:'board:select', x: moves.col2, y: moves.row2};
        this.emit('board:update', selectData);
	}

	// swap two pieces
	this.swapPieces = function (x1, y1, x2, y2) {
        if(this.canSwap(x1, y1, x2, y2)){
            // update the game
            var swapData = {type:'board:goodswap', x1: x1, y1: y1, 
                x2: x2, y2: y2};
            this.emit('board:update', swapData);

            var type1 = this.getTile(x1, y1);
            var type2 = this.getTile(x2, y2);

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

     // gets random tile index
	this.getRandTile = function () {
        return Math.floor(Math.random() * tileTypes);
    }

    // gets the row and col the x and y coordinates are over
	this.getCell = function (x, y) {
		return new Point(parseInt(x/Constants.TILE_SIZE,10), 
            parseInt(y/Constants.TILE_SIZE,10) );
	}

    // gets the tiles cell data from col and row
    this.getTile = function (x, y) {
        if (x < 0 || x > cols-1 || y < 0 || y > rows-1) {
            return -1;
        } else {
            return tiles[x][y];
        }
    }

    // returns a two-dimensional map of chain-lengths
    this.getChains = function() {
        var x, y,
            chains = [];
        for (x = 0; x < cols; x++) {
            chains[x] = [];
            for (y = 0; y < rows; y++) {
                chains[x][y] = this.checkChain(x, y);
            }
        }
        return chains;
    }

    this.fillBoard = function () {
        var x, y,
            type;
        tiles = [];
        for (x = 0; x < cols; x++) {
            tiles[x] = [];
            for (y = 0; y < rows; y++) {
                type = this.getRandTile();
                while ((type === this.getTile(x-1, y) &&
                        type === this.getTile(x-2, y)) ||
                       (type === this.getTile(x, y-1) &&
                        type === this.getTile(x, y-2))) {
                    type = this.getRandTile();
                }
                tiles[x][y] = type;
            }
        }
        // recursive fill if new board has no moves
        if (!this.hasMoves()) {
            this.fillBoard();
        }
        // update the game
        var addData = {type:'board:add', dataTiles : tiles};
        this.emit('board:update', addData);
    }

    // creates a copy of the tile board
    this.getBoard = function () {
        var copy = [],
            x;
        for (x = 0; x < cols; x++) {
            copy[x] = tiles[x].slice(0);
        }
        return copy;
    }

    // returns true if (x1,y1) can be swapped with (x2,y2)
    // to form a new match
    this.canSwap = function (x1, y1, x2, y2) {
        var type1 = this.getTile(x1,y1),
            type2 = this.getTile(x2,y2),
            chain;

        if (!this.isAdjacent(x1, y1, x2, y2)) {
            return false;
        }

        // temporarily swap tiles
        tiles[x1][y1] = type2;
        tiles[x2][y2] = type1;

        chain = (this.checkChain(x2, y2) > 2
              || this.checkChain(x1, y1) > 2);

        // swap back
        tiles[x1][y1] = type1;
        tiles[x2][y2] = type2;

        return chain;
    }

    // returns true if (x1,y1) is adjacent to (x2,y2)
    this.isAdjacent = function (x1, y1, x2, y2) {
        var dx = Math.abs(x1 - x2),
            dy = Math.abs(y1 - y2);
        return (dx + dy === 1);
    }

    // returns true if at least one match can be made
    this.hasMoves = function () {
        for (var x = 0; x < cols; x++) {
            for (var y = 0; y < rows; y++) {
                if (this.canTileMove(x, y)) {
                    return true;
                }
            }
        }
        return false;
    }

    // returns true if (x,y) is a valid position and if 
    // the tile at (x,y) can be swapped with a neighbor
    this.canTileMove = function (x, y) {
        return ((x > 0 && this.canSwap(x, y, x-1 , y)) ||
                (x < cols-1 && this.canSwap(x, y, x+1 , y)) ||
                (y > 0 && this.canSwap(x, y, x , y-1)) ||
                (y < rows-1 && this.canSwap(x, y, x , y+1)));
    }

    // returns the number tiles in the longest chain that includes (x,y)
    this.checkChain = function (x, y) {
        var type = this.getTile(x, y),
            left = 0, right = 0,
            down = 0, up = 0

        // look right
        while (type === this.getTile(x + right + 1, y)) {
            right++;
        }
        // look left
        while (type === this.getTile(x - left - 1, y)) {
            left++;
        }
        // look up
        while (type === this.getTile(x, y + up + 1)) {
            up++;
        }
        // look down
        while (type === this.getTile(x, y - down - 1)) {
            down++; 
        }
        return Math.max(left + 1 + right, up + 1 + down);
    }

    // reset up the board
    this.reset = function () {
        // update the game
        var resetData = {type:'board:reset'};
        this.emit('board:update', resetData);
        // reset board
        this.fillBoard();
        this.updateMoves(-1, -1);
    }

	this.check = function() {
        var chains = this.getChains(), 
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
                       tile : this.getTile(x,y)};
                    this.emit('board:update', matchData);
                } else if (gaps[x] > 0) {
                    tiles[x][y + gaps[x]] = this.getTile(x, y);
                    // update the game
                    var shiftData = {type:'board:shift', toX : x, toY : y + gaps[x], 
                       fromX : x, fromY : y, tile : this.getTile(x,y)};
                    this.emit('board:update', shiftData); 
                }
            }
            var tileHeight = Constants.SCREEN_WIDTH / Constants.BOARD_COLS;
            // fill from top
            for (y = 0; y < gaps[x]; y++) {
                // update the game
                var addData = {type:'board:addTile', x: x, y: y, tile: this.getRandTile(), offset: tileHeight * gaps[x]};
                this.emit('board:update', addData);
                tiles[x][y] = addData.tile;
            }
        }
        if (hadChains) {
            // reset if no more moves
            if (!this.hasMoves()) {
                this.reset();
            }
        }
    }
});
