import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import  Stats  from 'three/addons/libs/stats.module.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Axis } from './objects/Axis.js';
import { LocalGameController } from './controllers/LocalGameController.js';
import { REFRESH_RATE } from './macros.js';
import { RemoteGameController } from './controllers/RemoteGameController.js';
import { Arcade } from './objects/Arcade.js';


var frameID;
var timeoutID;
/**
 * This class contains the application object
 */
export class MyApp  {
    /**
     * the constructor
     */
    constructor() {
        this.scene = null;
        this.cameras = [];

        // other attributes
        this.renderer = null;
        this.controls = null;
		this.gui = null;
		this.gameController = null;
		this.activateControls = true;

		this.canvas = document.querySelector('#canvas-container');
    }

    /**
     * initializes the application
     */
    init({player1Data, player2Data, gameSocket, tournamentSocket, gameType, gameID=null}) {
                
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x101010 );
		this.scene.add(new Axis(this));

		if (gameType == "Remote" || gameType == "Tournament"){
			this.gameController = new RemoteGameController({ 
				player1Data: player1Data, 
				player2Data: player2Data,
				gameSocket: gameSocket,
				gameType: gameType,
				tournamentSocket: tournamentSocket,
				gameID: gameID,
			});
		} else {
			this.gameController = new LocalGameController({ 
				player1Data: player1Data, 
				player2Data: player2Data,
			});
		}
		this.scene.add(this.gameController);
		
		this.light = new THREE.PointLight('#FFFFFF', 50);
		this.light.position.set(0, 0, 5);
		this.scene.add(this.light);

		this.pointLightHelper = new THREE.PointLightHelper(this.light);
		// this.scene.add(this.pointLightHelper);	

		this.gui = new GUI({ autoPlace: false });
		this.gui.domElement.id = 'gui';
		document.getElementById('main-content').appendChild(this.gui.domElement);

		this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
		
		const lightFolder = this.gui.addFolder('Light');
        lightFolder.add(this.light, 'intensity', 0, 50).name("Intensity");
        lightFolder.add(this.light.position, 'x', -30, 30).name("X");
        lightFolder.add(this.light.position, 'y', -30, 30).name("Y");
        lightFolder.add(this.light.position, 'z', -30, 30).name("Z");

		const orbitFolder = this.gui.addFolder('Mouse Controls');
        orbitFolder.add(this, 'activateControls', false).name("Active")
			.onChange((value) => this.setActivateControls(value));

		const arenaFolder = this.gui.addFolder('Arena Controls');
        arenaFolder.add(this.gameController.arena.position, 'x', -30, 30).name("X");
        arenaFolder.add(this.gameController.arena.position, 'y', -30, 30).name("Y");
        arenaFolder.add(this.gameController.arena.position, 'z', -30, 30).name("Z");

		
        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setPixelRatio( this.canvas.clientWidth / this.canvas.clientHeight );
        this.renderer.setClearColor("#000000");
        this.renderer.setSize( this.canvas.clientWidth, this.canvas.clientHeight );

        this.initCameras();
        this.setActiveCamera('Perspective')

        this.canvas.appendChild( this.renderer.domElement );
				
        window.addEventListener('resize', this.onResize.bind(this), false );
    }

    /**
     * initializes all the cameras
     */
    initCameras() {
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;

        const perspective1 = new THREE.PerspectiveCamera( 50, aspect, 0.1, 50 )
        perspective1.position.set(0, 0, 1);
        this.cameras['Perspective'] = perspective1;
    }

    /**
     * sets the active camera by name
     * @param {String} cameraName 
     */
    setActiveCamera(cameraName) {   
        this.activeCameraName = cameraName
        this.activeCamera = this.cameras[this.activeCameraName]
    }

	setActivateControls(value) {
		this.activateControls = value;

		if (this.activateControls)
			this.controls = new OrbitControls( this.activeCamera, this.renderer.domElement );
		else 
			this.controls = null;
	}

    updateOrbitControls() {
        if (!this.activateControls)
			return ;
		
		if (this.controls === null) {
			this.controls = new OrbitControls( this.activeCamera, this.renderer.domElement );
			this.controls.enableZoom = true;
			this.controls.enableDamping = true;
			this.controls.update();
		}
		else {
			this.controls.object = this.activeCamera
		}
    }

    /**
     * the window resize handler
     */
    onResize() {
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.activeCamera.aspect = window.innerWidth / window.innerHeight;
            this.activeCamera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        }
    }
	// Store references to the LED textures

    /**
    * the main render function. Called in a requestAnimationFrame loop
    */
    render () {
		const updateCallback = (() => {
			this.stats.begin();
			this.updateOrbitControls();
			
			if (this.controls != null)
				this.controls.update();

			this.gameController.update();
			this.renderer.render(this.scene, this.activeCamera);
			frameID = requestAnimationFrame( this.render.bind(this) );
			
			this.lastCameraName = this.activeCameraName;
			this.stats.end();
		}).bind(this);

		if (window.location.pathname.startsWith('/game'))
			timeoutID = setTimeout(updateCallback, REFRESH_RATE);
    }
}