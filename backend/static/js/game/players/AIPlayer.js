import * as THREE from 'three';
import { DIRECTION, PADDLE_OFFSET, ARENA_SEMI_HEIGHT, ARENA_SEMI_LENGTH, 
	BALL_RADIUS } from '../macros.js';
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
		this.nextPos = this.position;
	}

	update(pressedKeys=null, ball, player) {
		if (Date.now() - this.lastTimeUpdated < 1000) {
			this.paddle.position.lerp(this.nextPos, 0.1);
			return ;		
		}
		let ball_destination = null;
		// if (ball.direction.x == DIRECTION.RIGHT)
		// ball_destination = this.get_future_path(ball);
		this.nextPos = this.final_AI_position(ball_destination, player.paddle.position.y);
		
		// this.paddle.position.set(...final_pos);
		this.lastTimeUpdated = Date.now();
	}

	get_future_path(ball) {
		// goals = false;
		// while (!goals) {

			let t = -1;
			let temp_ball = {
				'direction': ball.direction,
				'position': {
					'x': ball.position.x,
					'y': ball.position.y
				},
			};
			//for upper wall
			let temp = -1 * ball.position.y - BALL_RADIUS / ball.direction.y;
			if (t == -1 && temp > 0){
				t = temp;
				temp_ball.direction.y *= -1;
				temp_ball.position.y = 0;
				temp_ball.position.x = t * ball.direction.x + BALL_RADIUS + ball.position.x;
			}
			//for lower wall
			temp = (ARENA_SEMI_HEIGHT * 2 - ball.position.y - BALL_RADIUS) / ball.direction.y;
			if ((t == -1 && temp > 0) || ( t != -1 && temp < t && temp > 0)) {
				t = temp;
				temp_ball.direction.y *= -1;
				temp_ball.position.y = ARENA_SEMI_HEIGHT * 2;
				temp_ball.position.x = t * ball.direction.x + BALL_RADIUS + ball.position.x;

			}
			//for aiwall wall
			temp = (ARENA_SEMI_LENGTH * 2 - ball.position.x - BALL_RADIUS) / ball.direction.x;
			if ((t == -1 && temp > 0) || ( t != -1 && temp < t && temp > 0)) {
				t = temp;
				temp_ball.direction.x *= -1;
				temp_ball.position.x = ARENA_SEMI_LENGTH * 2;
				temp_ball.position.y = t * ball.direction.y + BALL_RADIUS + ball.position.y;
			}
			//for player wall
			temp = (-1 * ball.position.x - BALL_RADIUS) / ball.direction.x;
			if ((t == -1 && temp > 0) || ( t != -1 && temp < t && temp > 0)) {
				t = temp;
				temp_ball.direction.x *= -1;
				temp_ball.position.x = 0;
				temp_ball.position.y = t * ball.direction.y + BALL_RADIUS + ball.position.y;
			}
			// ball = temp_ball;
			if (t < 0){
				console.log("Ball outside the arena??");
				// exit(1);
			}
		// }
		t = (PADDLE_OFFSET - ball.position.x) / ball.direction.x;
		return (t * ball.direction.y + ball.position.y);
	};

	final_AI_position(ball_destination, enemy_pos) {
		if (ball_destination == null) {
			if (enemy_pos >= -1/2 * ARENA_SEMI_HEIGHT && enemy_pos <= 1/2 * ARENA_SEMI_HEIGHT) 
				return new THREE.Vector3(...[PADDLE_OFFSET, enemy_pos, 0]);
			else if (enemy_pos > 1/2 * ARENA_SEMI_HEIGHT)
				return new THREE.Vector3(...[PADDLE_OFFSET, 1/2 * ARENA_SEMI_HEIGHT, 0]);
			else 
				return new THREE.Vector3(...[PADDLE_OFFSET, -1/2 * ARENA_SEMI_HEIGHT, 0]);
		}
		return (ball_destination);
	}


};

