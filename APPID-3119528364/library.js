/**
* Wordfind.js 0.0.1
* (c) 2012 Bill, BunKat LLC.
* Wordfind is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/wordfind
*/

/*
* @author Daser Retnan <dretnan@acm.org>
* @date Thu 10 August 2014 08:50:32 PM GMT
* @Description: My Game Library
*/

(function (libraryName, global, definition) {

	global[libraryName] = definition(_, Backbone);

})('myLibrary', this, function (_, Backbone) {
	    
	"use strict";
	
	var myLibrary = {};
	
	var _gamestateModel, _scoreboardModel;
	var _prevModel; // Used for keeping track of previous model
	var _localUser, _remoteUser;
	
	var MAX_COL = 5, MAX_ROW = 5;
	
	var _MAX_COL = 8, _MAX_ROW = 8;
	
	var _boxes = new Array(_MAX_COL * _MAX_ROW); //5 * 5 boxes;
	var _alphaBoxes = new Array(_MAX_COL * _MAX_ROW); //5 * 5 boxes;
	
	var deviceWidth = 1200, deviceHeight = 600;
	var originalWidth = 1200, originalHeight = 600;
	var stageWidth, stageHeight;
	var stage, topStage, boxWidth, _boxWidth;
	var borderWidth = 1;
    var defaultColor = "#f9f9f9";
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
    
    var linePathsOnStage = false;
    var firstBoxIndex;
    var currentTimerId;
    
    
    // Splash Canvases (Svg)
    var splashStart = null;
    var splashReady = null;
    var splashGo = null;
    
	
	var nWords = 7;
	
	// Game state
    var startSquare, selectedSquares = [], curOrientation, curWord = '';
	
	
	/**
    * Draws the puzzle by inserting rows of buttons into el.
    *
    * @param {String} el: The jQuery element to write the puzzle to
    * @param {[[String]]} puzzle: The puzzle to draw
    */
	
	var drawPuzzle = function (el, puzzle) {
      
      var output = '';
      // for each row in the puzzle
      for (var i = 0, height = puzzle.length; i < height; i++) {
        // append a div to represent a row in the puzzle
        var row = puzzle[i];
        output += '<div>';
        // for each element in that row
        for (var j = 0, width = row.length; j < width; j++) {
            // append our button with the appropriate class
            output += '<button class="puzzleSquare" x="' + j + '" y="' + i + '">';
            output += row[j] || '&nbsp;';
            output += '</button>';
        }
        // close our div that represents a row
        output += '</div>';
      }

      $(el).html(output);
    };
    
    /**
    * Draws the words by inserting an unordered list into el.
    *
    * @param {String} el: The jQuery element to write the words to
    * @param {[String]} words: The words to draw
    */
    var drawWords = function (el, words) {
      
      var output = '<ul>';
      for (var i = 0, len = words.length; i < len; i++) {
        var word = words[i];
        output += '<li class="word ' + word + '">' + word;
      }
      output += '</ul>';

      $(el).html(output);
    };
    
    /**
    * Game play events.
    *
    * The following events handle the turns, word selection, word finding, and
    * game end.
    *
    */
    
    /**
    * Event that handles mouse down on a new square. Initializes the game state
    * to the letter that was selected.
    *
    */
    var startTurn = function () {
      $(this).addClass('selected');
      startSquare = this;
      selectedSquares.push(this);
      curWord = $(this).text();
    };

    /**
    * Event that handles mouse over on a new square. Ensures that the new square
    * is adjacent to the previous square and the new square is along the path
    * of an actual word.
    *
    */
    var select = function () {

      // if the user hasn't started a word yet, just return
      if (!startSquare) {
        return;
      }

      // if the new square is actually the previous square, just return
      var lastSquare = selectedSquares[selectedSquares.length-1];
      if (lastSquare == this) {
        return;
      }

      // see if the user backed up and correct the selectedSquares state if
      // they did
      var backTo;
      for (var i = 0, len = selectedSquares.length; i < len; i++) {
        if (selectedSquares[i] == this) {
          backTo = i+1;
          break;
        }
      }

      while (backTo < selectedSquares.length) {
        $(selectedSquares[selectedSquares.length-1]).removeClass('selected');
        selectedSquares.splice(backTo,1);
        curWord = curWord.substr(0, curWord.length-1);
      }


      // see if this is just a new orientation from the first square
      // this is needed to make selecting diagonal words easier
      var newOrientation = calcOrientation(
          $(startSquare).attr('x')-0,
          $(startSquare).attr('y')-0,
          $(this).attr('x')-0,
          $(this).attr('y')-0
          );

      if (newOrientation) {
        selectedSquares = [startSquare];
        curWord = $(startSquare).text();
        if (lastSquare !== startSquare) {
          $(lastSquare).removeClass('selected');
          lastSquare = startSquare;
        }
        curOrientation = newOrientation;
      }

      // see if the move is along the same orientation as the last move
      var orientation = calcOrientation(
          $(lastSquare).attr('x')-0,
          $(lastSquare).attr('y')-0,
          $(this).attr('x')-0,
          $(this).attr('y')-0
          );

      // if the new square isn't along a valid orientation, just ignore it.
      // this makes selecting diagonal words less frustrating
      if (!orientation) {
        return;
      }

      // finally, if there was no previous orientation or this move is along
      // the same orientation as the last move then play the move
      if (!curOrientation || curOrientation === orientation) {
        curOrientation = orientation;
        playTurn(this);
      }

    };
    
    
    
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
        
        originalWidth = width;
        originalHeight = height;
        
        stageWidth = (95 / 100 ) * deviceWidth;
        stageHeight = (95 / 100 ) * deviceWidth;
        boxWidth = parseInt(stageWidth / MAX_COL), height = parseInt(stageWidth / MAX_COL);
        _boxWidth = parseInt(stageWidth / _MAX_COL), height = parseInt(stageWidth / _MAX_COL);
	}
	
	myLibrary.setUsers = function(localUser, remoteUser){
	    _localUser = localUser;
		_remoteUser = remoteUser;
	}
	
	myLibrary.initSplash = function(){
	    var splash = $('#splash');
	    splash.css('position', 'absolute');
	    splash.css('width', '100%'); 
	    splash.css('height', '100%');
	    splash.css('z-index', '100');
	    splash.css('background-color', 'cyan');
	    var splashes = $('.splash');
	    
	    splashes.css('display', 'none');
	    
	    splashes.css('background-color', '#e9fcc1');
	    splashes.css('width', originalWidth + 'px');
	    splashes.css('height', originalHeight + 'px');
	    splashStart = Snap("#start");
	    splashReady = Snap("#ready");
	    splashGo = Snap("#go");
	    myLibrary.hideAll();
	}
	
	myLibrary.hideAll = function(){
	    $('#splash').css('display', 'none');
	}
	
	myLibrary.showStart = function(){

	    var radius = 100;
	    
	    splashStart.clear();
                
        var bigCircle = splashStart.circle(originalWidth / 2, (originalHeight / 2) - radius / 2, radius * 3);
        bigCircle.attr({
            stroke: "#fecf43",
            strokeWidth: 5,
            fill: "red"
        });
                
        bigCircle.animate({r: radius}, 5e3, mina.elastic);
        
        $('#splash').css('display', 'block');
        
        $('#start').css('display', 'block');
        $('#ready').css('display', 'none');
        $('#go').css('display', 'none');
	}
	
	
	myLibrary.showReady = function(){

	    var radius = 100;
	    
	    splashReady.clear();
	    
        var bigCircle = splashReady.circle(originalWidth / 2, (originalHeight / 2) - radius / 2, radius * 3);
        bigCircle.attr({
            stroke: "#fecf43",
            strokeWidth: 5,
            fill: "yellow"
        });
        
        var bigCircleClicked = false;
        
        bigCircle.mousedown(function(e){
            if(bigCircleClicked){
                return;
            }
            bigCircleClicked = true;
            mupuntuContext.triggerEvent('message', "propose");
        });
                    
        bigCircle.animate({r: radius}, 5e3, mina.elastic);
        
        $('#splash').css('display', 'block');
        
        $('#start').css('display', 'none');
        $('#ready').css('display', 'block');
        $('#go').css('display', 'none');
	}
	
	myLibrary.showGo = function(behaviour){

	    var radius = 100;
	    
	    splashGo.clear();
	    
	    var bigCircle = null;
	    
	    if(behaviour == "waiting"){
	        
	       // bigCircle = splashGo.circle(originalWidth / 2, (originalHeight / 2) - radius / 2, radius * 3);
        //     bigCircle.attr({
        //         stroke: "#fecf43",
        //         strokeWidth: 5,
        //         fill: "#96e38e"
        //     });
                    
        //     bigCircle.animate({r: radius}, 5e3, mina.elastic);
            
	    }else if(behaviour == "user_action"){
	        
	        bigCircle = splashGo.circle(originalWidth / 2, (originalHeight / 2) - radius / 2, radius * 3);
            bigCircle.attr({
                stroke: "#fecf43",
                strokeWidth: 5,
                fill: "#96e38e"
            });
            
            var bigCircleClicked = false;
        
            bigCircle.mousedown(function(e){
                if(bigCircleClicked){
                    return;
                }
                bigCircleClicked = true;
                mupuntuContext.triggerEvent('message', "ack");
            });
                    
            bigCircle.animate({r: radius}, 5e3, mina.elastic);
            
	    }
                
        $('#splash').css('display', 'block');
        
        $('#start').css('display', 'none');
        $('#ready').css('display', 'none');
        $('#go').css('display', 'block');
	}
	
	myLibrary.initStage = function(){
	   
	   var gameCanvas = $('#gameCanvas');
	   gameCanvas.css('height', stageWidth + 'px');
	   gameCanvas.css('width', stageHeight + 'px');
	   // gameCanvas.css('background-color', 'cyan');
	   gameCanvas.addClass("gameCanvas");
	   stage = Snap("#gameCanvas");
	}
	
	myLibrary.getFontSizePx = function(){
		return (70 / 100) * myLibrary.getHeightOfTopStage();
	}
	
	myLibrary._getFontSizePx = function(){
		return (90 / 100) * myLibrary.getHeightOfTopStage();
	}
	
	myLibrary.getHeightOfTopStage = function(){
	    return (((100 / 100 ) * boxWidth) / 2);
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
	
	myLibrary.setMupuntuContext = function(context){
	    mupuntuContext = context;
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

			_gamestateModel.onChangeEventListener("answer", myLibrary.processChange, myLibrary);
			
			// console.log("finished: gamechatModelHandler()");
			
			myLibrary.resetBoard();
			myLibrary.updateUserScores();
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
    
	
	myLibrary.getNewWordMatrix = function(){
	    
	    var selectedWords = [];
		for(var i = 0; i < nWords; i++){
		    selectedWords.push(WordList[_.random(0, WordList.length)]);
		}
		console.log(selectedWords);
		
		// wordfind returns a 2-D array
		var puzzle = wordfind.newPuzzle(selectedWords,
		    {
                height: _MAX_COL,
                width:  _MAX_COL,
		    });
		    
		console.log(puzzle);
		
		wordfind.print(puzzle);
		
		var solution = wordfind.solve(puzzle, selectedWords)['found'];
		console.log(solution);
		
		return [puzzle, solution];
	}
	
	// Fresh GameBoard
	myLibrary._resetGameBoard = function(){
		myLibrary._createAGameMatrix();
	}
	
	myLibrary._createAGameMatrix = function(){

		var gameboard = {};
		
		var puzzle = myLibrary.getNewWordMatrix();
		
		var matrix = puzzle[0];
		var solution = puzzle[1];
		
		
		for (var i = 0; i < solution.length; i++) {
		    solution[i].player = null;
		}
		
		for (var r = 0; r < matrix.length; r++) {
		    
		    for(var c = 0; c < matrix[0].length; c++){
		        
		        gameboard[(r * matrix[0].length) + c] = matrix[r][c];

		    }
		    
		}

		_gamestateModel.set('gameboard', gameboard);
		_gamestateModel.set('answer', solution);
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
	
	var convertBoxIndexToXY = function(boxIndex){
	    
	    var row = Math.floor(boxIndex / _MAX_COL);
	    var col = Math.abs(boxIndex - (row * _MAX_COL));
	    
	    return {
	        row: row,
	        col: col
	    };
	}
	
	var paintWord = function (orientation, startX, startY, overlap, flag){
	    
	    console.log("painting.." + orientation + " from " + startX + "," + startY)
	    
	    var boxIndex = null;
	    
	    if(orientation == "vertical"){
	        // X is constant
	        for(var inc = 0; inc < overlap; inc++){
	            boxIndex = ( (startY + inc) * _MAX_COL) + startX;
	            if(flag){
	                _boxes[boxIndex].animate({fill: remoteUserColor}, 100);
	            }else{
	                _boxes[boxIndex].animate({fill: localUserColor}, 100);
	            }
	        }
	    }else if(orientation == "horizontal"){
	        // Y is constant
	        for(var inc = 0; inc < overlap; inc++){
	            boxIndex = ( startY * _MAX_COL) + startX + inc;
	             if(flag){
	                _boxes[boxIndex].animate({fill: remoteUserColor}, 100);
	            }else{
	                _boxes[boxIndex].animate({fill: localUserColor}, 100);
	            }
	        }
	    }else  if(orientation == "verticalUp"){
	        // X is constant
	        for(var inc = 0; inc < overlap; inc++){
	            boxIndex = ( (startY - inc) * _MAX_COL) + startX;
	             if(flag){
	                _boxes[boxIndex].animate({fill: remoteUserColor}, 100);
	            }else{
	                _boxes[boxIndex].animate({fill: localUserColor}, 100);
	            }
	        }
	    }else  if(orientation == "diagonalUp"){
	        for(var inc = 0; inc < overlap; inc++){
	            boxIndex = ( (startY - inc) * _MAX_COL) + startX + inc;
	             if(flag){
	                _boxes[boxIndex].animate({fill: remoteUserColor}, 100);
	            }else{
	                _boxes[boxIndex].animate({fill: localUserColor}, 100);
	            }
	        }
	    }else  if(orientation == "diagonalUpBack"){
	        for(var inc = 0; inc < overlap; inc++){
	            boxIndex = ( (startY - inc) * _MAX_COL) + startX - inc;
	             if(flag){
	                _boxes[boxIndex].animate({fill: remoteUserColor}, 100);
	            }else{
	                _boxes[boxIndex].animate({fill: localUserColor}, 100);
	            }
	        }
	    }else if(orientation == "horizontalBack"){
	        // Y is constant
	        for(var inc = 0; inc < overlap; inc++){
	            boxIndex = ( startY * _MAX_COL) + startX - inc;
	             if(flag){
	                _boxes[boxIndex].animate({fill: remoteUserColor}, 100);
	            }else{
	                _boxes[boxIndex].animate({fill: localUserColor}, 100);
	            }
	        }
	    }else  if(orientation == "diagonalUp"){
	        for(var inc = 0; inc < overlap; inc++){
	            boxIndex = ( (startY - inc) * _MAX_COL) + startX - inc;
	             if(flag){
	                _boxes[boxIndex].animate({fill: remoteUserColor}, 100);
	            }else{
	                _boxes[boxIndex].animate({fill: localUserColor}, 100);
	            }
	        }
	    }else if(orientation == "diagonal"){
	        for(var inc = 0; inc < overlap; inc++){
	            boxIndex = ( (startY + inc) * _MAX_COL) + startX + inc;
	             if(flag){
	                _boxes[boxIndex].animate({fill: remoteUserColor}, 100);
	            }else{
	                _boxes[boxIndex].animate({fill: localUserColor}, 100);
	            }
	        }
	    }else if(orientation == "diagonalBack"){
	        for(var inc = 0; inc < overlap; inc++){
	            boxIndex = ( (startY + inc) * _MAX_COL) + startX - inc;
	             if(flag){
	                _boxes[boxIndex].animate({fill: remoteUserColor}, 100);
	            }else{
	                _boxes[boxIndex].animate({fill: localUserColor}, 100);
	            }
	        }
	    }
	}
	
	var makeMove = function(endBoxIndex){
	    clearInterval(currentTimerId);
	    var startBoxIndex = firstBoxIndex;
        
        var Pos = convertBoxIndexToXY(startBoxIndex);
        var xPos_s = Pos.col;
        var yPos_s = Pos.row;
        
        Pos = convertBoxIndexToXY(endBoxIndex);
        var xPos_e = Pos.col;
        var yPos_e = Pos.row;
        
        var answers = _gamestateModel.get("answer");
        var gameboard = _gamestateModel.get("gameboard");
        
        //answer
        
        var found = false;
        
        for(var answer in answers){
            
            // console.log(answers[answer])
            
            if(!answers[answer].player && xPos_s == answers[answer].x && yPos_s == answers[answer].y){
                
                if(answers[answer].orientation == "vertical" && xPos_s == xPos_e && yPos_s < yPos_e && 
                answers[answer].word[(answers[answer].word.length - 1)] == gameboard[(yPos_e * _MAX_COL) + xPos_e] ){
                    found = true;
                    answers[answer].player = _localUser.playerID;
                    paintWord(answers[answer].orientation, xPos_s, yPos_s, answers[answer].overlap);
                    _gamestateModel.set("answer",answers);
                    break;
                    
                }else if(answers[answer].orientation == "horizontal" && yPos_s == yPos_e &&  xPos_e > xPos_s && 
                answers[answer].word[(answers[answer].word.length - 1)] == gameboard[(yPos_e * _MAX_COL) + xPos_e] ){
                    found = true;
                    answers[answer].player = _localUser.playerID;
                    paintWord(answers[answer].orientation, xPos_s, yPos_s, answers[answer].overlap);
                    _gamestateModel.set("answer",answers);
                    break;
                }else if(answers[answer].orientation == "verticalUp" && xPos_s == xPos_e && yPos_s > yPos_e && 
                answers[answer].word[(answers[answer].word.length - 1)] == gameboard[(yPos_e * _MAX_COL) + xPos_e] ){
                    found = true;
                    answers[answer].player = _localUser.playerID;
                    paintWord(answers[answer].orientation, xPos_s, yPos_s, answers[answer].overlap);
                    _gamestateModel.set("answer",answers);
                    break;
                }else if(answers[answer].orientation == "diagonalUp" && xPos_e > xPos_s && yPos_s > yPos_e &&
                answers[answer].word[(answers[answer].word.length - 1)] == gameboard[(yPos_e * _MAX_COL) + xPos_e]){
                    found = true;
                    answers[answer].player = _localUser.playerID;
                    paintWord(answers[answer].orientation, xPos_s, yPos_s, answers[answer].overlap);
                    _gamestateModel.set("answer",answers);
                    break;
                }else if (answers[answer].orientation == "diagonalUpBack" && xPos_e < xPos_s && yPos_s > yPos_e &&
                answers[answer].word[(answers[answer].word.length - 1)] == gameboard[(yPos_e * _MAX_COL) + xPos_e]){
                    found = true;
                    answers[answer].player = _localUser.playerID;
                    paintWord(answers[answer].orientation, xPos_s, yPos_s, answers[answer].overlap);
                    _gamestateModel.set("answer",answers);
                    break;
                }else if(answers[answer].orientation == "horizontalBack" && yPos_s == yPos_e &&  xPos_e < xPos_s && 
                answers[answer].word[(answers[answer].word.length - 1)] == gameboard[(yPos_e * _MAX_COL) + xPos_e] ){
                    found = true;
                    answers[answer].player = _localUser.playerID;
                    paintWord(answers[answer].orientation, xPos_s, yPos_s, answers[answer].overlap);
                    _gamestateModel.set("answer",answers);
                    break;
                }else if(answers[answer].orientation == "diagonalUp" && xPos_e < xPos_s && yPos_s > yPos_e &&
                answers[answer].word[(answers[answer].word.length - 1)] == gameboard[(yPos_e * _MAX_COL) + xPos_e]){
                    found = true;
                    answers[answer].player = _localUser.playerID;
                    paintWord(answers[answer].orientation, xPos_s, yPos_s, answers[answer].overlap);
                    _gamestateModel.set("answer",answers);
                    break;
                }else if(answers[answer].orientation == "diagonal" && xPos_e > xPos_s && yPos_s < yPos_e &&
                answers[answer].word[(answers[answer].word.length - 1)] == gameboard[(yPos_e * _MAX_COL) + xPos_e]){
                    found = true;
                    answers[answer].player = _localUser.playerID;
                    paintWord(answers[answer].orientation, xPos_s, yPos_s, answers[answer].overlap);
                    _gamestateModel.set("answer",answers);
                    break;
                }else if(answers[answer].orientation == "diagonalBack" && xPos_s > xPos_e && yPos_s < yPos_e &&
                answers[answer].word[(answers[answer].word.length - 1)] == gameboard[(yPos_e * _MAX_COL) + xPos_e]){
                    found = true;
                    answers[answer].player = _localUser.playerID;
                    paintWord(answers[answer].orientation, xPos_s, yPos_s, answers[answer].overlap);
                    _gamestateModel.set("answer",answers);
                    break;
                }else{
                    console.log("invalid selection or orientation not supported")
                    console.log(xPos_s + "," + yPos_s + "-->" + xPos_e + "," + yPos_e)
                }
                
                break;
            }
        }
        
        if(!found){
            myLibrary.resetLinePathsOnStage();
        }
        
	}
	
	myLibrary.resetLinePathsOnStage = function(){
	    _boxes[firstBoxIndex].animate({fill: defaultColor}, 2000);
	    linePathsOnStage = false;
	}
	
	myLibrary.resetBoard = function(){

			// TODO, to Avoid accumulated memory leaks
            
            var gameboard = _gamestateModel.get("gameboard");
            
            var answers = _gamestateModel.get("answer");
            
            var words = [];
            for(var i = 0; i < answers.length; i++){
                words.push(answers[i].word.toUpperCase());
            }
            
            // Put the words to find under the puzzle (stage)
            drawWords($("#words"), words);
            
            var counter = 0, x, y;
            for(var r = 0; r < _MAX_ROW; r++){
    	        for(var c = 0; c < _MAX_COL; c++){

                    x = _boxes[ (r * _MAX_COL) + c].node.attributes['x'].value;
                    y = _boxes[ (r * _MAX_COL) + c].node.attributes['y'].value;
                    
                    var offset = myLibrary.getFontSizePx() / 3;
    	            stage.text( Number(x) + (_boxWidth / 2), Number(y) + (_boxWidth / 2) + offset, gameboard[counter].toUpperCase()).attr({
                        stroke: "black", 
                        strokeWidth: 2,
                        font: String(myLibrary._getFontSizePx() / 1) + "px Helvetica, sans-serif",
                        textAnchor: "middle",
                        fontWeight: 'bold',
                        fill: "#000"
                    });
                    
                    _alphaBoxes[ (r * _MAX_COL) + c] = stage.rect(c * _boxWidth, r * _boxWidth, _boxWidth, _boxWidth).attr({
                        opacity: 0.0,
                        boxIndex: (r * _MAX_COL) + c,
                        class: 'square'
                    });
                    
                    _alphaBoxes[ (r * _MAX_COL) + c].mousedown(function(e){
                    
                        var boxIndex = this.node.attributes['boxIndex'].value || this.node.attributes['boxIndex'].nodeValue;
                        boxIndex = Number(boxIndex);
                        
                        if(boxIndex == firstBoxIndex){
                            return;
                        }
                        
                        if(linePathsOnStage){
                            makeMove(boxIndex);
                            linePathsOnStage = false;
                            firstBoxIndex = null;
                            return;
                        }
                        
                        firstBoxIndex = boxIndex;
                        linePathsOnStage = true;
                        
                        var Context = myLibrary;
                        
                        currentTimerId = setTimeout(function() {
                            Context.resetLinePathsOnStage();
                        }, 5000);
    	        
    	                _boxes[boxIndex].animate({fill: localUserColor}, 100);
                    });
                    
                    counter++;
    	        }
    	    }
    	    
    	    var data = answers;
    	    
    	    for(var i = 0; i < data.length; i++){
                console.log(data[i].player);
                if(data[i].player && data[i].player == _localUser.playerID){
                    paintWord(data[i].orientation, data[i].x, data[i].y, data[i].overlap, false);
                }else if(data[i].player && data[i].player == _remoteUser.playerID){
                    paintWord(data[i].orientation, data[i].x, data[i].y, data[i].overlap, true);
                }
            }
    	    
    	    
	}
	
	myLibrary.initBoxes = function(){
	    
	    var Context = myLibrary;
	    
	    for(var r = 0; r < _MAX_ROW; r++){
	        for(var c = 0; c < _MAX_COL; c++){
	            
	            _boxes[ (r * _MAX_COL) + c] = stage.rect(c * _boxWidth, r * _boxWidth, _boxWidth, _boxWidth).attr({
                    fill: defaultColor, 
                    stroke: strokeColor, 
                    strokeWidth: borderWidth,
                    boxIndex: (r * _MAX_COL) + c
                });
	        }
	    }
	}
	
	myLibrary.getBoardForDebuggingPurpose = function(){
	    return _gamestateModel.get("answer");
	}
	
	myLibrary.processChange = function(response){
	    
        var data = _.isArray(response[0]) ? response[0] : Array();
        var blankCounter = 0, localCounter = 0, remoteCounter = 0;
        for(var i = 0; i < data.length; i++){
            
            if(data[i].player && data[i].player == _localUser.playerID){
                paintWord(data[i].orientation, data[i].x, data[i].y, data[i].overlap, false);
                localCounter++;
            }else if(data[i].player && data[i].player == _remoteUser.playerID){
                paintWord(data[i].orientation, data[i].x, data[i].y, data[i].overlap, true);
                remoteCounter++;
            }else{
                blankCounter++;
            }
        }
        
        if(data.length > 0 && (localCounter + remoteCounter) == nWords){

            var score = 0;
            if(localCounter > remoteCounter){
                score = _scoreboardModel.get(_localUser.playerID) + 1;
                _scoreboardModel.set(_localUser.playerID, score);
            }else{
                score = _scoreboardModel.get(_remoteUser.playerID) + 1;
                _scoreboardModel.set(_remoteUser.playerID, score);
            }
            
            myLibrary._resetGameBoard();
            stage.clear();
            myLibrary.initBoxes();
            myLibrary.resetBoard();
			myLibrary.updateUserScores();
			
        }else if(data.length > 0 && blankCounter == data.length){
            stage.clear();
            myLibrary.initBoxes();
            myLibrary.resetBoard();
			myLibrary.updateUserScores();
        }
        
        console.log("got changes: ");
        console.log(data)
    }

	return myLibrary;
});