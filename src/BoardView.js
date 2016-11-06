import ui.View;
import ui.ImageView;
import ui.resource.Image as Image;
import src.SoundController as SoundController;
import src.Tile as Tile;
import math.geom.Point as Point;
import src.lib.Enum as Enum;
import src.Constants as Constants;

exports = Class(ui.View, function (supr) {

	var currentmoves = { col1: 0, row1: 0, col2: 0, row2: 0 };
    var states = { still: 0, swap: 1, drop: 2, locked: 3 };
	var state = states.still;
	var invalidMove;
	var tilesMoving;
	var removeMatches;
	var tiles = [];
    var cols;
    var rows;

	var board_img = new Image({url: "resources/images/ui/board.png"});

	this.init = function (opts) {
		opts = merge(opts, {
			width:	board_img.getWidth(),
			height: board_img.getHeight()
		});

		supr(this, 'init', [opts]);

        cols = Constants.BOARD_COLS;
        rows = Constants.BOARD_ROWS;

        this.state = states.still;
        tilesMoving = false;
        invalidMove = false;
        removeMatches = false;

		this.build();
		updateMoves(-1, -1);
	};

	// Layout
	this.build = function () {
		this._inputview = new ui.View({
			superview: this,
			clip: true,
			x: 0,
			y: 0,
			width: Constants.SCREEN_WIDTH,
			height: Constants.SCREEN_HEIGHT
		});

		this._boardview = new ui.ImageView({
			superview: this._inputview,
			image: board_img,
			x: 0,
			y: 0,
			width: Constants.SCREEN_WIDTH,
            height: Constants.SCREEN_HEIGHT
		});
	};

    // gets the board states
    this.playStates = function () {
        return states;
    }

    // call this to set board to swap 
    this.onPressed = function (x1, y1, x2, y2, matchType) { 
        updateMoves(x1, y1);
        updateMoves(x2, y2);
        invalidMove = !matchType;
        removeMatches = !invalidMove;
        this.swapPieces(x1, y1, x2, y2);
    }

    // swap two pieces
    this.swapPieces = function (x1, y1, x2, y2) {
        this.state = states.swap;

        // get the board tiles
        var tile1 = getTile(x1, y1);
        var tile2 = getTile(x2, y2);

        // swap row and col values
        var temptile = tile1;
        var tempCol = tile1.col;
        var tempRow = tile1.row;

        tile1.setTile(tile2.col, tile2.row, tile1.type);
        tile2.setTile(tempCol, tempRow, tile2.type);

        // swap array positions
        tiles[tile1.col][tile1.row] = tile1;
        tiles[tile2.col][tile2.row] = tile2;
    }

    // add a tiles to the board
    this.fillBoard = function (boardTiles) {
        for (x = 0; x < cols; x++) {
            tiles[x] = [];
            for (y = 0; y < rows; y++) {
                this.addTile(x, y, boardTiles[x][y], Constants.SCREEN_HEIGHT);
            }
        }
        this.state = states.drop;
    }

    // add a tile to the board
    this.addTile = function (col, row, type, space) {
        var tile = new Tile();
        tile.setTile(col, row, type);
        tile.style.x = (col * Constants.TILE_SIZE); 
        tile.style.y = (row * Constants.TILE_SIZE) + Constants.BOARD_OFFSET - space; 
        this.addSubview(tile);
        tiles[col][row] = tile;
        this.state = states.drop;
    }

    // remove a tile to the board
    this.removeTile = function (col, row) {
        var tile = getTile(col,row);
        this.removeSubview(tile);
        tiles[col][row] = null;
        this.state = states.drop;
    }

    // reset up the board
    this.reset = function () {
        for (x = 0; x < cols; x++) {
            for (y = 0; y < rows; y++) {
                this.removeTile(x, y);
            }
        }
        this.state = states.drop;
    }

    // update tile to fall down to new place 
    this.shiftTiles = function (toX, toY, fromX, fromY, tile) {
        tiles[toX][toY] = getTile(fromX, fromY);
        tiles[toX][toY].setTile(fromX, toY, tile);
        this.state = states.drop;
    }

    // main loop
    this.onUpdate = function () {
        switch(this.state) {
            case states.drop:
            this.updateDrop();
            break;
            case states.swap:
            this.updateSwap();
            break;
            default:
            this.updateStill();
            break;
        }
    }

    // updates swapping
    this.updateSwap = function () {
        moveTiles();
        if(tilesMoving == false) {
            this.state = states.still;
        }
    }

    // updates still
    this.updateStill = function () {
        if(invalidMove == true) {
            this.swapPieces(currentmoves.col1, currentmoves.row1, 
                currentmoves.col2, currentmoves.row2);
            invalidMove = false;
            SoundController.getSound().play('badswap');
        } else if(removeMatches) {
            var checkData = {type:'board:check'};
            this.emit('board:update', checkData);
            SoundController.getSound().play('match');
            removeMatches = false;
        }
    }

    // updates falling
    this.updateDrop = function () {
        moveTiles();
        if(tilesMoving == false) {
            this.state = states.still;
            var checkData = {type:'board:check'};
            this.emit('board:update', checkData);
        }
    }

    // moves the tiles 
    function moveTiles () {
        tilesMoving = false;
        for(var col = 0; col < cols; col++) {
            for(var row = 0; row < rows; row++) {
                if (tiles[col][row] != null) {
                    tiles[col][row].onUpdate();
                    if(tiles[col][row].moving) tilesMoving = true;
                }
            }
        }
    }

    // update the moves
    function updateMoves (col, row) {
        currentmoves.row1 = currentmoves.row2;
        currentmoves.col1 = currentmoves.col2;
        currentmoves.row2 = row;
        currentmoves.col2 = col;
    }

    // gets the row and col the x and y coordinates are over
    function getCell (x, y) {
        return new Point(parseInt(x/Constants.TILE_SIZE,10), 
            parseInt(y/Constants.TILE_SIZE,10) );
    }

    // gets the tile from col and row
    function getTile (x, y) {
        if (x < 0 || x > cols-1 || y < 0 || y > rows-1) {
            return -1;
        } else {
            return tiles[x][y];
        }
    }
});
