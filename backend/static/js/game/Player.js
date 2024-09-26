import * as THREE from 'three';
import { PADDLE_SEMI_HEIGHT, PADDLE_SEMI_LENGTH, PADDLE_SPEED } from './macros.js';
export class Player {
	constructor (id, alias, position, controls) {
		this.id = id
		this.alias = alias;
		this.controls = controls;
		this.paddle = null;

		this.build();
		this.paddle.position.set(...position);
	}

	build() {
		const height = 2 * PADDLE_SEMI_HEIGHT;
		const length = 2 * PADDLE_SEMI_LENGTH;
		const depth = length;

		this.paddle = new THREE.Mesh(
			new THREE.BoxGeometry(length, height, depth),
			new THREE.MeshNormalMaterial()
		);
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