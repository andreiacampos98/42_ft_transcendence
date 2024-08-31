import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';

export class MyContents
{

	/**
	   constructs the object
	   @param {MyApp} app The application object
	*/
	constructor(app) {
		this.app = app
		this.axis = null
	}

	init() {
		// create once 
		if (this.axis === null) {
			// create and attach the axis to the scene
			this.axis = new MyAxis(this);
			this.app.scene.add(this.axis);
		}
		
		this.build();
		this.illuminate();

		document.addEventListener('keydown', (e) => console.log(e), false);
	}

	/**
	 * Adds all the lights to the scene
	 * @returns {void}
	 */
	illuminate() {
		this.ambientLight = new THREE.AmbientLight(0x555555);
		this.pointLight = new THREE.PointLight(0xFFFFFF, 150);
		this.pointLight.position.set(1, 1, 0);
		
		this.app.scene.add(this.pointLight);
		this.app.scene.add(new THREE.PointLightHelper(this.pointLight));
		this.app.scene.add(this.ambientLight);
	}

	/**
	 * Builds the contents of the scene
	 * @returns {void}
	 */
	build() {
		this.pylon = new THREE.Mesh(
			new THREE.BoxGeometry(1, 3, 1),
			new THREE.MeshPhongMaterial()
		);
		this.app.scene.add(this.pylon);
	}

	movePlayerPylon(key) {
		// if (key == KeyboardEvent.)
	}
	/**
	 * Attach objects to other so transformations affect them as a group
	 * (Scenegraph concept)
	 * @returns {void}
	 */
	connectSceneGraph() {
		
	}
	
	update() {
		
	}
}