import { Player } from './Player.js';
import { PADDLE_SEMI_HEIGHT, ARENA_SEMI_HEIGHT, PADDLE_SPEED } from './macros.js';

export class RemotePlayer extends Player {
	constructor ({ id, username, position, keybinds=null, socket, isEnemy=false }) {
		super(id, username, position, keybinds);
		this.socket = socket;
		this.isEnemy = isEnemy;
		if (isEnemy)
			this.socket.onmessage = (event) => {
				console.log(event);
				const newY = JSON.parse(event.data).paddle.position.y;
				this.paddle.position.y = newY;
			}

		this.socket.onerror = (event) => {
			console.log(event);
		}
	}

	update(pressedKeys) {
		if (this.isEnemy)
			return ;

		const targetPos = this.paddle.position.clone();
		const { up: upKey, down: downKey } = this.keybinds;

		if (pressedKeys[upKey]) {
			targetPos.y = Math.min(
				this.paddle.position.y + PADDLE_SPEED,
				ARENA_SEMI_HEIGHT - PADDLE_SEMI_HEIGHT
			);
		}
		
		if (pressedKeys[downKey]){
			targetPos.y = Math.max(
				this.paddle.position.y - PADDLE_SPEED,
				-(ARENA_SEMI_HEIGHT - PADDLE_SEMI_HEIGHT)
			);
		}

		if (pressedKeys[upKey] || pressedKeys[downKey]) {
			this.paddle.position.lerp(targetPos, 0.5);
			this.socket.send(JSON.stringify({
				'id': this.id,
				'paddle': {
					'position': {
						'y': targetPos.y
					}
				}
			}));
		}
	}


}