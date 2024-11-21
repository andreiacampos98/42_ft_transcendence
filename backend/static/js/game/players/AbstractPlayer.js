import * as THREE from 'three';
import { PADDLE_SEMI_HEIGHT, PADDLE_SEMI_LENGTH, PADDLE_SEMI_DEPTH, PLAYER_COLOR_1, PLAYER_COLOR_2 } from '../macros.js';

export class AbstractPlayer {
	constructor ({id, username, x, keybinds}) {
		this.id = id
		this.username = username;
		this.keybinds = keybinds;
		this.paddle = null;

		this.build(x);
	}

	build(x) {
		const height = 2 * PADDLE_SEMI_HEIGHT;
		const length = 2 * PADDLE_SEMI_LENGTH;
		const depth = 2 * PADDLE_SEMI_DEPTH;
		const color = x < 0 ? PLAYER_COLOR_1 : PLAYER_COLOR_2;

		this.paddle = new THREE.Mesh(
			new THREE.BoxGeometry(length, height, depth),
			new THREE.MeshBasicMaterial({ color: color })
		);
		this.paddle.position.x = x;
	}

	update () {}
}