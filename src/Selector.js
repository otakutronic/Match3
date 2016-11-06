import ui.View;
import ui.ImageView;
import ui.resource.Image as Image;
import math.geom.Point as Point;
import src.lib.Enum as Enum;
import src.Constants as Constants;

exports = Class(ui.View, function (supr) {

	var selector_img = new Image({url: "resources/images/tiles/selector.png"});

	this.init = function (opts) {
		opts = merge(opts, {
			width:	selector_img.getWidth(),
			height: selector_img.getHeight()
		});

		supr(this, 'init', [opts]);
		this.build();

		// hide selector at first
		this.reset();
	};

	// Layout
	this.build = function () {
		this._inputview = new ui.View({
			superview: this,
			clip: false,
			x: 0,
			y: 0,
			width: Constants.TILE_SIZE,
			height: Constants.TILE_SIZE
		});

		this._selectorview = new ui.ImageView({
			superview: this._inputview,
			image: selector_img,
			x: 0,
			y: 0,
			width: Constants.TILE_SIZE,
			height: Constants.TILE_SIZE
		});
	};

	// hide up the selector
    this.reset = function () {
        this.setSelector(Constants.SCREEN_WIDTH*2, 0);
    }

    // positions the selector at the cell
    this.setSelector = function (col, row) {
        this._selectorview.style.x = (col * Constants.TILE_SIZE); 
        this._selectorview.style.y = (row * Constants.TILE_SIZE) + Constants.BOARD_OFFSET; 
    }
});
