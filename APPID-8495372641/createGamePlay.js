/*
* @author Daser Retnan <dretnan@acm.org>
* @date Thu 10 August 2014 08:50:32 PM GMT
* @Description: My Game Logic
*/

GAMECHAT.GAME.createGamePlay("APPID-8495372645", {

	/*
	* @method init 
	* @param void
	* @return void
	* @Description init hook [Compulsory for all modules]
	*	this is loaded for the user in the chess namespace and the Developer is
	*	expected paint on the canvas here (get Gamestate between two users)
	*/ 
	init : function(){
	    
	   // console.log("console.log not working, functions are not called")
	    
	    this.removeSplash();
	    
	   // var canvasNode = document.createElement("div");
	   // canvasNode.setAttribute("id", "canvas");
	   // document.body.appendChild(canvasNode);
http://localhost:3001/editor#	    
	    myLibrary.setProperties({
			width: this.getScreen().getWidth(), 
			height: this.getScreen().getHeight(),
			localPlayer: this.getLocalUser(),
			remotePlayer: this.getRemoteUser(),
			canvasName: "gameArea",
		});
		
		// Initialize the Canvas
		myLibrary.initCanvas();
		// Subscribe to gamechat's live or real-time model support
		
// 		console.log("about to call fetchgamemodels")
		this.getModels(myLibrary.gamechatModelHandler, myLibrary);
// 		console.log("has called it already")
		
// 		alert("yo!");
		// Create an event
		try{
			this.listenTo('reset:game', myLibrary.handlerGameResetMessage, myLibrary);
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