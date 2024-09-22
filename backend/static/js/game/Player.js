import * as THREE from 'three';

export class Player {
	constructor (id, alias, position, controls) {
		this.id = id
		this.alias = alias;

		this.paddleSemiLength = 0.5;
		this.paddleSemiHeight = 2.5;
		this.paddleSpeed = 2;
		this.paddle = null;

		this.controls = controls;
			
		this.build();
		this.paddle.position.set(position[0], position[1], position[2]);
	}

	build() {
		const height = 2 * this.paddleSemiHeight;
		const length = 2 * this.paddleSemiLength;
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
				this.paddle.position.y + this.paddleSpeed,
				arenaSemiHeight - this.paddleSemiHeight
			);
		}
		
		if (pressedKeys[downKey]){
			this.paddle.position.y = Math.max(
				this.paddle.position.y - this.paddleSpeed,
				-(arenaSemiHeight - this.paddleSemiHeight)
			);
		}
		this.paddle.position.lerp(targetPos, 0.5);
	}
}