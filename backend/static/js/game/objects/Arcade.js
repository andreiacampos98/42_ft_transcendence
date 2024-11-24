import * as THREE from 'three';
import { Lever } from './Lever.js';
import { LEVER_DEFAULT_ROTATION } from '../macros.js';

export class Arcade extends THREE.Object3D {
	constructor(app) {
		super();
		this.lever1 = null;
		this.lever2 = null;
		this.light = null;
		this.app = app;
		this.build();
		this.position.set(0, -0.646, -0.1);
	}


	build() {	
		this.light = new THREE.PointLight('#FFFFFF', 0.05);
		this.light.position.set(0, 0.788, 0.19);

		this.buildLevers();

		this.add(this.app.arcadeModel.clone());
		this.add(this.light);
		this.app.scene.add(new THREE.PointLightHelper(this.light, 0.05));	
				
		const lightFolder = this.app.gui.addFolder('Light');
        lightFolder.add(this.light, 'intensity', 0, 50).name("Intensity");
        lightFolder.add(this.light.position, 'x', -0.5, 0.5).name("X");
        lightFolder.add(this.light.position, 'y', -0.5, 1.5).name("Y");
        lightFolder.add(this.light.position, 'z', -0.5, 0.5).name("Z");
	}

	buildLevers() {
		this.lever1 = new Lever([-0.14, 0.494, 0.2]);
		this.lever2 = new Lever([0.14, 0.494, 0.2]);
		
		this.add(this.lever1, this.lever2);
	}

	update(pressedKeys) {
		if (this.lever1)
			this.lever1.update(pressedKeys);
		if (this.lever2)
			this.lever2.update(pressedKeys);
	}

	lerp (start, end, t) {
		return start + (end - start) * t;
	}
}