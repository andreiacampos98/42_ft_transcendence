import * as THREE from 'three';
import { Lever } from './Lever.js';
import { LEVER_DEFAULT_ROTATION } from '../macros.js';

export class Arcade extends THREE.Object3D {
	constructor(app) {
		super();
		this.lever1 = null;
		this.lever2 = null;
		this.app = app;
		this.build();
		this.position.set(0, -0.646, -0.1);
	}


	build() {	
		this.lever1 = new Lever([-0.14, 0.494, 0.2]);
		this.lever2 = new Lever([0.14, 0.494, 0.2]);
		
		this.add(this.app.arcadeModel.clone());
		this.add(this.lever1, this.lever2);
	}

	update(pressedKeys) {
		if (this.lever1)
			this.lever1.update(pressedKeys);
		if (this.lever2)
			this.lever2.update(pressedKeys);

		// console.log(this.children);
		this.children[0].children[1].material[1].map.offset.x += 0.01;
		this.children[0].children[1].material[1].map.offset.y += 0.01;
		this.children[0].children[0].material[1].map.offset.x -= 0.01;
		this.children[0].children[0].material[1].map.offset.y -= 0.01;

		console.log(this.children[0].children);
	}

	lerp (start, end, t) {
		return start + (end - start) * t;
	}
}