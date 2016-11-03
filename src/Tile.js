import ui.View;
import ui.ImageView;
import ui.resource.Image as Image;
import math.geom.Point as Point;
import src.lib.Enum as Enum;
import src.Constants as Constants;

exports = Class(ui.View, function (supr) {
	var type = 0;
	var col = 0;
	var row = 0;
    var moving = false;

    var tileImages = [new Image({url: "resources/images/tiles/rabbit.png"}),
		new Image({url: "resources/images/tiles/monkey.png"}),
		new Image({url: "resources/images/tiles/giraffe.png"}),
		new Image({url: "resources/images/tiles/pig.png"}),
		new Image({url: "resources/images/tiles/snake.png"}),
		new Image({url: "resources/images/tiles/parrot.png"}),
        new Image({url: "resources/images/tiles/elephant.png"}),
        new Image({url: "resources/images/tiles/hippo.png"}),
        new Image({url: "resources/images/tiles/panda.png"})];

	this.init = function (opts) {
		opts = merge(opts, {
			width:	tileImages[0].getWidth(),
			height: tileImages[0].getHeight()
		});

		supr(this, 'init', [opts]);

		this.build();
	};

	// set the tiles type, col and row
	this.setTile = function (col, row, type) {
		this.col = col;
		this.row = row;
		this.type = type;
		this._tileview.setImage(tileImages[type]);
	};

	// gets the tiles pos from the col and row
	this.cellPos = function () {
		return new Point(this.col * Constants.TILE_SIZE, 
			(this.row * Constants.TILE_SIZE) + Constants.BOARD_OFFSET);
	};

	// moves the tile if not in the correct position
	this.onUpdate = function () {
		this.moving = false;
		//  down
		if (this.style.y < this.cellPos().y) {
			this.style.y += Constants.TILE_SPEED;
			if (this.style.y > this.cellPos().y) {
				this.style.y = this.cellPos().y;
			}
			this.moving = true;
			// up
		} else if (this.style.y > this.cellPos().y)  {
			this.style.y -= Constants.TILE_SPEED;
			if (this.style.y < this.cellPos().y) {
				this.style.y = this.cellPos().y;
			}
			this.moving = true;
			// right
		} else if (this.style.x < this.cellPos().x) {
			this.style.x += Constants.TILE_SPEED;
			if (this.style.x > this.cellPos().x) {
				this.style.x = this.cellPos().x;
			}
			this.moving = true;
			// left
		} else if (this.style.x > this.cellPos().x) {
			this.style.x -= Constants.TILE_SPEED;
			if (this.style.x < this.cellPos().x) {
				this.style.x = this.cellPos().x;
			}
			this.moving = true;
		}
	}

	// Layout
	this.build = function () {
		this._inputview = new ui.View({
			superview: this,
			clip: false,
			x: 0,
			y: 0,
			width: Constants.TILE_SIZE,
			height: Constants.TILE_SIZE,
		});

		this._tileview = new ui.ImageView({
			superview: this._inputview,
			image: tileImages[0],
			x: 0,
			y: 0,
			width: Constants.TILE_SIZE,
			height: Constants.TILE_SIZE
		});
	};
});
