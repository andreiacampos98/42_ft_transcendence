import * as THREE from 'three';
import { PADDLE_SEMI_HEIGHT, PADDLE_SEMI_LENGTH, PADDLE_SPEED } from './macros.js';
export class Player {
	constructor (id, username, position, keybinds) {
		this.id = id
		this.username = username;
		this.keybinds = keybinds;
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

	update(pressedKeys) {}
}