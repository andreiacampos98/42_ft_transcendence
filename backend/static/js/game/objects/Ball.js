import * as THREE from 'three';
import { BALL_SPEEDUP_FACTOR, BALL_START_SPEED, BALL_RADIUS,
	PADDLE_SEMI_HEIGHT, PADDLE_SEMI_LENGTH, DIRECTION, 
	ARENA_SEMI_DEPTH, BALL_COLOR
} from '../macros.js';

export class Ball extends THREE.Object3D { 
	constructor ({ radius, speed, direction=null, onPaddleHit=null }) {
		super();

		this.radius = radius || BALL_RADIUS;
		this.speed = speed || { 'x': BALL_START_SPEED, 'y': BALL_START_SPEED };
		this.direction = direction || { 'x': DIRECTION.LEFT, 'y': DIRECTION.UP }
		this.rally = 0;
		this.ball = null;
		this.onPaddleHit = onPaddleHit;
		this.build();
		this.reset({});
	}

	build() {
		this.ball = new THREE.Mesh(
			new THREE.CircleGeometry(this.radius),
			new THREE.MeshBasicMaterial({color: BALL_COLOR})
		);
		this.ball.position.z = 0.01;
		
		this.add(this.ball);
	}

	move(controller) {
		const { arena, player1, player2 } = controller;

		this.position.x += this.direction.x * this.speed.x;
		this.position.y += this.direction.y * this.speed.y;
		
		this.collideWithVerticalBounds(arena);
		this.collideWithPaddle(player1.paddle, true);
		this.collideWithPaddle(player2.paddle, false);
		return this.collidedWithGoals(arena, player1, player2);
	}

	collidedWithGoals(arena, player1, player2) {
		const { rightBoundary, leftBoundary } = arena;

		if (this.position.x - this.radius <= leftBoundary.position.x + ARENA_SEMI_DEPTH)
			return player2;
		else if (this.position.x + this.radius >= rightBoundary.position.x - ARENA_SEMI_DEPTH)
			return player1;
		return null;
	}

	collideWithVerticalBounds(arena) {
		const { upperBoundary, lowerBoundary } = arena;
				
		if (this.position.y + this.radius >= upperBoundary.position.y - ARENA_SEMI_DEPTH)
			this.direction.y = DIRECTION.DOWN;
		else if (this.position.y - this.radius <= lowerBoundary.position.y + ARENA_SEMI_DEPTH)
			this.direction.y = DIRECTION.UP;
	}

	collideWithPaddle(paddle, isPlayer){
		const paddleRange = {
			'x': {
				'start': paddle.position.x - PADDLE_SEMI_LENGTH,
				'end': paddle.position.x + PADDLE_SEMI_LENGTH
			},
			'y': {
				'start': paddle.position.y - PADDLE_SEMI_HEIGHT,
				'end': paddle.position.y + PADDLE_SEMI_HEIGHT
			}
		}
		const ballRange = {
			'x': {
				'start': this.position.x - BALL_RADIUS,
				'end': this.position.x + BALL_RADIUS
			},
			'y': {
				'start': this.position.y - BALL_RADIUS,
				'end': this.position.y + BALL_RADIUS
			}
		}

		const minX = paddleRange.x.start < ballRange.x.start ? paddleRange.x : ballRange.x;
		const maxX = minX == paddleRange.x ? ballRange.x : paddleRange.x;
		const minY = paddleRange.y.start < ballRange.y.start ? paddleRange.y : ballRange.y;
		const maxY = minY == paddleRange.y ? ballRange.y : paddleRange.y;

		if (minX.end < maxX.start || minY.end < maxY.start)
			return ;

		if (isPlayer) {
			this.position.x = paddle.position.x + PADDLE_SEMI_LENGTH + this.radius;
			this.speed.x += BALL_SPEEDUP_FACTOR;
			this.speed.y += BALL_SPEEDUP_FACTOR * (Math.random()); // Adjust Y speed
			this.direction.x = DIRECTION.RIGHT;
		}
		else {
			this.position.x = paddle.position.x - PADDLE_SEMI_LENGTH - this.radius;
			this.speed.x += BALL_SPEEDUP_FACTOR;
			this.speed.y += BALL_SPEEDUP_FACTOR * (Math.random()); // Adjust Y speed
			this.direction.x = DIRECTION.LEFT;
		}	

		if (this.onPaddleHit != null)
			this.onPaddleHit();
		this.rally += 1;
	}

	reset({ direction }) {
		this.rally = 0;
		this.speed.x = BALL_START_SPEED;
		this.speed.y = BALL_START_SPEED;
		if (direction)
			this.direction = direction;
		this.position.set(0, 0, 0);
	}

	sync({position, speed, direction}) {
		this.position.set(...position);
		this.speed.x = speed.x;
		this.speed.y = speed.y;
		this.direction = direction;
	}

	dispose() {
		this.ball.geometry.dispose();
		this.ball.material.dispose();
	}
}