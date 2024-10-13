import * as THREE from 'three';
import { ARENA_SEMI_LENGTH, PADDLE_SEMI_HEIGHT, PADDLE_SEMI_LENGTH, PADDLE_SPEED } from './macros.js';

export class AbstractPlayer {
	constructor ({id, username, x, keybinds}) {
		this.id = id
		this.username = username;
		this.keybinds = keybinds;
		this.paddle = null;

		this.build();
		this.paddle.position.x = x;
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

	update () {}
}