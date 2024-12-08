import * as THREE from 'three';
import { DIRECTION, PADDLE_OFFSET, ARENA_SEMI_HEIGHT, ARENA_SEMI_LENGTH, 
	BALL_RADIUS, 
	ARENA_SEMI_DEPTH,
	PADDLE_SEMI_HEIGHT,
	PADDLE_SPEED,
	PADDLE_BOTTOM_LIMIT,
	PADDLE_TOP_LIMIT} from '../macros.js';
import { AbstractPlayer } from './AbstractPlayer.js';
import { TWEEN } from 'https://unpkg.com/three@0.139.0/examples/jsm/libs/tween.module.min.js';


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
		this.thinkingColor = new THREE.Color(0, 1.0, 0);
		this.originalColor = this.paddle.material.color.clone();
	}

	update(pressedKeys=null, ball, player) {
		let targetPos = this.nextPos.clone();
		if (this.paddle.position.y > this.nextPos.y)
			targetPos.y = Math.max(this.paddle.position.y - PADDLE_SPEED, this.nextPos.y);
		else if (this.paddle.position.y < this.nextPos.y)
			targetPos.y = Math.min(this.paddle.position.y + PADDLE_SPEED, this.nextPos.y);

		this.paddle.position.lerp(targetPos, 0.5);
		
		if (Date.now() - this.lastTimeUpdated < 1000)
			return ;
		this.blinkPaddle();
		let ballDestination = null;
		if (ball.direction.x == DIRECTION.RIGHT) 
			ballDestination = this.predictBallPath(ball);
		
		this.nextPos = this.getFinalAIPosition(ballDestination, player.paddle.position.y);
		this.lastTimeUpdated = Date.now();
	}

	predictBallPath(ball) {
		let t = (PADDLE_OFFSET - BALL_RADIUS - ball.position.x) / ball.direction.x;

		let nextBallY = t * ball.direction.y + ball.position.y;
		let newY = 0;
		if (nextBallY > ARENA_SEMI_HEIGHT)
			newY = 2 * ARENA_SEMI_HEIGHT - nextBallY;
		else if (nextBallY < -1 * ARENA_SEMI_HEIGHT)
			newY = -2 * ARENA_SEMI_HEIGHT + nextBallY ;
		else
			newY = nextBallY;

		if (newY + PADDLE_SEMI_HEIGHT > ARENA_SEMI_HEIGHT - 2 * ARENA_SEMI_DEPTH)
			newY = ARENA_SEMI_HEIGHT - PADDLE_SEMI_HEIGHT - 2 * ARENA_SEMI_DEPTH;
		if (newY - PADDLE_SEMI_HEIGHT < -1 * ARENA_SEMI_HEIGHT + 2 * ARENA_SEMI_DEPTH)
			newY = -1 * ARENA_SEMI_HEIGHT + PADDLE_SEMI_HEIGHT + 2 * ARENA_SEMI_DEPTH;
		return new THREE.Vector3(PADDLE_OFFSET, newY, 0.01);
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

	blinkPaddle() {
		new TWEEN.Tween(this.paddle.material.color)
			.to(this.thinkingColor, 150)
			.easing(TWEEN.Easing.Cubic.Out)
			.onComplete(() => new TWEEN.Tween(this.paddle.material.color)
				.to(this.originalColor, 150)
				.easing(TWEEN.Easing.Cubic.Out)
				.start())
			.start()
	}


};

