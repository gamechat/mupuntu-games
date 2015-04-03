/*
* @author Daser Retnan <dretnan@acm.org>
* @date Thu 10 August 2014 08:50:32 PM GMT
* @Description: My Game Library
*/

(function (libraryName, global, definition) {

	global[libraryName] = definition($, _, Backbone);

})('myLibrary', this, function ($, _, Backbone) {

	"use strict";

	var myLibrary = {};
	
	var _gamestateModel, _scoreboardModel;
	var _prevModel; // Used for keeping track of previous model
	var _localUser, _remoteUser;
	
	var numberOfHiddenTreasures = 5;
	
	var MAX_COL = 5, MAX_ROW = 5;
	
	var _boxes = new Array(MAX_COL * MAX_ROW); //5 * 5 boxes;
	
	var deviceWidth = 1200, deviceHeight = 600;
	var stageWidth, stageHeight;
	var stage, topStage, boxWidth;
	var borderWidth = 1;
    var defaultColor = "#e8e8e8";
    var strokeColor = "#000";
    var localUserColor = "#96e38e", remoteUserColor = "#34abe4";
    var winColor = "#336633";
    var drawColor = "#ff56a2";
    var gameOverColor = "#ff5656";
    
    var localScoreObj = null;
    var remoteScoreObj = null;
    
    var top_local_cel, top_info_cel, top_remote_cel;
    
    var touchFlag = false;
    
    var mupuntuContext = null;
    
    var resetflag = false;

	myLibrary.sayHello = function(){
		alert("hello world");
	}
	
    myLibrary.initGameTones = function(){
		// init bunch of sounds if available
		
		if( _.isFunction($.ionSound) ){
		    $.ionSound({
    		    sounds: [
    		        {name: "beer_can_opening"},
    		        {name: "bell_ring"},
    		        {name: "door_bell"},
    		        {name: "cd_tray"}
    		    ],
    
    		    // main config
    		    path: ".sounds/",
    		    preload: true,
    		    multiplay: true,
    		    volume: 0.6
		    });
		}else{
		    console.log("No sound library (ion.sound.js) loaded");
		}
	}
	
    myLibrary.playTone = function(){
	    
	    if( _.isFunction($.ionSound) ){
	        // play sound
            $.ionSound.play("beer_can_opening");
	    }
	    
	}
	
	myLibrary.errorTone = function(){
	    if( _.isFunction($.ionSound) ){
	        // play sound
            $.ionSound.play("door_bell");
	    }
	}
	
	myLibrary.drawTone = function(){
	    if( _.isFunction($.ionSound) ){
	        // play sound
            $.ionSound.play("cd_tray");
	    }
	}
	
	myLibrary.winTone = function(){
	    if( _.isFunction($.ionSound) ){
	        // play sound
            $.ionSound.play("bell_ring");
	    }
	}
	
	myLibrary.setDimension = function(width, height){
		if(width > height){
            deviceWidth = height
            deviceHeight = height;
        }else{
            deviceHeight = width;
            deviceWidth =  width;
        }
        
        stageWidth = (80 / 100 ) * deviceWidth;
        stageHeight = (80 / 100 ) * deviceWidth;
        boxWidth = parseInt(stageWidth / MAX_COL), height = parseInt(stageWidth / MAX_COL);
	}
	
	myLibrary.setUsers = function(localUser, remoteUser){
	    _localUser = localUser;
		_remoteUser = remoteUser;
	}
	
	myLibrary.initStage = function(){
	   
	   var gameCanvas = $('#gameCanvas');
	   gameCanvas.css('height', stageWidth + 'px');
	   gameCanvas.css('width', stageHeight + 'px');
	   gameCanvas.addClass("gameCanvas");
	   stage = Snap("#gameCanvas");
	}
	
	myLibrary.getFontSizePx = function(){
		return (60 / 100) * myLibrary.getHeightOfTopStage();
	}
	
	myLibrary.getHeightOfTopStage = function(){
	    return (((70 / 100 ) * boxWidth) / 2);
	}
	
	myLibrary.initTopStage = function(){
	    
	   var topPanel = $('#topPanel');
	   topPanel.css('height', String(myLibrary.getHeightOfTopStage()) + 'px');
	   topPanel.css('width', boxWidth * MAX_COL + 'px');
	   topPanel.addClass("topPanel");
	   topStage = Snap("#topPanel");
	   myLibrary.clearTopStageAndRedraw();
	}
	
	
	
	myLibrary.clearTopStageAndRedraw = function(){
	    
	    topStage.clear();
	    
	    // Local Player
        top_local_cel = topStage.rect(0, 0, boxWidth,  myLibrary.getHeightOfTopStage(), 15).attr({
            fill: localUserColor, 
        });
        
        // Reset Game
        top_info_cel = topStage.circle(stageWidth / 2, myLibrary.getHeightOfTopStage() / 2, myLibrary.getHeightOfTopStage() / 2).attr({
            fill: winColor,
        });
        
        var offset = myLibrary.getFontSizePx() / 3;
        var resetTextObj = topStage.text( stageWidth / 2, myLibrary.getHeightOfTopStage() / 2 + offset, "S");
        resetTextObj.attr({
            stroke: "black", 
            strokeWidth: 0,
            font: String(myLibrary.getFontSizePx() / 1) + "px Helvetica, sans-serif",
            textAnchor: "middle",
            fill: "#fff"
        });
        
        // Remote Player
        top_remote_cel = topStage.rect(boxWidth * (MAX_COL - 1), 0, boxWidth,  myLibrary.getHeightOfTopStage(), 15).attr({
            fill: remoteUserColor, 
        });
        
	}
	
	
	myLibrary.initBoxes = function(){
	    
	    
	    var Context = myLibrary;
	    
	    for(var r = 0; r < MAX_ROW; r++){
	        for(var c = 0; c < MAX_COL; c++){
	            
	            _boxes[ (r * MAX_COL) + c] = stage.rect(c * boxWidth, r * boxWidth, boxWidth, boxWidth).attr({
                    fill: defaultColor, 
                    stroke: strokeColor, 
                    strokeWidth: borderWidth,
                    boxIndex: (r * MAX_COL) + c
                });
                
                 _boxes[ (r * MAX_COL) + c].mouseup(function(e){
            
                    if(touchFlag){
                        return;    
                    }
                    
                    touchFlag = true;
                    
                    var boxIndex = this.node.attributes['boxIndex'].value || this.node.attributes['boxIndex'].nodeValue;
                    boxIndex = Number(boxIndex);
                    
                    if(!Context.updateModelWithMove(boxIndex)){
                        // Undo Fill
                        // _boxes[boxIndex].animate({fill: defaultColor}, 0);
                    }
                    
                    touchFlag = false;
                });
	        }
	    }
	    
	}
	
	myLibrary.updateModelWithMove = function(position){
	    
	    if(!_.isObject(_gamestateModel)) throw new Error("initialize models first");

	    	var playerId = _gamestateModel.get('turn').player;

	    	var gameboard = _gamestateModel.get('gameboard');

	    	// Based on current state of the model
	    	var verdict = myLibrary.computeMoves();
	    	
	    	if(gameboard[position].status){
	    	    alert("Can't play");
	    	    return false;
	    	}

	    	if (playerId != _localUser.playerID || gameboard[position].status && 
	    		(verdict == 'WIN' || verdict == 'DRAW')) {
	    		if ( (verdict == 'WIN' || verdict == 'DRAW') ) {
	    		    myLibrary.flashMessage("GAME OVER");
	    		    alert("game over - reset the game");
	    		    // myLibrary.errorTone();
	    			return 0;
	    		}
	    		
	    		myLibrary.flashMessage("NOT YOUR MOVE");
	    		alert("Can't play");
	    		// myLibrary.errorTone();
	    		return false;
	    	}else{
	    		if ( (verdict == 'WIN' || verdict == 'DRAW') ) {
	    		    myLibrary.flashMessage("GAME OVER");
	    		    // alert("game over - reset the game");
	    		    // myLibrary.errorTone();
	    			return 0;
	    		}
	    	}
	    	
	       if(gameboard[position].p){
	           _boxes[position].animate({fill: localUserColor}, 1000)
	       }else{
	           _boxes[position].animate({fill: gameOverColor}, 1000)
	       }
	    	
	    	var gamemove = {};
	    	gamemove.gameboard = {};
	    	gamemove.gameboard[position] = {};
	    	gamemove.gameboard[position].status = true;
	    	gamemove.gameboard[position].player = playerId;
	    	gamemove.turn = {};
	    	gamemove.turn.player = _remoteUser.playerID;

	        // It's better to set all relevant fields in one pass that to do it 1-after another
	    	_gamestateModel.set(gamemove);

	    	// make a copy now *Hopping it's not coppied by reference
	    	_prevModel = _gamestateModel.toJSON();

	    	// Compute Win/Draw based on updated model
	    	verdict = myLibrary.computeMoves();

	    	if (verdict == "WIN") {

	    		var scoreboard = {};
	    		scoreboard.totalgames = _scoreboardModel.get('totalgames') + 1;
	    		scoreboard[playerId] = _scoreboardModel.get(playerId) + 1;
	    		// Update localuser scores on the server
	    		_scoreboardModel.set(scoreboard);

	    		// Oopse! The next guy should be me instead
	    		_gamestateModel.set('turn',{player: playerId});
	    		
	    		
	    		myLibrary.flashMessage("WIN");
	   // 		alert("You Win");
	    		myLibrary.updateUserScores();
                myLibrary.winTone();
                
                myLibrary._resetGameBoard();
                myLibrary.resetBoard();
                // mupuntuContext.triggerReset();
                myLibrary.setCurrentPlayerColor();
                
	    	}else if(verdict == "DRAW"){
	    	    myLibrary.flashMessage("DRAW");
	    		alert("Game is Draw");
	    		myLibrary.drawTone();
	    	}else{
	    	    myLibrary.setCurrentPlayerColor();
	    	    myLibrary.playTone();
	    	    // alert("Next Player");
	    	}
	    	return true;
	}
	
	myLibrary.setMupuntuContext = function(context){
	    mupuntuContext = context;
	}

	myLibrary.sayHello = function(){
		alert("hello world");
	}
	
	myLibrary.gamechatModelHandler = function(gamedata){
		   
    		_gamestateModel = gamedata.gamestate;
			_scoreboardModel = gamedata.scoreboard;

			if ( !_.has(gamedata.gamestate.toJSON(), 'gameboard') ) {
				// This is the first time the user starts the game
				myLibrary._pupulateGameStateModel();
			}

			if ( !_.has(gamedata.scoreboard.toJSON(), 'totalgames') ) {
				// This is the first time this user starts the game
				myLibrary._pupulateScoreBoardModel();
			}

			_prevModel = _gamestateModel.toJSON(); // very important if we ain't starting the moves

			_gamestateModel.onChangeEventListener("gameboard", myLibrary.processChange, myLibrary);
			
			// console.log("finished: gamechatModelHandler()");
			
			myLibrary.resetBoard();
			myLibrary.updateUserScores();
			myLibrary.setCurrentPlayerColor();
    }
    
    /**
	* Create the Database, first time users
	* in the virgin state: the two virtual players must trow a coin
	* The algorithm must be deterministic. we use playerIDs to know who to start the game
	* subsequently the winner is the next to start the game play
	* @params = {Object.localPlayerID, Object.remotePlayerID}
	*/

	myLibrary._pupulateGameStateModel = function(){

		// This is not a recommended approach
		// A recommended approach is to create a giant object and set() at once instead of in segments
		myLibrary._resetGameBoard();
		_gamestateModel.set('turn',{
			player: myLibrary._getWhoPlaysFirst(_localUser.playerID, _remoteUser.playerID),
		});
		console.log(_localUser);
		console.log("database created");
	}
	
	// Fresh GameBoard
	myLibrary._resetGameBoard = function(){
		_gamestateModel.set('gameboard', myLibrary._getGameBoard());
	}
	
	myLibrary._getGameBoard = function(){

		var gameboard = {};

		for (var i = 0; i < MAX_COL * MAX_ROW; i++) {
			gameboard[i] = {};
			gameboard[i].status = false
			gameboard[i].player = null;
			gameboard[i].p = false; //p = present
		}
		
		var locationOfTreasuresIndex = myLibrary.getNumberOfHiddenTreasuresRandomIndexes();
		
		for(var i = 0; i < numberOfHiddenTreasures; i++){
		    gameboard[locationOfTreasuresIndex[i]].p = true;
		}

		return gameboard;
	}
	
	myLibrary.getNumberOfHiddenTreasuresRandomIndexes = function(){
	    
	    var temp = new Array(MAX_COL * MAX_ROW); //5 * 5 boxes;
	    
	    var counter = 0;
	    
	    var result = new Array();
	    
	    for(var i = 0; i < (MAX_COL * MAX_ROW); i++ ) temp[i] = false;
	    
	    var selectedIndex;
	    
	    while(counter < numberOfHiddenTreasures){
	        selectedIndex = _.random(0, (MAX_COL * MAX_ROW) - 1);
	        if(temp[selectedIndex]){
	            continue;
	        }else{
	            result.push(selectedIndex);
	            counter++;
	            temp[selectedIndex] = true;
	        }
	    }
	    
	    return result;
	}
	
	myLibrary._getWhoPlaysFirst = function(localPlayerID, remotePlayerID){
    	/*
		* A mini deterministic algorithm to determine who's to play first
		* Throwing the coin (2 possible state)
		*/
		var localChars = localPlayerID.split('');
		var remoteChars = remotePlayerID.split('');
		var localNumericEqu = 0;
		var remoteNumericEqu = 0;

		for (var i = 0; i < localChars.length; i++) {
			localNumericEqu += localChars[i].charCodeAt();
			remoteNumericEqu += remoteChars[i].charCodeAt();
		}

		if ( (localNumericEqu - remoteNumericEqu) > 0 ) {
			return localPlayerID;
		}else{
			return remotePlayerID;
		}
    }
	
	myLibrary._pupulateScoreBoardModel = function(){
		_scoreboardModel.set('totalgames', 0);
		// Use playerId has a key
		_scoreboardModel.set(_localUser.playerID, 0);
		_scoreboardModel.set(_remoteUser.playerID, 0);
	}
	
	myLibrary.processChange = function(data){
	        
	        var counter = 0;
	        
	        for (var prop in data[0]) {
                if( data[0][prop].status == false){
	                counter++;
	            }
	        }
            
            
            if(counter == 25){
                console.log("we have a new board");
                _prevModel.gameboard = _.has(data[0],'gameboard') ? data[0].gameboard : data[0];
                myLibrary.resetBoard();
                myLibrary.updateUserScores(true);
                myLibrary.setCurrentPlayerColor();
            }else{
                console.log("new server data");
                console.log(data);
        		var response = myLibrary.objDiff(_prevModel.gameboard, data[0]);
        		console.log("diff with prevModel data:")
        		console.log(response);
        		console.log("old or prev model:");
        		console.log(_prevModel.gameboard);
        		if (response[0][_.keys(response[0])[0]].status){
        		    myLibrary.updateRemoteUsersMove(_.keys(response[0])[0]);
        		    resetflag = false;
        		}
            }
            
                
    }
    
    myLibrary.objDiff = function(oldModel, newModel){

    		var result = [], tmp;
    		for(var key in newModel){
    			if ( !_.isEqual(newModel[key], oldModel[key]) ) {
    				(tmp = {})[key] = newModel[key];
    				result.push(tmp);
    			}
    		}
    		return result;
    }
    
    
    myLibrary.resetBoard = function(){

			// TODO, to Avoid accumulated memory leaks
            
            var gameboard = _gamestateModel.get("gameboard");    
            
            
            for(var r = 0; r < 5; r++){
    	        for(var c = 0; c < 5; c++){
    	            
    	            if ( !gameboard[(r * MAX_COL) + c].status) {
    	                _boxes[ (r * MAX_COL) + c].animate({fill: defaultColor}, 1000);
    	            }else{
    	                
    	                if ( gameboard[(r * MAX_COL) + c].player == _localUser.playerID){
    	                    
    	                    if(gameboard[(r * MAX_COL) + c].p)
    	                    {
    	                        _boxes[ (r * MAX_COL) + c].animate({fill: localUserColor}, 1000);    
    	                    }else{
    	                        _boxes[ (r * MAX_COL) + c].animate({fill: gameOverColor}, 1000);
    	                    }
    	                    
    	                }else{
    	                    
    	                    if(gameboard[(r * MAX_COL) + c].p)
    	                    {
    	                        _boxes[ (r * MAX_COL) + c].animate({fill: remoteUserColor}, 1000);
    	                    }else{
    	                        _boxes[ (r * MAX_COL) + c].animate({fill: gameOverColor}, 1000);
    	                    }
    	                    
    	                    
    	                }
    	                
    	            }
                    
    	        }
    	    }
	}
	
	myLibrary.updateUserScores  = function(remoteFlag){
	    
	    myLibrary.clearTopStageAndRedraw();
	    
	    var offset = myLibrary.getFontSizePx() / 3;
        
	    var localScoreText = _scoreboardModel.get(_localUser.playerID);

	    localScoreObj = topStage.text((boxWidth / 2), (myLibrary.getHeightOfTopStage() / 2) + offset, String(localScoreText));
	    localScoreObj.attr({
            stroke: "#fff", 
            strokeWidth: borderWidth,
            font: String(myLibrary.getFontSizePx()) + "px Helvetica, sans-serif",
            textAnchor: "middle",
            fill: "#fff"
        });
        
        var remoteScoreText = _scoreboardModel.get(_remoteUser.playerID);
        
        if(remoteFlag){
            remoteScoreText = remoteScoreText + 1;
        }
	    
        remoteScoreObj = topStage.text(stageWidth - (boxWidth / 2), (myLibrary.getHeightOfTopStage() / 2) + offset, String(remoteScoreText));
	    remoteScoreObj.attr({
            stroke: "#fff", 
            strokeWidth: borderWidth,
            font: String(myLibrary.getFontSizePx()) + "px Helvetica, sans-serif",
            textAnchor: "middle",
            fill: "#fff"
        }); 
	}
	
	myLibrary.setCurrentPlayerColor = function(){
	    
	    var playerId = _gamestateModel.get('turn').player;
	    
	    if(_localUser.playerID == playerId){
            top_info_cel.animate({fill: localUserColor}, 1000);
	    }else{
	        top_info_cel.animate({fill: remoteUserColor}, 1000);
	    }
	    
	}
	
	myLibrary.updateRemoteUsersMove = function(position){
	       
	       var gamestate = _gamestateModel.get('gameboard');
	       
	       if(gamestate[position].p){
	           _boxes[position].animate({fill: remoteUserColor}, 1000)
	       }else{
	           _boxes[position].animate({fill: gameOverColor}, 1000)
	       }

	        // Compute Win/Draw based on the updated model and report to localuser
	        var verdict = myLibrary.computeMoves();

	        if (verdict == "WIN") {
	            myLibrary.flashMessage("WIN");
	            myLibrary.updateUserScores(true);
	            myLibrary.winTone();
	            alert("There is a win")
	    	}else if(verdict == "DRAW"){
	    	    // myLibrary.flashMessage("DRAW");
	    	    // myLibrary.drawTone();
	    	    // There are odd number of treasures. No draws
	    	}else{
	    	    myLibrary.setCurrentPlayerColor();
	    	    myLibrary.playTone();
	    	}
	}
	
	
	myLibrary.computeMoves = function(){

	    	var flag, flag_, markedPositions = 0;

	    	var gamestate = _gamestateModel.get('gameboard');
	    	
	    	flag = 0, flag_ = 0;

	    	// Check for a win state
	    	for (var r = 0; r < MAX_ROW; r++) {
				for (var c = 0; c < MAX_COL; c++) {
				    
					if (gamestate[ (r * MAX_COL) + c].status && 
					gamestate[ (r * MAX_COL) + c].player == _localUser.playerID &&
					gamestate[ (r * MAX_COL) + c].p) {
					    flag++;
					}
					if (gamestate[ (r * MAX_COL) + c].status && 
					gamestate[ (r * MAX_COL) + c].player == _remoteUser.playerID &&
					gamestate[ (r * MAX_COL) + c].p) {
					    flag_++;
					}
					
				}
				
				// if (flag == 3 || flag_ == 3) return "WIN";
			}
			
			console.log("total treasure found: ");
			console.log(flag + flag_);
			
			if( (flag + flag_ ) == numberOfHiddenTreasures){
				    return "WIN";
			}

            // NO DRAW FOR ODD NUMBER OF TREASURES
			// Check if it's a draw
			/*
			_positions.forEach(function(position, index){
				if(gamestate[position].status) markedPositions++;
			});*/

			// if (markedPositions == 8) return "DRAW";
			return "CONTINUE";
	}
	
	
	myLibrary.flashMessage = function(message){
	    
	    if(message == "GAME OVER"){
	        top_info_cel.animate({fill: gameOverColor}, 1000);
	    }else if(message == "NOT YOUR MOVE"){
	        top_info_cel.animate({fill: remoteUserColor}, 1000);
	    }else if(message == "WIN"){
	        top_info_cel.animate({fill: winColor}, 1000);
	    }else if(message == "DRAW"){
	        top_info_cel.animate({fill: drawColor}, 1000);
	    }
	}
	
	

	return myLibrary;
});