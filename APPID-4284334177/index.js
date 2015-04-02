/*
* @author Daser Retnan <dretnan@acm.org>
* @date Thu 10 August 2014 08:50:32 PM GMT
* @Description: My Game Logic
*/

GAMECHAT.GAME.createGamePlay("APPID-4284334177", {

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
	    // $('#gameArea').remove();
	    var gameArea = $('#gameArea');
	    // Setting up Remote (Top) Panel
		gameArea.append('<center><svg id="topPanel"></svg></center>');
		// Setting up Game Canvas Area
		gameArea.append('<center><svg id="gameCanvas"></svg</center>');
	    this.canvasApp();
		
	},
	
	canvasApp: function(){

	    myLibrary.initGameTones();
	    myLibrary.setDimension(this.getScreen().getWidth(), this.getScreen().getHeight());
	    myLibrary.setUsers(this.getLocalUser(), this.getRemoteUser());
	    myLibrary.initStage();
	    myLibrary.initTopStage();
	    myLibrary.initBoxes();
	    myLibrary.setMupuntuContext(this);
	    
	    // Subscribe to gamechat's live or real-time model support
		this.getModels(myLibrary.gamechatModelHandler, myLibrary);
		
		try{
			//this.listenTo("reset:game", myLibrary.handlerGameResetMessage);
			// Based on the example above, if you want to signal the other player to reset their gameboard
			// You send the message as follows:
			// this.triggerEvent('reset:game', "please reset the board");
			// remove the custom event as follows
			// this.stopListeningTo('reset:game');
		}catch(e){
			console.log(e.message);
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