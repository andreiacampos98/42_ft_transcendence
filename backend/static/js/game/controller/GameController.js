import * as THREE from 'three';

export class GameController extends THREE.Group {
	constructor({}) {
		super();
		
		this.pressedKeys = {
			'w': false,
			's': false
		};

		document.addEventListener('keydown', (event) => {
			if (event.key.toLowerCase() in this.pressedKeys)
				this.pressedKeys[event.key.toLowerCase()] = true;
		});
		document.addEventListener('keyup', (event) => {
			if (event.key.toLowerCase() in this.pressedKeys)
				this.pressedKeys[event.key.toLowerCase()] = false;
		});
	}
}