/*
* @author Daser Retnan <dretnan@acm.org>
* @date Thu 10 August 2014 08:50:32 PM GMT
* @Description: My Game Logic
*/

GAMECHAT.GAME.createGamePlay("APPID-8495372645", {

	resetViewPort: function(){
		var gameArea = $('#gameArea'),
				widthToHeight = 5/6, //or 4/3 //check the trace code's code
				newWidth = (90 / 100 ) * this.getScreen().getWidth(),
				newHeight = (90 / 100 ) * this.getScreen().getHeight(),
				newWidthToHeight = newWidth / newHeight,
				newGameHeight, newGameWidth,
				screenHeight = this.getScreen().getHeight();
			

			if (newWidthToHeight > widthToHeight) {
				newWidth = newHeight * widthToHeight;
				// gameArea.style.height = newHeight + 'px';
				// gameArea.style.width = newWidth + 'px';
				gameArea.css('height', newHeight + 'px');
				gameArea.css('width', newWidth + 'px');
				newGameHeight = newHeight;
				newGameWidth = newWidth;
			} else {
				newHeight = newWidth / widthToHeight;
				gameArea.css('height', newWidth + 'px');
				gameArea.css('width', newHeight + 'px');
				newGameHeight = newWidth;
				newGameWidth = newHeight;
			}

		// gameArea.style.marginTop = (screenHeight - newGameHeight) / 2 + 'px';
		// gameArea.style.fontSize = (newGameWidth / 400) + 'em';
		gameArea.css('margin-top', (screenHeight - newGameHeight) / 2 + 'px');
		gameArea.css('font-size', (newGameWidth / 400) + 'em');

		return {gameAreaWidth: newGameWidth, gameAreaHeight: newGameHeight};
	},

	/*
	* @method init 
	* @param void
	* @return void
	* @Description init hook [Compulsory for all modules]
	*	this is loaded for the user in the chess namespace and the Developer is
	*	expected paint on the canvas here (get Gamestate between two users)
	*/ 
	init : function(){
	    	    
	    this.removeSplash();

	    var gameArea = $('#gameArea');

	    // Setting up Remote (Top) Panel
	    var remotePanel = '<div id="remotePanel"><div class="player" id="remotePlayer">' + this.getRemoteUser().displayName + '</div><div class="score" id="remoteScore">Score: 0</div></div>';
		gameArea.append(remotePanel);

		// Setting up Game Canvas Area
		gameArea.append('<div id="gameCanvas"></div');

		// Setting up Local (Bottom) Panel
		var localPanel = '<div id="localPanel"><div class="player" id="localPlayer">' + this.getLocalUser().displayName + '</div><div id="resetGame">RESET</div><div class="score" id="localScore">Score: 0</div></div>';
		gameArea.append(localPanel);

		// Get the Drawable Dimensions
		var gameAreaDimension = this.resetViewPort();
		var gameWidth = gameAreaDimension.gameAreaWidth;
		var gameHeight = Number.parseInt(gameAreaDimension.gameAreaHeight) * (80 / 100);
	    
	    // Initializing our custom library with needed parameters
	    myLibrary.setProperties({
			width: gameWidth, 
			height: gameHeight,
			localPlayer: this.getLocalUser(),
			remotePlayer: this.getRemoteUser(),
			canvasName: "gameCanvas",
		});
		
		// Initialize the Canvas
		myLibrary.initCanvas();

		// Subscribe to gamechat's live or real-time model support
		this.getModels(myLibrary.gamechatModelHandler, myLibrary);
		
		try{
			this.listenTo('reset:game', myLibrary.handlerGameResetMessage, myLibrary);
			// Based on the example above, if you want to signal the other player to reset their gameboard
			// You send the message as follows:
			// this.triggerEvent('reset:game', "please reset the board");
			// remove the custom event as follows
			// this.stopListeningTo('reset:game');
		}catch(e){
			// console.log(e.message);
		}
		
	},

	/*
	* @method sleep 
	* @param void
	* @return void
	* @Description The sleep hook [Compulsory for all modules]
	*	This method is called when user navigates away from the display
	*	GameChat calls wake() when user navigates back to gamescreen
	*/
	
	sleep : function (){
		
	},

	/*
	* @method wake 
	* @param void
	* @return void
	* @Description The wake hook [Compulsory for all modules]
	*	This method is called when user navigates back to the game screen
	*/
	
	wake : function (){

	},
	
	/*
	* @method die 
	* @parameter void
	* @return void
	* @Description The die hook [Compulsory for all modules]
	*	This method is called when user exits the app
	*	Developers should save game state here to avoid data loss.
	*/
	
	die : function (){

	},

});