import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';


export class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.gui = new GUI({ autoPlace: false });
        this.contents = null

		this.gui.domElement.id = 'gui';
		document.getElementById('main-content').appendChild(this.gui.domElement)
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        const cameraFolder = this.gui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', Object.keys(this.app.cameras) ).name("active camera");
        cameraFolder.open();
    }
}