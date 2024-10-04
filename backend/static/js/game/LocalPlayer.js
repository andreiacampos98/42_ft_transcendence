import { Player } from './Player.js';
import { PADDLE_SEMI_HEIGHT, PADDLE_SPEED, ARENA_SEMI_HEIGHT } from './macros.js';

export class LocalPlayer extends Player {
	constructor ({id=0, username='Local Player', position, keybinds}) {
		super(id, username, position, keybinds);
	}

	update(pressedKeys) {
		const targetPos = this.paddle.position.clone();
		const { up: upKey, down: downKey } = this.controls;

		if (pressedKeys[upKey]) {
			this.paddle.position.y = Math.min(
				this.paddle.position.y + PADDLE_SPEED,
				ARENA_SEMI_HEIGHT - PADDLE_SEMI_HEIGHT
			);
		}
		
		if (pressedKeys[downKey]){
			this.paddle.position.y = Math.max(
				this.paddle.position.y - PADDLE_SPEED,
				-(ARENA_SEMI_HEIGHT - PADDLE_SEMI_HEIGHT)
			);
		}
		this.paddle.position.lerp(targetPos, 0.5);
	}
}