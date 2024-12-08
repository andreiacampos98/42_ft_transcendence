import { AbstractPlayer } from './AbstractPlayer.js';
import { PADDLE_SEMI_HEIGHT, PADDLE_SPEED, ARENA_SEMI_HEIGHT, ARENA_SEMI_DEPTH } from '../macros.js';

export class LocalPlayer extends AbstractPlayer {
	constructor ({id=null, username='Local Player', x, picture=null, keybinds}) {
		super({
			id: id,
			username: username,
			x: x,
			picture: picture,
			keybinds: keybinds
		});
	}

	update(pressedKeys) {
		const targetPos = this.paddle.position.clone();
		const { up: upKey, down: downKey } = this.keybinds;

		if (pressedKeys[upKey]) {
			this.paddle.position.y = Math.min(
				this.paddle.position.y + PADDLE_SPEED,
				ARENA_SEMI_HEIGHT - 2*ARENA_SEMI_DEPTH - PADDLE_SEMI_HEIGHT
			);
		}
		
		if (pressedKeys[downKey]){
			this.paddle.position.y = Math.max(
				this.paddle.position.y - PADDLE_SPEED,
				-(ARENA_SEMI_HEIGHT - 2*ARENA_SEMI_DEPTH - PADDLE_SEMI_HEIGHT)
			);
		}
		this.paddle.position.lerp(targetPos, 0.5);
	}
}