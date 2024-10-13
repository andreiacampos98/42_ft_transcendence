import * as THREE from 'three';
import { Player } from './Player.js';
import { PADDLE_SEMI_HEIGHT, ARENA_SEMI_HEIGHT, PADDLE_SPEED } from './macros.js';

export class RemotePlayer extends Player {
	constructor ({ id, username, position, keybinds=null, onUpdate, isEnemy=false }) {
		super(id, username, position, keybinds);
		this.onUpdate = onUpdate;
		this.isEnemy = isEnemy;
	}

	update(pressedKeys) {
		//! REPOR COM KEYBINDS == NULL
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

		if (pressedKeys[upKey] || pressedKeys[downKey])
			this.onUpdate(this.id, this.username, targetPos.y);
	}

	move(targetY) {
		const target = new THREE.Vector3(...this.paddle.position);

		target.y = targetY;
		this.paddle.position.lerp(target, 0.5);
	}




}