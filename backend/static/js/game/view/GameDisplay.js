import * as THREE from 'three';

const PRESSED_CONTROLS = {
	'w': false,
	's': false
};

export class GameDisplay extends THREE.Group {
	constructor({}) {
		super();
		this.arenaHeight = 20;
		this.arenaLength = 30;
		this.paddleHeight = 2.5;
		
		this.build();
		
		document.addEventListener('keydown', (event) => {
			if (event.key.toLowerCase() in PRESSED_CONTROLS)
				PRESSED_CONTROLS[event.key.toLowerCase()] = true;
		});
		document.addEventListener('keyup', (event) => {
			if (event.key.toLowerCase() in PRESSED_CONTROLS)
				PRESSED_CONTROLS[event.key.toLowerCase()] = false;
		});
	}

	build() {
		this.myPaddle = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 2 * this.paddleHeight, 0.5),
			new THREE.MeshPhongMaterial()
		);
		this.myPaddle.position.set(-(this.arenaLength - 5), 0, 0);

		this.enemyPaddle = this.myPaddle.clone();
		this.enemyPaddle.position.x = -this.enemyPaddle.position.x;
		
		this.add(this.myPaddle, this.enemyPaddle);

		this.buildArena();
		
	}

	buildArena() {
		this.boundaries = new THREE.Group();

		const upperBoundary = new THREE.Mesh(
			new THREE.BoxGeometry(2 * this.arenaLength, 0.5, 0.5),
			new THREE.MeshPhongMaterial()
		);
		const leftBoundary = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 2 * this.arenaHeight, 0.5),
			new THREE.MeshPhongMaterial()
		);
		const lowerBoundary = upperBoundary.clone();
		const rightBoundary = leftBoundary.clone();

		upperBoundary.position.set(0, this.arenaHeight - 0.25, 0);
		lowerBoundary.position.set(0, -this.arenaHeight + 0.25, 0);
		leftBoundary.position.set(-this.arenaLength, 0, 0);
		rightBoundary.position.set(this.arenaLength, 0, 0);

		this.boundaries.add(lowerBoundary, upperBoundary, leftBoundary, rightBoundary);
		this.add(this.boundaries);
	}

	//! Migrate the pressed controls to the game controller
	update() {
		const targetPos = this.myPaddle.position.clone();

		if (PRESSED_CONTROLS['w']) {
			this.myPaddle.position.y = Math.min(
				this.myPaddle.position.y + 2,
				this.arenaHeight - this.paddleHeight - 0.5
			);
		}
		if (PRESSED_CONTROLS['s']){
			this.myPaddle.position.y = Math.max(
				this.myPaddle.position.y - 2,
				-(this.arenaHeight - this.paddleHeight - 0.5)
			);
		}

		this.myPaddle.position.lerp(targetPos, 0.5);
	}
}