/*
 * The main application file, your game code begins here.
 */

//sdk imports
import device;
import ui.StackView as StackView;
//user imports
import src.GameScreen as GameScreen;
import src.Input as Input;
import src.lib.Enum as Enum;
import src.Constants as Constants;
import src.SoundController as SoundController;

/* Your application inherits from GC.Application, which is
 * exported and instantiated when the game is run.
 */
exports = Class(GC.Application, function (opts) {
	var rootView;
	var gamescreen;
	var sound;

	/* Run after the engine is created and the scene graph is in
	 * place, but before the resources have been loaded.
	 */
	this.initUI = function () {
	    gamescreen = new GameScreen();

		this.view.style.backgroundColor = '#000000';

		// Create a stackview of size 320x480, then scale it to fit horizontally
		// Add a new StackView to the root of the scene graph
	    rootView = new StackView({
			superview: this,
			x: 0,
			y: 0,
			width: Constants.SCREEN_WIDTH,
			height: Constants.SCREEN_HEIGHT,
			clip: true,
		});

        SoundController.getSound().play('levelmusic');
		rootView.push(gamescreen);
		gamescreen.emit('app:start');

		/* When the game screen has signalled that the game is over,
		 * show the title screen so that the user may play the game again.
		 */
		gamescreen.on('gamescreen:end', function () {
			gamescreen.emit('app:start');
		});

		// set up input
		this.setupInput();
	};

	// when user presses the screen
	this.onScreenPressed = function (x, y) {
		gamescreen.onPressed(x, y);
	}

	// gets the users touch input 
	this.setupInput = function () {
		this.inputHelper = new Input({
			superview: this.view,
			width: this.view.style.width,
			height: this.view.style.height,
			zIndex: 10000
		});
		
        this.inputHelper.on("InputStart", function (e) {
			this.onScreenPressed(e.srcPoint.x, e.srcPoint.y);
		}.bind(this));
	}

	/* Executed after the asset resources have been loaded.
	 * If there is a splash screen, it's removed.
	 */
	this.launchUI = function () {};
});
