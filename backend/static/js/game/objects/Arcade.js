import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';


export class Arcade extends THREE.Object3D {
	constructor({scene, position}) {
		super();
		this.scene = scene;
		this.build();
		this.position.set(...position);
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

				this.add(object);
				this.scene.add(this);
			}
		);
	}
}