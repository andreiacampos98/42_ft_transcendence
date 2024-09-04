import * as THREE from 'three';

const PRESSED_CONTROLS = {
	'w': false,
	's': false
};

export class GameDisplay extends THREE.Group {
	constructor({}) {
		super();
		this.build();
		
		document.addEventListener('keydown', (event) => {
			console.log(event.key.toLowerCase(), event.key.toLowerCase() in PRESSED_CONTROLS);
			if (event.key.toLowerCase() in PRESSED_CONTROLS)
				PRESSED_CONTROLS[event.key.toLowerCase()] = true;
		});
		document.addEventListener('keyup', (event) => {
			console.log(event.key.toLowerCase(), event.key.toLowerCase() in PRESSED_CONTROLS);
			if (event.key.toLowerCase() in PRESSED_CONTROLS)
				PRESSED_CONTROLS[event.key.toLowerCase()] = false;
		});
	}

	build() {
		this.myPaddle = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 5, 0.5),
			new THREE.MeshPhongMaterial()
		);
		this.enemyPaddle = this.myPaddle.clone();

		this.myPaddle.position.set(-15, 0, 0);
		this.enemyPaddle.position.set(15, 0, 0);

		this.add(this.myPaddle, this.enemyPaddle);
	}

	update() {
		if (PRESSED_CONTROLS['w']) {
			this.myPaddle.position.y += 0.5;
		}
		if (PRESSED_CONTROLS['s']){
			this.myPaddle.position.y -= 0.5;
		}
	}
}