import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { ALTERNATE_KEYBINDS, LEVER_BOTTOM_RADIUS, LEVER_HEIGHT, 
	LEVER_MAX_ROTATION, LEVER_MIN_ROTATION, LEVER_NO_ROTATION, 
	LEVER_ROTATION_STEP, LEVER_TOP_RADIUS, STANDARD_KEYBINDS 
} from '../macros.js';
import { Lever } from './Lever.js';

export class Arcade extends THREE.Object3D {
	constructor(scene, app) {
		super();
		this.scene = scene;
		this.lever1 = null;
		this.lever2 = null;
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
				
				leds.material = new THREE.MeshPhongMaterial({map: textures['rainbow_leds'], emissive: true, emissiveIntensity: 100});
				arcade.material[0] = new THREE.MeshPhongMaterial({map: textures['rug']});
				arcade.material[1] = new THREE.MeshPhongMaterial({map: textures['button_base_top']});
				arcade.material[2] = new THREE.MeshPhongMaterial({map: textures['button_base_front']});
				arcade.material[3] = new THREE.MeshPhongMaterial({map: textures['metal_fake_screen']});
				arcade.material[4] = new THREE.MeshBasicMaterial({color: '#000000'});

				leds_42.material = new THREE.MeshPhongMaterial({map: textures['rainbow_leds']});
				
				buttons.material = new THREE.MeshPhongMaterial({map: textures['buttons']});
				
				ducks.material[0] = new THREE.MeshLambertMaterial({color: '#000000'});
				ducks.material[1] = new THREE.MeshPhongMaterial({map: textures['duck_body']});
				ducks.material[2] = new THREE.MeshPhongMaterial({map: textures['duck_beak']});
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
		let geometry = new THREE.CylinderGeometry(LEVER_TOP_RADIUS, LEVER_BOTTOM_RADIUS, LEVER_HEIGHT);
		let material = new THREE.MeshNormalMaterial();
		let leverBody = new THREE.Mesh(geometry, material);

		geometry = new THREE.SphereGeometry(LEVER_TOP_RADIUS, 32, 32, 0, 2 * Math.PI, 0, 0.5 * Math.PI);
		let leverHead = new THREE.Mesh(geometry, material);
		leverHead.position.y = LEVER_HEIGHT / 2;
		leverHead.position.y += 0.05;
		leverBody.position.y += 0.05;

		this.lever1 = new Lever([-0.14, -0.17, 0.1], null);
		// this.lever1.add(leverBody);
		// this.lever1.add(leverHead);
		// this.lever1.position.set(-0.15, -0.17, 0.08);
		// this.lever1.rotation.set(Math.PI * 0.05, 0, 0);
		this.scene.add(this.lever1);

		this.lever2 = new Lever([0.14, -0.17, 0.1], null);
		this.scene.add(this.lever2);
		
		// this.lever2 = this.lever1.clone();
		// this.lever2.position.set(0.15, -0.17, 0.08);
		// this.scene.add(this.lever2);
	}

	update(pressedKeys) {
		const { up: upKey, down: downKey } = STANDARD_KEYBINDS;
		const { up: upKey2, down: downKey2 } = ALTERNATE_KEYBINDS;
		let step = LEVER_ROTATION_STEP;
		let lever = null;

		if (!this.lever1 || !this.lever2)
			return ;
				
		if (pressedKeys[upKey] || pressedKeys[downKey])
			lever = this.lever1;
		else if (pressedKeys[upKey2] || pressedKeys[downKey2])
			lever = this.lever2;

		if (pressedKeys[downKey] || pressedKeys[downKey2])
			step = -step;
		
		if (!lever) {
			this.lever1.rotation.x = this.lerp(this.lever1.rotation.x, LEVER_NO_ROTATION, 0.3);
			this.lever2.rotation.x = this.lerp(this.lever2.rotation.x, LEVER_NO_ROTATION, 0.3);
			return ;
		}
		
		const target = Math.min(Math.max(lever.rotation.x + step, LEVER_MIN_ROTATION), LEVER_MAX_ROTATION);
		lever.rotation.x = this.lerp(lever.rotation.x, target, 0.5);
	}

	lerp (start, end, t) {
		return start + (end - start) * t;
	}
}