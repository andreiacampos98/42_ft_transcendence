import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';

export class MyContents
{

	/**
	   constructs the object
	   @param {MyApp} app The application object
	*/
	constructor(app)
	{
		this.app = app
		this.axis = null
	}

	/**
	 * initializes the contents
	 */
	init()
	{
		// create once 
		if (this.axis === null) {
			// create and attach the axis to the scene
			this.axis = new MyAxis(this);
			this.app.scene.add(this.axis);
		}
		
		this.build();
		this.illuminate();
	}

	/**
	 * Adds all the lights to the scene
	 * @returns {void}
	 */
	illuminate()
	{
		// add an ambient light
		this.ambientLight = new THREE.AmbientLight(0x555555);
		this.app.scene.add(this.ambientLight);
	}

	/**
	 * Builds the contents of the scene
	 * @returns {void}
	 */
	build()
	{
		
	}
	
	/**
	 * Attach objects to other so transformations affect them as a group
	 * (Scenegraph concept)
	 * @returns {void}
	 */
	connectSceneGraph()
	{
		
	}
	
	update()
	{
		
	}
}