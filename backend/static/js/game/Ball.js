import * as THREE from 'three';
import { BALL_SPEEDUP_FACTOR, BALL_START_SPEED, BALL_RADIUS,
	PADDLE_SEMI_HEIGHT, PADDLE_SEMI_LENGTH, DIRECTION } from './macros.js';

export class Ball extends THREE.Object3D { 
	constructor ({ radius, speed, direction }) {
		super();

		this.radius = radius || BALL_RADIUS;
		this.speed = speed || { 'x': BALL_START_SPEED, 'y': BALL_START_SPEED };
		this.direction = direction || { 'x': DIRECTION.LEFT, 'y': DIRECTION.UP }
		this.rally = 0;
		this.ball = null;
		this.build();
		this.reset();
	}

	build() {
		this.ball = new THREE.Mesh(
			new THREE.SphereGeometry(this.radius),
			new THREE.MeshNormalMaterial()
		);

		this.add(this.ball);
	}

	move(controller) {
		const { arena, player, enemy } = controller;

		this.position.x += this.direction.x * this.speed.x;
		this.position.y += this.direction.y * this.speed.y;
		
		this.collideWithVerticalBounds(arena);
		this.collideWithPaddle(player.paddle, true);
		this.collideWithPaddle(enemy.paddle, false);
		return this.collidedWithGoals(arena, player, enemy);
	}

	collidedWithGoals(arena, player, enemy) {
		const { rightBoundary, leftBoundary } = arena;

		if (this.position.x - this.radius <= leftBoundary.position.x)
			return player;
		else if (this.position.x + this.radius >= rightBoundary.position.x)
			return enemy;
		return null;
	}

	collideWithVerticalBounds(arena) {
		const { upperBoundary, lowerBoundary } = arena;
				
		if (this.position.y + this.radius >= upperBoundary.position.y)
			this.direction.y = DIRECTION.DOWN;
		else if (this.position.y - this.radius <= lowerBoundary.position.y)
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

		//! - Change ball speed according to the speed of the paddle at the time
		if (isPlayer) {
			this.position.x = paddle.position.x + PADDLE_SEMI_LENGTH + this.radius;
			this.speed.x += BALL_SPEEDUP_FACTOR;
			this.direction.x = DIRECTION.RIGHT;
		}
		else {
			this.position.x = paddle.position.x - PADDLE_SEMI_LENGTH - this.radius;
			this.speed.x += BALL_SPEEDUP_FACTOR;
			this.direction.x = DIRECTION.LEFT;
		}	

		this.rally += 1;
	}

	reset() {
		this.rally = 0;
		this.speed.x = BALL_START_SPEED;
		this.speed.y = BALL_START_SPEED;
		this.position.set(0, 0, 0);
	}

	dispose() {
		this.ball.geometry.dispose();
		this.ball.material.dispose();
	}
}