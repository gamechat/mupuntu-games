// All game assets are relative to this directory
var resPath = "http://localhost/assets";

// Request the images early on before our init() is called
ImageLibrary = (function (){

	ImageLibrary = {};
	// The TTT image representing the board
	var gameboard = new Image();
	gameboard.src = resPath + "/img/GameBoard.png";

	gameboard.addEventListener("load", function(){
		ImageLibrary.gameboard = gameboard;
	}, false);

	// the X image
	var Ximage = new Image();
	Ximage.src = resPath + "/img/x.png";

	Ximage.addEventListener("load", function(){
		ImageLibrary.Ximage = Ximage;
	}, false);

	// the O image
	var Oimage = new Image();
	Oimage.src = resPath + "/img/o.png";

	Oimage.addEventListener("load", function(){
		ImageLibrary.Oimage = Oimage;
	}, false);

	// the Blanc Transparent image
	var BlankImage = new Image();
	BlankImage.src = resPath + "/img/blank.png";

	BlankImage.addEventListener("load", function(){
		ImageLibrary.BlankImage = BlankImage;
	}, false);
	
	return ImageLibrary;
}());


/*
* @author Daser Retnan <dretnan@acm.org>
* @date Thu 10 August 2014 08:50:32 PM GMT
* @Description: My Game Library
*/

(function (libraryName, global, definition) {

	global[libraryName] = definition(_, Backbone);

})('myLibrary', this, function (_, Backbone) {

	"use strict";

	var _gamestateModel, _scoreboardModel;
	var _localUser, _remoteUser;

	var _BOTTOM_LEFT_Y, _BOTTOM_LEFT_X, _MIDDLE_X, _MIDDLE_Y, _MIDDLE_LEFT_X, 
		_MIDDLE_LEFT_Y, _MIDDLE_RIGHT_X, _MIDDLE_RIGHT_Y, _TOP_LEFT_X, 
			_TOP_LEFT_Y, _TOP_MIDDLE_X, _TOP_MIDDLE_Y, _MIDDLE_BOTTOM_X,
				_MIDDLE_BOTTOM_Y, _BOTTOM_RIGHT_Y, _BOTTOM_RIGHT_X, 
					_TOP_RIGHT_X, _TOP_RIGHT_Y;

	var _positionLayers = {zero: null, one: null, two: null, three: null, 
		four: null, five: null, six: null, seven: null, eight: null};

	var _width, _height, // Screen Dimension
		_mWidth, _mHeight, // Middle Section Dimension
			_tWidth, _tHeight, // Top Section Dimension
				_bWidth, _bHeight, // Bottom Section Dimension
					_divContainer, _canvasInstance, _canvasLayer;

	var _winingState = [ ["one", "eight", "five"], ["zero", "one", "two"], 
	["two", "three", "four"], ["four", "five", "six"], ["six", "seven", "zero"], 
	["zero", "eight", "four"], ["two", "eight", "six"], ["three", "eight", "seven"] ];
	var _positions = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];

	/**
	* This function along with the preloaded images are the only
	* Changeable sections to target different form factors.
	* Every other thing stay the same
	*/

	function _fillDimensions (){

		_BOTTOM_LEFT_Y = _mHeight - ( 18 * 1.3 ); // = vOK
		_BOTTOM_LEFT_X = (0.1 * _width) - ( (ImageLibrary.Ximage.width / 2) * 1.3 );// 1.3 growth ratio  = vOK
		_MIDDLE_X = _width / 2 - ImageLibrary.Ximage.width / 2; // = vOK
		_MIDDLE_Y = _height / 2 - ImageLibrary.Oimage.height / 2; // = vOK
		_MIDDLE_LEFT_X = (0.1 * _width) - ( (ImageLibrary.Ximage.width / 2) * 1.3 );// 1.3 growth ratio  = vOK
		_MIDDLE_LEFT_Y = _height / 2 - ImageLibrary.Oimage.height / 2; // = OK
		_MIDDLE_RIGHT_X = _mWidth;
		_MIDDLE_RIGHT_Y = _height / 2 - ImageLibrary.Oimage.height / 2; // = vOK;
		_TOP_LEFT_X = (0.1 * _width) - ( (ImageLibrary.Ximage.width / 2) * 1.3 );// 1.3 growth ratio = vOK
		_TOP_LEFT_Y = 0;
		_TOP_MIDDLE_X =  _width / 2 - ImageLibrary.Ximage.width / 2; // = vOK
		_TOP_MIDDLE_Y = 0;
		_MIDDLE_BOTTOM_X =  _width / 2 - ImageLibrary.Ximage.width / 2; // = vOK
		_MIDDLE_BOTTOM_Y =  _mHeight - ( 18 * 1.3 ); // = vOK
		_BOTTOM_RIGHT_Y = _mHeight - ( 18 * 1.3 ); // = vOK
		_BOTTOM_RIGHT_X = _mWidth;
		_TOP_RIGHT_X = _mWidth;
		_TOP_RIGHT_Y = 0;
	}

	function _getXYOfPosition(position){

        if (position == "zero")
            return {x: _BOTTOM_LEFT_X, y: _BOTTOM_LEFT_Y};
        if (position == "one")
            return {x: _MIDDLE_BOTTOM_X, y: _MIDDLE_BOTTOM_Y};
        if (position == "two")
            return {x: _BOTTOM_RIGHT_X, y: _BOTTOM_RIGHT_Y};
        if (position == "three")
            return {x: _MIDDLE_RIGHT_X, y: _MIDDLE_RIGHT_Y};
        if (position == "four")
            return {x: _TOP_RIGHT_X, y: _TOP_RIGHT_Y};
        if (position == "five")
            return {x: _TOP_MIDDLE_X, y: _TOP_MIDDLE_Y};
        if (position == "six")
            return {x: _TOP_LEFT_X, y: _TOP_LEFT_Y};
        if (position == "seven")
            return {x: _MIDDLE_LEFT_X, y: _MIDDLE_LEFT_Y};
        if (position == "eight")
            return {x: _MIDDLE_X, y: _MIDDLE_Y};
    }

    function _inWord(number){

		switch (number) {
			case 0:
				return 'zero';
			case 1:
				return 'one';
			case 2:
				return 'two';
			case 3:
				return 'three';
			case 4:
				return 'four';
			case 5:
				return 'five';
			case 6:
				return 'six';
			case 7:
				return 'seven';
			case 8:
				return 'eight';
			default:
				throw new Error("invalid argument");
		}
    }

    function _getWhoPlaysFirst(localPlayerID, remotePlayerID){
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

	function _pupulateGameStateModel(){

		// This is not a recommended approach
		// A recommended approach is to create a giant object and set() at once instead of in segments
		_resetGameBoard();
		_gamestateModel.set('turn',{
			player: _getWhoPlaysFirst(_localUser.playerID, _remoteUser.playerID),
		});
	}

	// Fresh GameBoard
	function _resetGameBoard(){
		_gamestateModel.set('gameboard', _getGameBoard());
	}

	function _getGameBoard(){

		var gameboard = {
			zero:{
				status: false,
				player: null
			},
			one:{
				status: false,
				player: null
			},
			two:{
				status: false,
				player: null
			},
			three:{
				status: false,
				player: null
			},
			four:{
				status: false,
				player: null
			},
			five:{
				status: false,
				player: null
			},
			six:{
				status: false,
				player: null
			},
			seven:{
				status: false,
				player: null
			},
			eight:{
				status: false,
				player: null
			}
		};

		return gameboard;
	}

	function _pupulateScoreBoardModel (){
		_scoreboardModel.set('totalgames', 0);
		// Use playerId has a key
		_scoreboardModel.set(_localUser.playerID, 0);
		_scoreboardModel.set(_remoteUser.playerID, 0);
	}

	var myLibrary = {

		initCanvas : function(){

			if( _.isNumber(_width) && _.isNumber(_height) && 
				_.isString(_divContainer) ){

				_canvasInstance = new Kinetic.Stage({
					container: _divContainer,
					width: _width,
					height: _height,
				});

				// _canvasInstance.clear();

				_canvasLayer = new Kinetic.Layer();

				var board = new Kinetic.Image({
					x: (0.1 * _width) / 2,
					y: (0.1 * _height) / 2,
					image: ImageLibrary.gameboard,
					width: _mWidth,
					height: _mHeight,
	            });

				_canvasLayer.add(board);
				_canvasLayer.draw();
				_canvasInstance.add(_canvasLayer);
				_fillDimensions();
			} else {
				throw new Error("define canvas dimensions first");
			}
		},


		resetBoard : function(){

			// TODO, to Avoid accumulated memory leaks

	    	// FILL the CANVAS --> board ---> With Blank Images capable of receiving click or touch events
	        for (var i = 0; i <= 8; i++){
	        	// To put each image in its own layer, ID them for ref purpose
	        	_positionLayers[_inWord(i)] = new Kinetic.Layer({
	        		id: _inWord(i)});
	        }

	        var gameboard = _gamestateModel.get("gameboard");
			
	        for (i = 0; i <= 8; i++){

	        	// Create a {Width: 50, height: 50} on the x,y axis
	        	// if ( gameboard[_inWord(i)] == _localUser.playerID) {
	        	if ( !gameboard[_inWord(i)].status) {
		    		
		            var blank = new Kinetic.Image({
		            	x: _getXYOfPosition(_inWord(i)).x,
		            	y: _getXYOfPosition(_inWord(i)).y,
		            	width: ImageLibrary.BlankImage.width,
		            	height: ImageLibrary.BlankImage.height,
		            	image: ImageLibrary.BlankImage,
		            	id: i,
		            });
		            // add the created blank.png to each layer
		            _positionLayers[_inWord(i)].add(blank);
		            // draw the added layer
		            _positionLayers[_inWord(i)].draw();

		        }else{

		        	// The current device is the X while remote device Y

		        	if ( gameboard[_inWord(i)].player == _localUser.playerID){

		        		var Ximage = new Kinetic.Image({
			            	x: _getXYOfPosition(_inWord(i)).x,
			            	y: _getXYOfPosition(_inWord(i)).y,
			            	width: ImageLibrary.Ximage.width,
			            	height: ImageLibrary.Ximage.height,
			            	image: ImageLibrary.Ximage,
			            	id: i,
		        		});

		        		// add the created Ximage.png to each layer for local player's moves
		            	_positionLayers[_inWord(i)].add(Ximage);
		            	// draw the added layer
		            	_positionLayers[_inWord(i)].draw();

		        	}else{

		        		var Oimage = new Kinetic.Image({
			            	x: _getXYOfPosition(_inWord(i)).x,
			            	y: _getXYOfPosition(_inWord(i)).y,
			            	width: ImageLibrary.Oimage.width,
			            	height: ImageLibrary.Oimage.height,
			            	image: ImageLibrary.Oimage,
			            	id: i,
		        		});

		        		// add the created Oimage.png to each layer for remote player's moves
		            	_positionLayers[_inWord(i)].add(Oimage);
		            	// draw the added layer
		            	_positionLayers[_inWord(i)].draw();

		        	}		    		

		        }
	        }

	        for (i = 0; i <= 8; i++){
	            _canvasInstance.add(_positionLayers[_inWord(i)]);
	        }

	        var self = this;

	        _canvasInstance.on('click', function(e) {

	        	var position = e.target.getLayer().id();

	        	if (position == 'zero') {
	        		self.updateModelWithMove('zero');
	        	}else if(position == 'one') {
	        		self.updateModelWithMove('one');
	        	}else if(position == 'two') {
	        		self.updateModelWithMove('two');
	        	}else if(position == 'three') {
	        		self.updateModelWithMove('three');
	        	}else if(position == 'four') {
	        		self.updateModelWithMove('four');
	        	}else if(position == 'five') {
	        		self.updateModelWithMove('five');
	        	}else if(position == 'six') {
	        		self.updateModelWithMove('six');
	        	}else if(position == 'seven') {
	        		self.updateModelWithMove('seven');
	        	}else if(position == 'eight') {
	        		self.updateModelWithMove('eight');
	        	}
			});
	    },

	    setProperties : function(params){
			_width = params.width;
			_height = params.height;

			_mWidth = ( _width - Math.floor( 0.1 * _width ) ); // 10% of webview
			_mHeight = ( _height - Math.floor( 0.1 * _height ) );

			_tWidth = params.width;
			_tHeight = 50;
			_bWidth = params.width;
			_bHeight = 50;
			_divContainer = params.canvasName;
			_localUser = params.localPlayer;
			_remoteUser = params.remotePlayer;
		},

	    updateModelWithMove : function(position){
	    	if(!_.isObject(_gamestateModel)) throw new Error("initialize models first");

	    	var playerId = _gamestateModel.get('turn').player;

	    	var gameboard = _gamestateModel.get('gameboard');

	    	// Based on current state of the model
	    	var verdict = this.computeMoves();

	    	if (playerId != _localUser.playerID || gameboard[position].status && 
	    		(verdict == 'WIN' || verdict == 'DRAW')) {
	    		if ( (verdict == 'WIN' || verdict == 'DRAW') ) {
	    			return alert("game over - reset the game");
	    		}
	    		
	    		return alert("Can't play");
	    	}else{
	    		if ( (verdict == 'WIN' || verdict == 'DRAW') ) {
	    			return alert("game over - reset the game");
	    		}
	    	}
	    	
	    	var gamemove = {};
	    	gamemove.gameboard = {};
	    	gamemove.gameboard[position] = {};
	    	gamemove.gameboard[position].status = true;
	    	gamemove.gameboard[position].player = playerId;
	    	gamemove.turn = {};
	    	gamemove.turn.player = _remoteUser.playerID;

	    	// The current device is the X while remote device Y
	    	var Ximage = new Kinetic.Image({
	            	x: _getXYOfPosition(position).x,
	            	y: _getXYOfPosition(position).y,
	            	width: ImageLibrary.Ximage.width,
	            	height: ImageLibrary.Ximage.height,
	            	image: ImageLibrary.Ximage
	        });

	    	_positionLayers[position].add(Ximage);
	            // draw the added layer
	        _positionLayers[position].draw();

	        // It's better to set all relevant fields in one pass that to do it 1-after another
	    	_gamestateModel.set(gamemove);

	    	// Compute Win/Draw based on updated model
	    	verdict = this.computeMoves();

	    	if (verdict == "WIN") {

	    		var scoreboard = {};
	    		scoreboard.totalgames = _scoreboardModel.get('totalgames') + 1;
	    		scoreboard[playerId] = _scoreboardModel.get(playerId) + 1;
	    		// Update localuser scores on the server
	    		_scoreboardModel.set(scoreboard);

	    		// Oopse! The next guy should be me instead
	    		_gamestateModel.set('turn',{player: playerId});

	    		alert("You Win");

	    	}else if(verdict == "DRAW"){
	    		alert("Game is Draw");
	    	}
	    },

	    updateRemoteUsersMove: function(position){

	    	var Oimage = new Kinetic.Image({
	            	x: _getXYOfPosition(position).x,
	            	y: _getXYOfPosition(position).y,
	            	width: ImageLibrary.Oimage.width,
	            	height: ImageLibrary.Oimage.height,
	            	image: ImageLibrary.Oimage
	        });

	    	_positionLayers[position].add(Oimage);
	            // draw the added layer
	        _positionLayers[position].draw();

	        // Compute Win/Draw based on the updated model and report to localuser
	        var verdict = this.computeMoves();

	        if (verdict == "WIN") {
	    		alert("Game Over");
	    	}else if(verdict == "DRAW"){
	    		alert("Game is Draw");
	    	}
	    },

	    // TODO: Not Used Yet
    	handlerGameResetMessage : function(message){
			this.resetBoard();
		},

		resetGameBoard: function(){
			_resetGameBoard();
			this.initCanvas();
			this.resetBoard();
		},
    	
    	zeroCalled: function(data){
    		if (data[0].status)	this.updateRemoteUsersMove("zero");
    	},

    	oneCalled: function(data){
    		if (data[0].status)	this.updateRemoteUsersMove("one");
    	},
    	
    	twoCalled: function(data){
    		if (data[0].status)	this.updateRemoteUsersMove("two");
    	},
    	
    	threeCalled: function(data){
    	 if (data[0].status) this.updateRemoteUsersMove("three");
    	},

    	fourCalled: function(data){
    		if (data[0].status)	this.updateRemoteUsersMove("four");
    	},

    	fiveCalled: function(data){
    		if (data[0].status)	this.updateRemoteUsersMove("five");
    	},

    	sixCalled: function(data){
    		if (data[0].status)	this.updateRemoteUsersMove("six");
    	},
    	
    	sevenCalled: function(data){
    		if (data[0].status)	this.updateRemoteUsersMove("seven");
    	},

    	eightCalled: function(data){
    		if (data[0].status)	this.updateRemoteUsersMove("eight");
    	},

		gamechatModelHandler : function(gamedata){
		    
    		_gamestateModel = gamedata.gamestate;
			_scoreboardModel = gamedata.scoreboard;

			if ( !_.has(gamedata.gamestate.toJSON(), 'gameboard') ) {
				// This is the first time the user is playing tic-tac-toe
				_pupulateGameStateModel();
			}

			if ( !_.has(gamedata.scoreboard.toJSON(), 'totalgames') ) {
				// This is the first time this user is playing tic-tac-toe
				_pupulateScoreBoardModel();
			}
			
			// In the wild card method, the key that changed (* is the direct descendant of gameboard) 
			// should be passed as first parameter, while the whole
			// data is passed as the second parameter
			// gamedata.gamestate.addModelChangeEventListener("gameboard.*", this.processesGameStateChange, this);//chess
			// This method is not fissible in chess or draft, as u will have 100 lines of that
			// but there will be support for that especially for games with fewer boards
			gamedata.gamestate.onChangeEventListener("gameboard.zero", 
				this.zeroCalled, this);
			gamedata.gamestate.onChangeEventListener("gameboard.one", 
				this.oneCalled, this);
			gamedata.gamestate.onChangeEventListener("gameboard.two", 
				this.twoCalled, this);
			gamedata.gamestate.onChangeEventListener("gameboard.three", 
				this.threeCalled, this);
			gamedata.gamestate.onChangeEventListener("gameboard.four", 
				this.fourCalled, this);
			gamedata.gamestate.onChangeEventListener("gameboard.five", 
				this.fiveCalled, this);
			gamedata.gamestate.onChangeEventListener("gameboard.six", 
				this.sixCalled, this);
			gamedata.gamestate.onChangeEventListener("gameboard.seven", 
				this.sevenCalled, this);
			gamedata.gamestate.onChangeEventListener("gameboard.eight", 
				this.eightCalled, this);
			
			// Draw the game here
			this.resetBoard();
    	},

	    computeMoves : function(){

	    	var flag, markedPositions = 0;

	    	var gamestate = _gamestateModel.get('gameboard');

	    	// Check for a win state first
	    	for (var i = 0; i < _winingState.length; i++) {
				flag = 0;
				for (var j = 0; j < _winingState[0].length; j++) {
					if (gamestate[_winingState[i][j]].status && gamestate[_winingState[i][j]].player == _localUser.playerID) {
						flag++;
					}
				}
				if (flag == 3) return "WIN";
			}

			for (i = 0; i < _winingState.length; i++) {
				flag = 0;
				for (j = 0; j < _winingState[0].length; j++) {
					if (gamestate[_winingState[i][j]].status && gamestate[_winingState[i][j]].player == _remoteUser.playerID) {
						flag++;
					}
				}
				if (flag == 3) return "WIN";
			}

			// Check if it's a draw
			_positions.forEach(function(position, index){
				if(gamestate[position].status){
					markedPositions++;
				}
			});

			if (markedPositions == 8) {
				return "DRAW";
			}else{
				return "CONTINUE";
			}
	    },
	};

	return myLibrary;
});