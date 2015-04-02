/*
* @author Daser Retnan <dretnan@acm.org>
* @date Thu 10 August 2014 08:50:32 PM GMT
* @Description: My Game Logic
*/

GAMECHAT.GAME.createGamePlay("APPID-3119528364", {

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
	    
	    $('body').prepend('<div id="splash"><svg id="start" class="splash"></svg><svg id="ready" class="splash"></svg><svg id="go" class="splash"></svg></div>');
	    
	    var gameArea = $('#gameArea');
	    // Setting up Remote (Top) Panel
		gameArea.append('<center><svg id="topPanel"></svg></center>');
		// Setting up Game Canvas Area
		gameArea.append('<center><svg id="gameCanvas"></svg></center>');
		gameArea.append('<center><div id="words"></div></center>');
		
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
	    myLibrary.initSplash();
	    
	    if(this.getOnlineUsers().count > 1){
	        myLibrary.showReady();
	    }else{
	        myLibrary.showStart();
	    }
		
		this.addEventListener("gc:remote-online", function(data){
		    console.log("remote user online")
		    console.log(data);
		    this.showReady();
		}, myLibrary);
		
		this.addEventListener("gc:remote-offline", function(data){
		    console.log("remote user offline")
		    console.log(data);
		    this.showStart();
		}, myLibrary);
	    
	    // Subscribe to gamechat's live or real-time model support
		this.getModels(myLibrary.gamechatModelHandler, myLibrary);
		
		try{
			this.listenTo("message", this.messageHandler, this);
			// Based on the example above, if you want to signal the other player to reset their gameboard
			// You send the message as follows:
			// this.triggerEvent('reset:game', "please reset the board");
			// remove the custom event as follows
			// this.stopListeningTo('reset:game');
		}catch(e){
			console.log(e.message);
		}
	},
	
	messageType: null,
	timeStamp: null,

	messageHandler: function(message){
	    
	    if(message == "propose"){
	        this.triggerEvent('message', "wait");
	        console.log("recieved propose")
	        myLibrary.showGo("user_action");
	        console.log("showing showGo expecting useraction")
	    }else if (message == "wait"){
	        // Expecting Remote User Action, expecting "ack"
	        myLibrary.showGo("waiting");
	        console.log("recieved wait")
	        console.log("showing the waiting screen, no user action enabled")
	    }else if(message == "ack"){
	        this.triggerEvent('message', "ok");
	        console.log("recieved ack")
	        console.log("triggering ok on remote device")
	    }else if(message == "ok"){
	        this.triggerEvent('message', "ok ok");
	        myLibrary.hideAll("game in progress");
	        console.log("recieved ok")
	        console.log("game should be visible now")
	    }else if(message == "ok ok"){
	        myLibrary.hideAll("game in progress");
	        console.log("recieved ok ok")
	        console.log("game should be visible now")
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