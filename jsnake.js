"use strict";

var LEFT= "LEFT", RIGHT= "RIGHT", UP= "UP", DOWN= "DOWN";

var logState = function(state){
	document.getElementById("score").innerHTML = state.score;
	document.getElementById("length").innerHTML = state.snake.length;
	document.getElementById("snake").innerHTML = state.snake.pos.x + " " + state.snake.pos.y;
	document.getElementById("fruit").innerHTML = state.fruit.pos.x + " " + state.fruit.pos.y;
	document.getElementById("tick").innerHTML = state.tickDelay + "ms";
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

var clear = function(ctx){
	ctx.fillStyle = "White";
	ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
};

var drawSnake = function(ctx, state){
	var x = state.snake.pos.x * state.field.scaleFactor;
	var y = state.snake.pos.y * state.field.scaleFactor;
	var length = state.snake.length * state.field.scaleFactor;
	var direction = state.snake.dir;
	var girth = state.snake.girth * state.field.scaleFactor;

	ctx.fillStyle = "Red";
	ctx.strokeStyle = "White";
	ctx.lineWidth = girth / 5;

	for( var i=0; i < length / girth; i++){
		ctx.fillStyle = i === 0 ? "Blue" : "Red";
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
};

var drawFruit = function(ctx, state){
	var x = state.fruit.pos.x * state.field.scaleFactor;
	var y = state.fruit.pos.y * state.field.scaleFactor;
	var s = state.snake.girth * state.field.scaleFactor;

	ctx.fillStyle = "Green";
	ctx.fillRect(x,y,s,s);
};

var moveSnake = function(state, movementDelta){
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
};

var initializeCtx = function(state){
	var canvas = document.getElementById("canvas");
	canvas.width = state.field.width * state.field.scaleFactor;
	canvas.height = state.field.height * state.field.scaleFactor;
	return canvas.getContext("2d");
};

var onload = function(ctx){
	var movementDelta = 1;
	var lengthDelta = 1;
	var scoreDelta = 1;
	var tickDelta = -5;

	var defaultWidth = 50;
	var defaultHeight = 50;

	var state = {
		tickDelay: 100,
		field: {
			scaleFactor: 17,
			width: defaultWidth,
			height: defaultHeight,
		},
		score: 0,
		snake: {
			pos: {
				x : 20,
				y : 20,
			}, 
			dir: RIGHT,
			length: 5,
			girth: 1,
		},
		fruit: {
			pos: randomPoint(defaultWidth, defaultHeight)
		},
	};

	var ctx = initializeCtx(state);
	clear(ctx);

	document.addEventListener('keydown', function(e) {
		switch(e.keyCode){
			case 37:
	  			if( state.snake.dir !== LEFT && state.snake.dir !== RIGHT){
					state.snake.dir = LEFT;
					moveSnake(state, movementDelta);
				}
				break;
			case 38:
	  			if( state.snake.dir !== UP && state.snake.dir !== DOWN){
					state.snake.dir = UP;
					moveSnake(state, movementDelta);
	  			}
				break;
			case 39:
	  			if( state.snake.dir !== LEFT && state.snake.dir !== RIGHT){
					state.snake.dir = RIGHT;
					moveSnake(state, movementDelta);
	  			}
				break;
			case 40:
	  			if( state.snake.dir !== UP && state.snake.dir !== DOWN){
					state.snake.dir = DOWN;
					moveSnake(state, movementDelta);
	  			}
				break;
		}
	});

	var tick = function(){
		moveSnake(state, movementDelta);

		// check if we ate the fruit
		if(state.snake.pos.x === state.fruit.pos.x && state.snake.pos.y === state.fruit.pos.y){
			state.fruit.pos = randomPoint(state.field.width, state.field.height);
			state.snake.length += lengthDelta;
			state.score += scoreDelta;
			state.tickDelay += tickDelta;
		}

		logState(state);

		//schedule next call
		state.tickId = setTimeout(tick, state.tickDelay);
	};

	//run the animation sequence
	window.requestAnimationFrame(function drawFrame(){
		window.requestAnimationFrame(drawFrame);
		clear(ctx);
		drawSnake(ctx, state);
		drawFruit(ctx, state);
	});

	document.getElementById('pauseButton').addEventListener('click', function(e){
		if(state.tickId){
			clearTimeout(state.tickId);
			state.tickId = null;
		}
	});
	document.getElementById('resumeButton').addEventListener('click', function(e){
		if(!state.tickId){
			//start the ticker
			state.tickId = setTimeout(tick);
		}
	});
};

