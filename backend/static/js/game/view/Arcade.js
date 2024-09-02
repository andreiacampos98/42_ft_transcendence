import * as THREE from 'three';
import { GameController } from '../controller/GameController.js';
import { GameDisplay } from './GameDisplay.js';

export class Arcade extends THREE.Group {
	constructor({}) {
		super();
		
		this.controller = new GameController({});
		this.display = new GameDisplay({});
		this.build();

		document.addEventListener
	}

	build() {
		this.add(this.display);

	}
}