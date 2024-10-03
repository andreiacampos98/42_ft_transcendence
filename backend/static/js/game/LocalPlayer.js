import { Player } from './Player.js';
import { PADDLE_SEMI_HEIGHT, PADDLE_SPEED } from './macros.js';

export class LocalPlayer extends Player {
	constructor (id, username, position, controls) {
		super(id, username, position, controls);
	}

	update(pressedKeys, arenaSemiHeight) {
		const targetPos = this.paddle.position.clone();
		const { up: upKey, down: downKey } = this.controls;

		if (pressedKeys[upKey]) {
			this.paddle.position.y = Math.min(
				this.paddle.position.y + PADDLE_SPEED,
				arenaSemiHeight - PADDLE_SEMI_HEIGHT
			);
		}
		
		if (pressedKeys[downKey]){
			this.paddle.position.y = Math.max(
				this.paddle.position.y - PADDLE_SPEED,
				-(arenaSemiHeight - PADDLE_SEMI_HEIGHT)
			);
		}
		this.paddle.position.lerp(targetPos, 0.5);
	}
}