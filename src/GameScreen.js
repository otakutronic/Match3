/*
 * The game screen is a singleton view that consists of
 * a scoreboard and a match 3 game board.
 */
import animate;
import ui.View;
import ui.ImageView;
import ui.TextView;
import src.BoardModel as BoardModel;
import src.BoardView as BoardView;
import src.Selector as Selector;
import src.lib.Enum as Enum;
import src.Constants as Constants;

var score = 0;
var high_score = 0;
var match_value = 1;
var game_on = false;
var countdown_secs = Constants.TIME_LIMIT / 1000;
var lang = 'en';
var boardModel;
var boardView;
var selector;

/* The GameScreen view is a child of the main application.
 * By adding the scoreboard and the molehills as it's children,
 * everything is visible in the scene graph.
 */
exports = Class(ui.View, function (supr) {

	this.init = function (opts) {
		opts = merge(opts, {
			x: 0,
			y: 0,
			width: 320,
			height: 480,
		});

		supr(this, 'init', [opts]);

		this.build();
	};

    // when the user presses the screen
	this.onPressed = function(x, y) {
		if(boardView.state == boardView.playStates().still) {
			boardModel.onPressed(x, y);
		}
	}

	// Layout the scoreboard and gem board.
	this.build = function () {
		/* The start event is emitted from the start button via the main application.
		 */
		this.on('app:start', start_game_flow.bind(this));
       
		boardView = new BoardView();
		this.addSubview(boardView);
		boardView.on('board:update', bind(this, function (args) {
			on_board_update(this, args);
		}));

		// add board and listener
		boardModel = new BoardModel();
		boardModel.on('board:update', bind(this, function (args) {
			on_board_update(this, args);
		}));

		// fill the bard with tiles
        boardModel.fillBoard();
	
        // add selector
		selector = new Selector();
		this.addSubview(selector);

		/* The scoreboard displays the "ready, set, go" message,
		 * the current score, and the end game message. We'll set
		 * it as a hidden property on our class since we'll use it
		 * throughout the game.
		 */
		this._scoreboard = new ui.TextView({
			superview: this,
			x: 0,
			y: 15,
			width: 320,
			height: 50,
			autoSize: false,
			size: 38,
			verticalAlign: 'middle',
			horizontalAlign: 'center',
			wrap: false,
			color: '#000000'
		});

		//Set up countdown timer
		this._countdown = new ui.TextView({
			superview: this._scoreboard,
			visible: false,
			x: 260,
			y: -5,
			width: 50,
			height: 50,
			size: 24,
			color: '#000000',
			opacity: 0.7
		});
	};
});

/*
 * Game play
 */

// Updates the game movement
function update_game () {
	boardView.onUpdate();
}

// Update from baord
function on_board_update (obj, args) {
	if (args.type == 'board:match') {
		score = score + match_value; 
		obj._scoreboard.setText(score.toString());
		boardView.removeTile(args.x, args.y);
	} else if (args.type == 'board:select') {
		selector.setSelector(args.x, args.y);
	} else if (args.type == 'board:add') {
		boardView.fillBoard(args.dataTiles);
	} else if (args.type == 'board:goodswap') { 
		boardView.trySwap(args.x1, args.y1, args.x2, args.y2, true);
	} else if (args.type == 'board:badswap') {
		boardView.trySwap(args.x1, args.y1, args.x2, args.y2, false);
	} else if (args.type == 'board:check') {
		boardModel.check();
	} else if (args.type == 'board:shift') {
		boardView.shiftTiles(args.toX, args.toY, args.fromX, args.fromY, args.tile);
	} else if (args.type == 'board:addTile') {
		boardView.addTile(args.x, args.y, args.tile, args.offset);
	} else if (args.type == 'board:reset') {
		boardView.reset();
	}
}

// Manages the intro animation sequence before starting game.
function start_game_flow () {
	var that = this;

	animate(that._scoreboard).wait(1000)
		.then(function () {
			that._scoreboard.setText(text.READY);
		}).wait(1500).then(function () {
			that._scoreboard.setText(text.SET);
		}).wait(1500).then(function () {
			that._scoreboard.setText(text.GO);
			game_on = true;
			play_game.call(that);
		});
}

// play the game
function play_game () {
	var i = setInterval(update_game.bind(this), 30);
    var j = setInterval(update_countdown.bind(this), 1000);

	setTimeout(bind(this, function () {
		game_on = false;
		clearInterval(i);
		clearInterval(j);
		boardView.state = boardView.playStates().locked;
		setTimeout(end_game_flow.bind(this), 1000);
		this._countdown.setText(":00");
	}), Constants.TIME_LIMIT);

	//Make countdown timer visible, remove start message if still there.
	setTimeout(bind(this, function () {
		this._scoreboard.setText(score.toString());
		this._countdown.style.visible = true;
	}), 0);

	//Running out of time! Set countdown timer red.
	setTimeout(bind(this, function () {
		this._countdown.updateOpts({color: '#CC0066'});
	}), Constants.TIME_LIMIT * 0.75);
}

// Updates the countdown timer, pad out leading zeros.
function update_countdown () {
	countdown_secs -= 1;
	this._countdown.setText(":" + (("00" + countdown_secs).slice(-2)));
}

// Check for high-score and play the ending animation.
function end_game_flow () {
	
	this._countdown.setText(''); //clear countdown text
	//resize scoreboard text to fit everything
	this._scoreboard.updateOpts({
		text: '',
		x: 10,
		fontSize: 17,
		verticalAlign: 'top',
		textAlign: 'left',
		multiline: true
	});

	end_msg = text.END_MSG_START + score; 
	if(score > high_score) {
		end_msg += " " + text.HIGH_SCORE;
        high_score = score;
	} else {
		end_msg += " " + text.NO_HIGH_SCORE;
	}

	this._scoreboard.setText(end_msg);

	//slight delay before going back 
	setTimeout(emit_endgame_event.bind(this), 2000);
}

/* Tell the main app to switch back to the title screen.
 */
function emit_endgame_event () {
	this.emit('gamescreen:end');
	reset_game.call(this);
}

/* Reset game counters and assets.
 */
function reset_game () {
	boardModel.reset();
	selector.reset();
	score = 0;
	countdown_secs = Constants.TIME_LIMIT / 1000;
	this._scoreboard.setText('');
	this._scoreboard.updateOpts({
		x: 0,
		fontSize: 38,
		verticalAlign: 'middle',
		textAlign: 'center',
		multiline: false
	});
	this._countdown.updateOpts({
		visible: false,
		color: '#000000'
	});
}


var localized_strings = {
	en: {
		READY: "Ready ...",
		SET: "Set ...",
		GO: "",
		END_MSG_START: "Your score: ",
		NO_HIGH_SCORE: "Not hi score.",
		HIGH_SCORE: "New hi score!"
	}
};

//object of strings used in game
var text = localized_strings[lang.toLowerCase()];
