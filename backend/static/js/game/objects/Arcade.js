import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { Lever } from './Lever.js';

export class Arcade extends THREE.Object3D {
	constructor(scene, app) {
		super();
		this.scene = scene;
		this.lever1 = null;
		this.lever2 = null;
		this.light = null;
		this.app = app;
		this.addLevers();
		this.build();
		this.position.set(0, -0.646, -0.1);
	}

	build() {
		const objLoader = new OBJLoader();
		const texLoader = new THREE.TextureLoader();
		const files = ['duck_beak', 'rug', 'button_base_front', 'button_base_top', 'buttons', 'duck_body', 'rainbow_leds', 'metal_fake_screen'];
		const textures = Object.fromEntries(files.map(x => [x, texLoader.load(`/static/assets/textures/${x}.png`)]));

		objLoader.load(
			'/static/assets/models/arcade.obj',
			(object) => {
				const [leds, arcade, logo_42, leds_42, buttons, ducks] = object.children;
				console.log([leds, arcade, logo_42, leds_42, buttons, ducks]);
				
				leds.material = new THREE.MeshBasicMaterial({map: textures['rainbow_leds']});
				arcade.material[0] = new THREE.MeshPhongMaterial({map: textures['rug']});
				arcade.material[1] = new THREE.MeshPhongMaterial({map: textures['button_base_top']});
				arcade.material[2] = new THREE.MeshPhongMaterial({map: textures['button_base_front']});
				arcade.material[3] = new THREE.MeshPhongMaterial({map: textures['metal_fake_screen']});
				arcade.material[4] = new THREE.MeshBasicMaterial({color: '#000000'});

				leds_42.material = new THREE.MeshBasicMaterial({map: textures['rainbow_leds']});
				
				buttons.material = new THREE.MeshPhongMaterial({map: textures['buttons']});
				
				ducks.material[0] = new THREE.MeshLambertMaterial({color: '#000000'});
				ducks.material[1] = new THREE.MeshLambertMaterial({map: textures['duck_body']});
				ducks.material[2] = new THREE.MeshLambertMaterial({map: textures['duck_beak']});
				console.log(this.app);

				const leverFolder = this.app.gui.addFolder('Lever Controls');
				leverFolder.add(this.lever1.position, 'x', -1, 1).name("X");
				leverFolder.add(this.lever1.position, 'y', -1, 1).name("Y");
				leverFolder.add(this.lever1.position, 'z', -1, 1).name("Z");

				this.add(object);
				this.scene.add(this);
			}
		);
	}

	addLevers() {
		this.lever1 = new Lever([-0.14, -0.17, 0.1]);
		this.lever2 = new Lever([0.14, -0.17, 0.1]);
		this.scene.add(this.lever1, this.lever2);	
		
		this.light = new THREE.PointLight('#FFFFFF', 0.05);
		this.light.position.set(0, 0.788, 0.19);
		this.light2 = new THREE.PointLight('#FFFFFF', 0.05);
		this.light2.position.set(-0.175, 0.788, 0.19);
		this.light3 = new THREE.PointLight('#FFFFFF', 0.05);
		this.light3.position.set(0.175, 0.788, 0.19);
		this.add(this.light, this.light2, this.light3);

		this.scene.add(new THREE.PointLightHelper(this.light, 0.05));	
		this.scene.add(new THREE.PointLightHelper(this.light2, 0.05));	
		this.scene.add(new THREE.PointLightHelper(this.light3, 0.05));	
				
		const lightFolder = this.app.gui.addFolder('Light');
        lightFolder.add(this.light, 'intensity', 0, 50).name("Intensity");
        lightFolder.add(this.light.position, 'x', -0.5, 0.5).name("X");
        lightFolder.add(this.light.position, 'y', -0.5, 1.5).name("Y");
        lightFolder.add(this.light.position, 'z', -0.5, 0.5).name("Z");
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