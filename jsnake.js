"use strict";

var LEFT= "LEFT", RIGHT= "RIGHT", UP= "UP", DOWN= "DOWN";

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
	document.getElementById("length").innerHTML = state.snake.length;
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
	}

	/*
	var lengt3 = state.snake.length * state.field.scaleFactor;
	var direction = state.snake.dir;
	var girth = state.snake.girth * state.field.scaleFactor;


	for( var i=0; i < length / girth; i++){
		switch(direction){
			case UP:
				ctx.fillRect(x, y+(i*girth), girth, girth);
				i && ctx.strokeRect(x, y+(i*girth), girth, girth);
				break;
			case DOWN:
				ctx.fillRect(x, y-(i*girth), girth, girth);
				i && ctx.strokeRect(x, y-(i*girth), girth, girth);
				break;
			case LEFT:
				ctx.fillRect(x+(i*girth), y, girth, girth);
				i && ctx.strokeRect(x+(i*girth), y, girth, girth);
				break;
			case RIGHT:
				ctx.fillRect(x-(i*girth), y, girth, girth);
				i && ctx.strokeRect(x-(i*girth), y, girth, girth);
				break;
		}
	}
	*/
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
	
	/*
	//move snake one bit ahead
	switch(state.snake.dir){
		case UP:
			state.snake.pos.y = wrap(state.snake.pos.y - movementDelta, state.field.height);
			break;
		case LEFT:
			state.snake.pos.x = wrap(state.snake.pos.x - movementDelta, state.field.width);
			break;
		case DOWN:
			state.snake.pos.y = wrap(state.snake.pos.y + movementDelta, state.field.height);
			break;
		case RIGHT:
			state.snake.pos.x = wrap(state.snake.pos.x + movementDelta, state.field.width);
			break;
	}
	*/
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
	for(var i=0; i<state.snake.length; i++){
		state.snake.cells.push({
			pos: lastPos,
			dir: initialDirection,
			girth: 1,
		});
		lastPos = getNextPos(lastPos, reverseDir(initialDirection));
	}
};

var turnSnake = function(state, direction, movementDelta){
	if( snakeHead(state).dir !== direction && snakeHead(state).dir !== reverseDir(direction)){
		snakeHead(state).dir = direction;
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
	var defaultWidth = 25;
	var defaultHeight = 25;

	return {
		gameState: "running",
		tickDelay: 100,
		field: {
			scaleFactor: 25,
			width: defaultWidth,
			height: defaultHeight,
		},
		score: 0,
		snake: {
			length: 5,
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

	var startNewGame = function(){
		var state = getInitialGameState();

		var startPos = {
			x: Math.floor(state.field.width / 2),
			y: Math.floor(state.field.height / 2),
		};

		var ctx = initializeCtx(state);
		clear(ctx);

		createInitialSnake(state, startPos);

		//run the animation sequence
		state.animationId = window.requestAnimationFrame(function(){drawFrame(ctx,state);});

		//start the ticker
		state.tickId = setTimeout(function(){
			tick(state);
		});

		document.getElementById('pauseToggle').addEventListener('click', function(e){
			if(togglePause(state)){
				e.target.style.borderStyle = 'inset';
			} else {
				e.target.style.borderStyle = 'outset';
			}
		});
		document.addEventListener('keydown', function(e) { handleKeyDown(e, state)});
	};

	var tick = function(state){

		var head = snakeHead(state);
		// check if we ate the fruit
		if(head.pos.x === state.fruit.pos.x && head.pos.y === state.fruit.pos.y){
			// add new fruit to the field
			state.fruit.pos = randomPoint(state.field.width, state.field.height);

			// increase the snake's width
			growSnake(state, lengthDelta);

			// increment point counter
			state.score += scoreDelta;
			state.tickDelay += tickDelta;
		}

		moveSnake(state, movementDelta);

		if(state.gameState === "running"){
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
		if(state.gameState === "paused"){
			state.gameState = "running";
			//start the ticker
			state.tickId = setTimeout(function(){tick(state);});
			return false;
		} else if(state.gameState === "running"){
			state.gameState = "paused";
			//clearTimeout(state.tickId);
			//state.tickId = null;
			return true;
		}
	};

	var handleKeyDown = function(e, state){
		switch(e.keyCode){
			case 37:
				turnSnake(state, LEFT, movementDelta);
				break;
			case 38:
				turnSnake(state, UP, movementDelta);
				break;
			case 39:
				turnSnake(state, RIGHT, movementDelta);
				break;
			case 40:
				turnSnake(state, DOWN, movementDelta);
				break;
		}
	};

	document.getElementById('newGameButton').addEventListener('click', startNewGame);
};

