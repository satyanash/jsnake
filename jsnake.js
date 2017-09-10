"use strict";

var LEFT = "LEFT", RIGHT = "RIGHT", UP = "UP", DOWN = "DOWN";
var RUNNING = "RUNNING", GAMEOVER = "GAMEOVER", PAUSED = "PAUSED";

var reverseDir = function(direction){
	switch(direction){
		case UP: return DOWN;
		case DOWN: return UP;
		case LEFT: return RIGHT;
		case RIGHT: return LEFT;
	}
};

var logState = function(state){
	document.getElementById("score").innerHTML = state.score;
	document.getElementById("length").innerHTML = state.snake.cells.length;
	document.getElementById("snake").innerHTML = snakeHead(state).pos.x + " " + snakeHead(state).pos.y;
	document.getElementById("fruit").innerHTML = state.fruit.pos.x + " " + state.fruit.pos.y;
	document.getElementById("tick").innerHTML = state.tickDelay + "ms";
	document.getElementById("state").innerHTML = state.gameState;
};

var randomPoint = function(width,height){
	return {
		x: Math.floor(Math.random() * width),
		y: Math.floor(Math.random() * height),
	};
};

var wrap = function(value, limit){
	if( value < 0){
		return value + limit;
	}
	if( value >= limit){
		return value - limit;
	}
	return value;
};

var wrapPoint = function(point, width, height){
	return {
		x: wrap(point.x, width),
		y: wrap(point.y, height),
	};
};

var clear = function(ctx){
	ctx.fillStyle = "White";
	ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
};

var drawSnake = function(ctx, state){
	ctx.lineWidth = state.snake.cells[0].girth * state.field.scaleFactor / 5;

	for(var i=0; i < state.snake.cells.length; i++){
		var cell = state.snake.cells[i];
		var x = cell.pos.x * state.field.scaleFactor;
		var y = cell.pos.y * state.field.scaleFactor;
		var girth = cell.girth * state.field.scaleFactor;

		ctx.fillStyle = i === 0 ? "Blue" : "Red";
		ctx.fillRect(x, y, girth, girth);
		ctx.strokeStyle = "White";
		i && ctx.strokeRect(x, y, girth, girth);

		if( i > 1){
			var boneWidth = cell.girth * state.field.scaleFactor / 5;
			switch(cell.dir){
				case UP:
					ctx.fillRect(x+(girth/2)-(boneWidth/2), y-(girth/2), boneWidth, girth);
					break;
				case DOWN:
					ctx.fillRect(x+(girth/2)-(boneWidth/2), y+(girth/2), boneWidth, girth);
					break;
				case LEFT:
					ctx.fillRect(x-(girth/2), y+(girth/2)-(boneWidth/2), girth, boneWidth);
					break;
				case RIGHT:
					ctx.fillRect(x+(girth/2), y+(girth/2)-(boneWidth/2), girth, boneWidth);
					break;
			}
		}
	}
};

var drawFruit = function(ctx, state){
	var x = state.fruit.pos.x * state.field.scaleFactor;
	var y = state.fruit.pos.y * state.field.scaleFactor;
	var s = state.snake.cells[0].girth * state.field.scaleFactor;

	ctx.fillStyle = "Green";
	ctx.fillRect(x,y,s,s);
};

var moveSnake = function(state, movementDelta){
	for(var i=state.snake.cells.length-1; i >= 0; i--){
		state.snake.cells[i].pos = wrapPoint(
			getNextPos(state.snake.cells[i].pos, state.snake.cells[i].dir),
			state.field.width,
			state.field.height,
		);
		if(i===0){
			state.snake.cells[i].dir = state.snake.cells[i].dir;
		} else {
			state.snake.cells[i].dir = state.snake.cells[i-1].dir;
		}
	}
};

var getNewFruitPos = function(state){
	var p;
	var collision = true;
	while(collision){
		p = randomPoint(state.field.width, state.field.height);
		collision = false;
		for(var i=0; i < state.snake.cells.length; i++){
			var cell = state.snake.cells[i];
			if(p.x === cell.pos.x && p.y === cell.pos.y){
				collision = true;
				break;
			}
		}
	}
	return p;
};

var initializeCtx = function(state){
	var canvas = document.getElementById("canvas");
	canvas.width = state.field.width * state.field.scaleFactor;
	canvas.height = state.field.height * state.field.scaleFactor;
	return canvas.getContext("2d");
};

var getNextPos = function(startPos, direction){
	let movementDelta = 1;
	switch(direction){
		case UP:
			return {
				x: startPos.x,
				y: startPos.y - movementDelta,
			};
			break;
		case RIGHT:
			return {
				x: startPos.x + movementDelta,
				y: startPos.y,
			};
			break;
		case DOWN:
			return {
				x: startPos.x,
				y: startPos.y + movementDelta,
			};
			break;
		case LEFT:
			return {
				x: startPos.x - movementDelta,
				y: startPos.y,
			};
			break;
	}
};

var createInitialSnake = function(state, startPos){
	var initialDirection = RIGHT;
	var lastPos = startPos;
	for(var i=0; i<state.snake.initalLength; i++){
		state.snake.cells.push({
			pos: lastPos,
			dir: initialDirection,
			girth: 1,
		});
		lastPos = getNextPos(lastPos, reverseDir(initialDirection));
	}
	state.nextDir = initialDirection;
};

var turnSnake = function(state, movementDelta){
	if( snakeHead(state).dir !== state.nextDir && snakeHead(state).dir !== reverseDir(state.nextDir)){
		snakeHead(state).dir = state.nextDir;
		//moveSnake(state, movementDelta);
	}
};

var growSnake = function(state, lengthDelta){
	var tail = snakeTail(state);
	state.snake.cells.push({
		pos: getNextPos(tail.pos, reverseDir(tail.dir)),
		dir: tail.dir,
		girth: 1,
	});
};

var snakeHead = function(state){
	return state.snake.cells[0];
};
var snakeTail = function(state){
	return state.snake.cells[state.snake.cells.length - 1];
};

var getInitialGameState = function(){
	var defaultWidth = 50;
	var defaultHeight = 25;

	return {
		gameState: RUNNING,
		tickDelay: 100,
		field: {
			scaleFactor: 25,
			width: defaultWidth,
			height: defaultHeight,
		},
		score: 0,
		snake: {
			initalLength: 5,
			cells: [],
		},
		fruit: {
			pos: randomPoint(defaultWidth, defaultHeight)
		},
	};
};

var onload = function(ctx){
	var movementDelta = 1;
	var lengthDelta = 1;
	var scoreDelta = 1;
	var tickDelta = -2;

	var state;

	var startNewGame = function(){
		if(state){
			window.cancelAnimationFrame(state.animationId);
			window.clearTimeout(state.tickId);
		}

		state = getInitialGameState();

		var startPos = {
			x: Math.floor(state.field.width / 2),
			y: Math.floor(state.field.height / 2),
		};

		var ctx = initializeCtx(state);
		clear(ctx);

		createInitialSnake(state, startPos);

		//run the animation sequence
		state.animationId = window.requestAnimationFrame(function(){
			drawFrame(ctx,state);
		});

		//start the ticker
		state.tickId = setTimeout(function(){
			tick(state);
		});

		var pauseButtonHandler = function(e){
			if(togglePause(state)){
				e.target.style.borderStyle = 'inset';
			} else {
				e.target.style.borderStyle = 'outset';
			}
		};

		document.getElementById('pauseToggle').removeEventListener('click', pauseButtonHandler);
		document.getElementById('pauseToggle').addEventListener('click', pauseButtonHandler);
		var keyDownHandler = function(e) { handleKeyDown(e, state)};
		document.removeEventListener('keydown', keyDownHandler);
		document.addEventListener('keydown', keyDownHandler);
	};

	var tick = function(state){

		var head = snakeHead(state);
		// check if we ate ourselves
		for(var i=1; i < state.snake.cells.length; i++){
			var cell = state.snake.cells[i];
			if(head.pos.x === cell.pos.x && head.pos.y === cell.pos.y){
				state.gameState = GAMEOVER;
				new Audio('tick.wav').play();
			}
		}

		if(state.gameState === RUNNING){

			// check if we ate the fruit
			if(head.pos.x === state.fruit.pos.x && head.pos.y === state.fruit.pos.y){
				// add new fruit to the field
				state.fruit.pos = getNewFruitPos(state);

				// increase the snake's width
				growSnake(state, lengthDelta);

				// increment point counter
				state.score += scoreDelta;
				state.tickDelay += tickDelta;
				new Audio('ui2.wav').play();
			}

			turnSnake(state, movementDelta);
			moveSnake(state, movementDelta);
			//schedule next call
			state.tickId = setTimeout(function(){tick(state);}, state.tickDelay);
		}
		logState(state);
	};

	var drawFrame = function(ctx, state){
		state.animationId = window.requestAnimationFrame(function(){drawFrame(ctx,state);});
		clear(ctx);
		drawSnake(ctx, state);
		drawFruit(ctx, state);
	};

	var togglePause = function(state){
		if(state.gameState === PAUSED){
			state.gameState = RUNNING;
			//start the ticker
			state.tickId = setTimeout(function(){tick(state);});
			return false;
		} else if(state.gameState === RUNNING){
			state.gameState = PAUSED;
			//clearTimeout(state.tickId);
			//state.tickId = null;
			return true;
		}
	};

	var handleKeyDown = function(e, state){
		switch(e.keyCode){
			case 37://Left Arrow
			case 72:// h key
			case 65:// a key
				state.nextDir = LEFT;
				//turnSnake(state, LEFT, movementDelta);
				break;
			case 38://Up Arrow
			case 75:// k key
			case 87:// w key
				state.nextDir = UP;
				//turnSnake(state, UP, movementDelta);
				break;
			case 39://Right Arrow
			case 76:// l key
			case 68:// d key
				state.nextDir = RIGHT;
				//turnSnake(state, RIGHT, movementDelta);
				break;
			case 40://Down Arrow
			case 74:// j key
			case 83:// s key
				state.nextDir = DOWN;
				//turnSnake(state, DOWN, movementDelta);
				break;

			case 80:// p key
				togglePause(state);
				break;

			case 82:// r key
				startNewGame();
				break;
		}
	};

	document.getElementById('newGameButton').addEventListener('click', startNewGame);
};

