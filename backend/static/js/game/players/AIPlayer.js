import * as THREE from 'three';
import { DIRECTION, PADDLE_OFFSET, ARENA_SEMI_HEIGHT, ARENA_SEMI_LENGTH, 
	BALL_RADIUS, 
	ARENA_SEMI_DEPTH,
	PADDLE_SEMI_HEIGHT,
	PADDLE_SPEED,
	PADDLE_BOTTOM_LIMIT,
	PADDLE_TOP_LIMIT} from '../macros.js';
import { AbstractPlayer } from './AbstractPlayer.js';

export class AIPlayer extends AbstractPlayer {
	constructor ({id=null, username='Local Player', x, picture=null, keybinds}) {
		super({
			id: id,
			username: username,
			x: x,
			picture: picture,
			keybinds: keybinds
		});
		this.lastTimeUpdated = Date.now();
		this.followingBall = false;
		this.nextPos = this.paddle.position;
		console.log(ARENA_SEMI_HEIGHT);
		console.log('LIMIT Y ', ARENA_SEMI_HEIGHT - 2*ARENA_SEMI_DEPTH - PADDLE_SEMI_HEIGHT);

	}

	update(pressedKeys=null, ball, player) {
		// if (this.followingBall && ball.direction.x != DIRECTION.RIGHT)
		// 	this.nextPos = this.paddle.position;
		// this.paddle.position.lerp(this.nextPos, 0.1);
		// this.followingBall = (ball.direction.x == DIRECTION.RIGHT);
		let targetPos = this.nextPos.clone();
		if (this.paddle.position.y > this.nextPos.y)
			targetPos.y = Math.max(this.paddle.position.y - PADDLE_SPEED, this.nextPos.y);
		else if (this.paddle.position.y < this.nextPos.y)
			targetPos.y = Math.min(this.paddle.position.y + PADDLE_SPEED, this.nextPos.y);

		this.paddle.position.lerp(targetPos, 0.5);
		
		if (Date.now() - this.lastTimeUpdated < 1000)
			return ;		
		let ballDestination = null;
		// if (ball.direction.x == DIRECTION.RIGHT) 
		// 	ballDestination = this.predictBallPath(ball);
		
		this.nextPos = this.getFinalAIPosition(ballDestination, player.paddle.position.y);
		this.lastTimeUpdated = Date.now();
	}

	predictBallPath(ball) {
		// goals = false;
		// while (!goals) {

			let t = -1;
			// let temp_ball = {
			// 	'direction': ball.direction,
			// 	'position': {
			// 		'x': ball.position.x,
			// 		'y': ball.position.y
			// 	},
			// };
			//for upper wall
			let temp = -1 * ball.position.y - BALL_RADIUS / ball.direction.y;
			// if (t == -1 && temp > 0){
			// 	t = temp;
			// 	temp_ball.direction.y *= -1;
			// 	temp_ball.position.y = 0;
			// 	temp_ball.position.x = t * ball.direction.x + BALL_RADIUS + ball.position.x;
			// }
			// //for lower wall
			// temp = (ARENA_SEMI_HEIGHT * 2 - ball.position.y - BALL_RADIUS) / ball.direction.y;
			// if ((t == -1 && temp > 0) || ( t != -1 && temp < t && temp > 0)) {
			// 	t = temp;
			// 	temp_ball.direction.y *= -1;
			// 	temp_ball.position.y = ARENA_SEMI_HEIGHT * 2;
			// 	temp_ball.position.x = t * ball.direction.x + BALL_RADIUS + ball.position.x;

			// }
			//for aiwall wall
			temp = (PADDLE_OFFSET - ball.position.x - BALL_RADIUS) / ball.direction.x;
			// if ((t == -1 && temp > 0) || ( t != -1 && temp < t && temp > 0)) {
			t = temp;

			let nextBallY = t * ball.direction.y + BALL_RADIUS + ball.position.y;
			// console.log('Next Ball y=', nextBallY);
			let limitY = ARENA_SEMI_HEIGHT - 2*ARENA_SEMI_DEPTH - PADDLE_SEMI_HEIGHT;

			// console.log('NEW Y ', newY);
			let newY = Math.abs(nextBallY) % limitY;
			if (Math.abs(nextBallY) > Math.abs(limitY) && nextBallY < 0)
				newY *= -1;
			
			// console.log('Moving to y=', newY);

			// temp_ball.direction.x *= -1;
			// temp_ball.position.x = ARENA_SEMI_LENGTH * 2;
			// temp_ball.position.y = t * ball.direction.y + BALL_RADIUS + ball.position.y;
			return new THREE.Vector3(PADDLE_OFFSET, newY, 0.01);
			// }	
			// //for player wall
			// temp = (-1 * ball.position.x - BALL_RADIUS) / ball.direction.x;
			// if ((t == -1 && temp > 0) || ( t != -1 && temp < t && temp > 0)) {
			// 	t = temp;
			// 	temp_ball.direction.x *= -1;
			// 	temp_ball.position.x = 0;
			// 	temp_ball.position.y = t * ball.direction.y + BALL_RADIUS + ball.position.y;
			// }
			// // ball = temp_ball;
			// if (t < 0){
			// 	console.log("Ball outside the arena??");
			// 	// exit(1);
			// }
		// }
		// t = (PADDLE_OFFSET - ball.position.x) / ball.direction.x;
		// return (t * ball.direction.y + ball.position.y);
	};

	getFinalAIPosition(ball_destination, enemy_pos) {
		if (ball_destination == null) {
			if (enemy_pos >= -1/2 * ARENA_SEMI_HEIGHT && enemy_pos <= 1/2 * ARENA_SEMI_HEIGHT) 
				return new THREE.Vector3(...[PADDLE_OFFSET, enemy_pos, 0.01]);
			else if (enemy_pos > 1/2 * ARENA_SEMI_HEIGHT)
				return new THREE.Vector3(...[PADDLE_OFFSET, 1/2 * ARENA_SEMI_HEIGHT, 0.01]);
			else 
				return new THREE.Vector3(...[PADDLE_OFFSET, -1/2 * ARENA_SEMI_HEIGHT, 0.01]);
		}
		return (ball_destination);
	}


};

