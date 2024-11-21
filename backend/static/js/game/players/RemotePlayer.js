import * as THREE from 'three';
import { AbstractPlayer } from './AbstractPlayer.js';
import { PADDLE_SEMI_HEIGHT, ARENA_SEMI_HEIGHT, ARENA_SEMI_DEPTH, PADDLE_SPEED } from '../macros.js';

export class RemotePlayer extends AbstractPlayer {
	constructor ({ id, username, x, keybinds=null, onUpdate }) {
		super({
			id: id, 
			username: username, 
			keybinds:keybinds,
			x: x
		});
		this.onUpdate = onUpdate;
	}

	update(pressedKeys) {
		//! REPOR COM KEYBINDS == NULL
		if (this.keybinds == null)
			return ;

		const targetPos = this.paddle.position.clone();
		const { up: upKey, down: downKey } = this.keybinds;

		if (pressedKeys[upKey]) {
			targetPos.y = Math.min(
				this.paddle.position.y + PADDLE_SPEED,
				ARENA_SEMI_HEIGHT - 2*ARENA_SEMI_DEPTH - PADDLE_SEMI_HEIGHT
			);
		}
		
		if (pressedKeys[downKey]){
			targetPos.y = Math.max(
				this.paddle.position.y - PADDLE_SPEED,
				-(ARENA_SEMI_HEIGHT - 2*ARENA_SEMI_DEPTH - PADDLE_SEMI_HEIGHT)
			);
		}

		if (pressedKeys[upKey] || pressedKeys[downKey])
			this.onUpdate(this.id, this.username, targetPos.y);
	}

	move(targetY) {
		const target = new THREE.Vector3(...this.paddle.position);

		target.y = targetY;
		this.paddle.position.lerp(target, 0.5);
	}
}