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
	
	var _positionLayers = {zero: null, one: null, two: null, three: null, 
		four: null, five: null, six: null, seven: null, eight: null};
		
	var _winingState = [ ["one", "eight", "five"], ["zero", "one", "two"], 
	["two", "three", "four"], ["four", "five", "six"], ["six", "seven", "zero"], 
	["zero", "eight", "four"], ["two", "eight", "six"], ["three", "eight", "seven"] ];
	var _positions = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];
	
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
    
    var cell_1_1, cell_2_1, cell_3_1, cell_1_2, cell_2_2, cell_3_2, cell_1_3, cell_2_3, cell_3_3;
    var top_local_cel, top_info_cel, top_remote_cel;
    
    var touchFlag = false;
    
    var mupuntuContext = null;
    
    var resetflag = false;
    
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
        boxWidth = parseInt(stageWidth / 3), height = parseInt(stageWidth / 3);
	}
	
	myLibrary.setUsers = function(localUser, remoteUser){
	    _localUser = localUser;
		_remoteUser = remoteUser;
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
	
	myLibrary.initTopStage = function(){
	    
	   var topPanel = $('#topPanel');
	   topPanel.css('height', String(myLibrary.getHeightOfTopStage()) + 'px');
	   topPanel.css('width', boxWidth * 3 + 'px');
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
        
        var Context = myLibrary;
        top_info_cel.mouseup(function(e){
            
            if(touchFlag){
                return;    
            }
            
            touchFlag = true;
            
            var verdict = myLibrary.computeMoves();

	        if ((verdict == "WIN" || verdict == "DRAW") && _localUser.playerID == _gamestateModel.get('turn').player) {
	        
                Context._resetGameBoard();
                Context.resetBoard();
                mupuntuContext.triggerReset();
                Context.setCurrentPlayerColor();
	        }else{
	            myLibrary.errorTone();
	        }
	        
            touchFlag = false;
        });
        
        // Remote Player
        top_remote_cel = topStage.rect(boxWidth * 2, 0, boxWidth,  myLibrary.getHeightOfTopStage(), 15).attr({
            fill: remoteUserColor, 
        });
        
        
        var offset = myLibrary.getFontSizePx() / 3;
        var resetTextObj = topStage.text( (stageWidth/ 2), myLibrary.getHeightOfTopStage() / 2 + offset, "R");
        resetTextObj.attr({
            stroke: "black", 
            strokeWidth: 0,
            font: String(myLibrary.getFontSizePx() / 2.2) + "px Helvetica, sans-serif",
            textAnchor: "middle",
            fill: "#fff"
        });
        
        /*resetTextObj.mouseup(function(e){
            
            if(touchFlag){
                return;    
            }
            
            touchFlag = true;
            
            Context._resetGameBoard();
            Context.resetBoard();
            
            touchFlag = false;
        });*/
        
	}
	
	myLibrary.setCurrentPlayerColor = function(){
	    
	    var playerId = _gamestateModel.get('turn').player;
	    
	    if(_localUser.playerID == playerId){
            top_info_cel.animate({fill: localUserColor}, 1000);
	    }else{
	        top_info_cel.animate({fill: remoteUserColor}, 1000);
	    }
	    
	}
	
	myLibrary.initStage = function(){
	   
	   var gameCanvas = $('#gameCanvas');
	   gameCanvas.css('height', stageWidth + 'px');
	   gameCanvas.css('width', stageHeight + 'px');
	   gameCanvas.addClass("gameCanvas");
	   stage = Snap("#gameCanvas");
	}
	
	myLibrary._inWord = function(number){
    	return _positions[number] || false;
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

		for (var i = 0; i < _positions.length; i++) {
			gameboard[myLibrary._inWord(i)] = {};
			gameboard[myLibrary._inWord(i)].status = false
			gameboard[myLibrary._inWord(i)].player = null;
		}

		return gameboard;
	}

	myLibrary._pupulateScoreBoardModel = function(){
		_scoreboardModel.set('totalgames', 0);
		// Use playerId has a key
		_scoreboardModel.set(_localUser.playerID, 0);
		_scoreboardModel.set(_remoteUser.playerID, 0);
	}
	
	myLibrary.computeMoves = function(){

	    	var flag, flag_, markedPositions = 0;

	    	var gamestate = _gamestateModel.get('gameboard');

	    	// Check for a win state
	    	for (var i = 0; i < _winingState.length; i++, flag = 0, flag_ = 0) {
				for (var j = 0; j < _winingState[0].length; j++) {
					if (gamestate[_winingState[i][j]].status && gamestate[_winingState[i][j]].player == _localUser.playerID) flag++;
					if (gamestate[_winingState[i][j]].status && gamestate[_winingState[i][j]].player == _remoteUser.playerID) flag_++;
				}
				if (flag == 3 || flag_ == 3) return "WIN";
			}

			// Check if it's a draw
			_positions.forEach(function(position, index){
				if(gamestate[position].status) markedPositions++;
			});

			if (markedPositions == 8) return "DRAW";
			return "CONTINUE";
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
    
    myLibrary.resetBoard = function(flag){

			// TODO, to Avoid accumulated memory leaks
            
            var gameboard;
            
            if(flag){
                gameboard = myLibrary._getGameBoard();
            }else{
                gameboard = _gamestateModel.get("gameboard");    
            }
	        
	        var position;
			
	        for (var i = 0; i <= 8; i++){
                
                position = myLibrary._inWord(i);
                
	        	// Create a {Width: 50, height: 50} on the x,y axis
	        	if ( !gameboard[myLibrary._inWord(i)].status) {
		            // add the created blank.png to each layer
		                if(position == "zero"){
            	            cell_3_1.animate({fill: defaultColor}, 1000);
            	        }else if(position == "one"){
            	            cell_3_2.animate({fill: defaultColor}, 1000);
            	        }else if(position == "two"){
            	            cell_3_3.animate({fill: defaultColor}, 1000);
            	        }else if(position == "three"){
            	            cell_2_3.animate({fill: defaultColor}, 1000);
            	        }else if(position == "four"){
            	            cell_1_3.animate({fill: defaultColor}, 1000);
            	        }else if(position == "five"){
            	            cell_1_2.animate({fill: defaultColor}, 1000);
            	        }else if(position == "six"){
            	            cell_1_1.animate({fill: defaultColor}, 1000);
            	        }else if(position == "seven"){
            	            cell_2_1.animate({fill: defaultColor}, 1000);
            	        }else if(position == "eight"){
            	            cell_2_2.animate({fill: defaultColor}, 1000);
            	        }else{
            	            return alert("Invalid Moves");
            	        }
		        }else{

		        	// The current device is the X while remote device Y

		        	if ( gameboard[myLibrary._inWord(i)].player == _localUser.playerID){
		        		// add the created Ximage.png to each layer for local player's moves
		        	    if(position == "zero"){
            	            cell_3_1.animate({fill: localUserColor}, 1000);
            	        }else if(position == "one"){
            	            cell_3_2.animate({fill: localUserColor}, 1000);
            	        }else if(position == "two"){
            	            cell_3_3.animate({fill: localUserColor}, 1000);
            	        }else if(position == "three"){
            	            cell_2_3.animate({fill: localUserColor}, 1000);
            	        }else if(position == "four"){
            	            cell_1_3.animate({fill: localUserColor}, 1000);
            	        }else if(position == "five"){
            	            cell_1_2.animate({fill: localUserColor}, 1000);
            	        }else if(position == "six"){
            	            cell_1_1.animate({fill: localUserColor}, 1000);
            	        }else if(position == "seven"){
            	            cell_2_1.animate({fill: localUserColor}, 1000);
            	        }else if(position == "eight"){
            	            cell_2_2.animate({fill: localUserColor}, 1000);
            	        }else{
            	            return alert("Invalid Moves");
            	        }
		        	}else{
		        		// add the created Oimage.png to each layer for remote player's moves
		        		
		        		if(position == "zero"){
            	            cell_3_1.animate({fill: remoteUserColor}, 1000);
            	        }else if(position == "one"){
            	            cell_3_2.animate({fill: remoteUserColor}, 1000);
            	        }else if(position == "two"){
            	            cell_3_3.animate({fill: remoteUserColor}, 1000);
            	        }else if(position == "three"){
            	            cell_2_3.animate({fill: remoteUserColor}, 1000);
            	        }else if(position == "four"){
            	            cell_1_3.animate({fill: remoteUserColor}, 1000);
            	        }else if(position == "five"){
            	            cell_1_2.animate({fill: remoteUserColor}, 1000);
            	        }else if(position == "six"){
            	            cell_1_1.animate({fill: remoteUserColor}, 1000);
            	        }else if(position == "seven"){
            	            cell_2_1.animate({fill: remoteUserColor}, 1000);
            	        }else if(position == "eight"){
            	            cell_2_2.animate({fill: remoteUserColor}, 1000);
            	        }else{
            	            return alert("Invalid Moves");
            	        }
		        	}		    		

		        }
	        }
	}
    
    myLibrary.updateRemoteUsersMove = function(position){

	        if(position == "zero"){
	            cell_3_1.animate({fill: remoteUserColor}, 1000);
	        }else if(position == "one"){
	            cell_3_2.animate({fill: remoteUserColor}, 1000);
	        }else if(position == "two"){
	            cell_3_3.animate({fill: remoteUserColor}, 1000);
	        }else if(position == "three"){
	            cell_2_3.animate({fill: remoteUserColor}, 1000);
	        }else if(position == "four"){
	            cell_1_3.animate({fill: remoteUserColor}, 1000);
	        }else if(position == "five"){
	            cell_1_2.animate({fill: remoteUserColor}, 1000);
	        }else if(position == "six"){
	            cell_1_1.animate({fill: remoteUserColor}, 1000);
	        }else if(position == "seven"){
	            cell_2_1.animate({fill: remoteUserColor}, 1000);
	        }else if(position == "eight"){
	            cell_2_2.animate({fill: remoteUserColor}, 1000);
	        }else{
	            return alert("Invalid Moves");
	        }

	        // Compute Win/Draw based on the updated model and report to localuser
	        var verdict = myLibrary.computeMoves();

	        if (verdict == "WIN") {
	            myLibrary.flashMessage("WIN");
	            myLibrary.updateUserScores(true);
	            myLibrary.winTone();
	            // _gamestateModel.set('turn',{player: _remoteUser.playerID});
	    		//alert("Game Over");
	    	}else if(verdict == "DRAW"){
	    	    myLibrary.flashMessage("DRAW");
	    	    myLibrary.drawTone();
	    		// alert("Game is Draw");
	    	}else{
	    	    myLibrary.setCurrentPlayerColor();
	    	    myLibrary.playTone();
	    	}
	}
    
    myLibrary.processChange = function(data){
        
            var blankboard = myLibrary._getGameBoard();
            var diff = myLibrary.objDiff(blankboard, data[0]);
            console.log("comparison with blank board:");
            console.log(diff);
            
            if(diff.length == 0){
                console.log("we have a new board");
                _prevModel.gameboard = _.has(data[0],'gameboard') ? data[0].gameboard : data[0];
                console.log(_prevModel);
                
                if(resetflag){
                    console.log("already done the reset");
        	    }else{
        	        myLibrary.resetBoard(true);
        	        myLibrary.updateUserScores();
        	        myLibrary.setCurrentPlayerColor();
        	        // myLibrary._resetGameBoard();
        	        resetflag = true;
        	    }
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
	
	
	myLibrary.updateModelWithMove = function(position){
	    	if(!_.isObject(_gamestateModel)) throw new Error("initialize models first");

	    	var playerId = _gamestateModel.get('turn').player;

	    	var gameboard = _gamestateModel.get('gameboard');

	    	// Based on current state of the model
	    	var verdict = myLibrary.computeMoves();

	    	if (playerId != _localUser.playerID || gameboard[position].status && 
	    		(verdict == 'WIN' || verdict == 'DRAW')) {
	    		if ( (verdict == 'WIN' || verdict == 'DRAW') ) {
	    		    myLibrary.flashMessage("GAME OVER");
	    		    // alert("game over - reset the game");
	    		    // myLibrary.errorTone();
	    			return 0;
	    		}
	    		
	    		myLibrary.flashMessage("NOT YOUR MOVE");
	    		// alert("Can't play");
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
	    		// alert("You Win");
	    		myLibrary.updateUserScores();
                myLibrary.winTone();
	    	}else if(verdict == "DRAW"){
	    	    myLibrary.flashMessage("DRAW");
	    		// alert("Game is Draw");
	    		myLibrary.drawTone();
	    	}else{
	    	    myLibrary.setCurrentPlayerColor();
	    	    myLibrary.playTone();
	    	}
	    	return true;
	    }
	
	myLibrary.initBoxes = function(){
	    
	    // Column 1
        cell_1_1 = stage.rect(0, 0, boxWidth, boxWidth).attr({
            fill: defaultColor, 
            stroke: strokeColor, 
            strokeWidth: borderWidth
        });
        
        var Context = myLibrary;
        
        cell_1_1.mouseup(function(e){
            
            if(touchFlag){
                return;    
            }
            
            touchFlag = true;
            
            if(Context.updateModelWithMove("six") > 0){
                cell_1_1.animate({fill: localUserColor}, 1000);
            }
            
            touchFlag = false;
        });
                
        cell_2_1 = stage.rect(0, boxWidth, boxWidth, boxWidth).attr({
            fill: defaultColor, 
            stroke: strokeColor, 
            strokeWidth: borderWidth
        });
                
        cell_2_1.mouseup(function(e){
            
            if(touchFlag){
                return;    
            }
            
            touchFlag = true;
            
            if(Context.updateModelWithMove("seven") > 0){
                cell_2_1.animate({fill: localUserColor}, 1000);
            }
            
            touchFlag = false;
        })
                
        cell_3_1 = stage.rect(0, boxWidth * 2, boxWidth, boxWidth).attr({
            fill: defaultColor, 
            stroke: strokeColor, 
            strokeWidth: borderWidth
        }); 
                
        cell_3_1.mouseup(function(e){
            
            if(touchFlag){
                return;    
            }
            
            touchFlag = true;
            
            if(Context.updateModelWithMove("zero") > 0){
                cell_3_1.animate({fill: localUserColor}, 1000);
            }
            
            touchFlag = false;
        });
                
                
        // Columns 2
        cell_1_2 = stage.rect(boxWidth, 0, boxWidth, boxWidth).attr({
            fill: defaultColor, 
            stroke: strokeColor, 
            strokeWidth: borderWidth
        }); 
                
        cell_1_2.mouseup(function(e){
            
            if(touchFlag){
                return;    
            }
            
            touchFlag = true;
            
            if(Context.updateModelWithMove("five") > 0){
                cell_1_2.animate({fill: localUserColor}, 1000);
            }
            
            touchFlag = false;
        });
                
                
        cell_2_2 = stage.rect(boxWidth, boxWidth, boxWidth, boxWidth).attr({
            fill: defaultColor, 
            stroke: strokeColor, 
            strokeWidth: borderWidth
        }); 
                
        cell_2_2.mouseup(function(e){
            
            if(touchFlag){
                return;    
            }
            
            touchFlag = true;
            
            if(Context.updateModelWithMove("eight") > 0){
                cell_2_2.animate({fill: localUserColor}, 1000);
            }
            
            touchFlag = false;
        });
                
        cell_3_2 = stage.rect(boxWidth, boxWidth * 2, boxWidth, boxWidth).attr({
            fill: defaultColor,
            stroke: strokeColor, 
            strokeWidth: borderWidth
        });
                
        cell_3_2.mouseup(function(e){
            
            if(touchFlag){
                return;    
            }
            
            touchFlag = true;
            
            if(Context.updateModelWithMove("one") > 0){
                cell_3_2.animate({fill: localUserColor}, 1000);
            }
            
            touchFlag = false;
        })
	    
	    // Columns 3
	    cell_1_3 = stage.rect(boxWidth * 2, 0, boxWidth, boxWidth).attr({
            fill: defaultColor, 
            stroke: strokeColor, 
            strokeWidth: borderWidth
        });
        
        cell_1_3.mouseup(function(e){
            
            if(touchFlag){
                return;    
            }
            
            touchFlag = true;
            
            if(Context.updateModelWithMove("four") > 0){
                cell_1_3.animate({fill: localUserColor}, 1000);
            }
            
            touchFlag = false;
        });
        
        cell_2_3 = stage.rect(boxWidth * 2, boxWidth, boxWidth, boxWidth).attr({
            fill: defaultColor, 
            stroke: strokeColor, 
            strokeWidth: borderWidth
        });
        
        cell_2_3.mouseup(function(e){
            
            if(touchFlag){
                return;    
            }
            
            touchFlag = true;
            
            if(Context.updateModelWithMove("three") > 0){
                cell_2_3.animate({fill: localUserColor}, 1000);
            }
            
            touchFlag = false;
        });
        
        
        cell_3_3 = stage.rect(boxWidth * 2, boxWidth * 2, boxWidth, boxWidth).attr({
            fill: defaultColor, 
            stroke: strokeColor, 
            strokeWidth: borderWidth
        });
        
        cell_3_3.mouseup(function(e){
            
            if(touchFlag){
                return;    
            }
            
            touchFlag = true;
            
            if(Context.updateModelWithMove("two") > 0){
                cell_3_3.animate({fill: localUserColor}, 1000);
            }
            
            touchFlag = false;
        });
	}
	
	myLibrary.updateUserScores  = function(remoteFlag){
	    
	    myLibrary.clearTopStageAndRedraw();
	    
	    var offset = myLibrary.getFontSizePx() / 3;
        
	    var localScoreText = _scoreboardModel.get(_localUser.playerID);
	    
	    if(localScoreObj){
	        //TODO clear previous text first
	        // localScoreObj.clear();
	    }
	    
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
        
        if(remoteScoreObj){
	        //TODO clear previous text first
	        //remoteScoreObj.clear();
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
	
	myLibrary.handlerGameResetMessage = function(message){
	    console.log("remote sendz a reset command: msg: " + message);
	    // The remote user has done this: myLibrary._resetGameBoard();
	    // myLibrary.resetBoard(); will fail since we still have the old boardconfiguration so we must request for new board state
	    
	    if(resetflag){
	        console.log("We have reset the board already");
	    }else{
	        myLibrary.resetBoard(true);
	        myLibrary.updateUserScores();
	        myLibrary.setCurrentPlayerColor();
	        // myLibrary._resetGameBoard();
	        resetflag = true;
	    }
        
	}
	
	myLibrary.setMupuntuContext = function(context){
	    mupuntuContext = context;
	}

	myLibrary.sayHello = function(){
		alert("hello world");
	}
	
	myLibrary.getFontSizePx = function(){
		return (60 / 100) * myLibrary.getHeightOfTopStage();
	}
	
	myLibrary.getHeightOfTopStage = function(){
	    return (((70 / 100 ) * boxWidth) / 2);
	}

	return myLibrary;
});