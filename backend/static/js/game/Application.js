import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import  Stats  from 'three/addons/libs/stats.module.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Axis } from './objects/Axis.js';
import { LocalGameController } from './controllers/LocalGameController.js';
import { RemoteGameController } from './controllers/RemoteGameController.js';
import { REFRESH_RATE } from './macros.js';
import { TWEEN } from 'https://unpkg.com/three@0.139.0/examples/jsm/libs/tween.module.min.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';


var frameID;
var timeoutID;

/**
 * This class contains the application object
 */
export class Application  {
    /**
     * the constructor
     */
    constructor() {
        this.scene = null;

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
    init({player1Data, player2Data, gameType, gameID=null}) {
		document.getElementById('loader-container').textContent = 'Building 3D scene...';

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x101010 );
		this.scene.add(new Axis(this));

		this.gui = new GUI({ autoPlace: false });
		this.gui.domElement.id = 'gui';
		document.getElementById('main-content').appendChild(this.gui.domElement);

		this.scene.add(new THREE.AmbientLight(0xFFFFFF, 1));
		this.grid = new THREE.GridHelper(100, 100, 0x00FFFF, 0x00FFFF);
		this.grid.position.y = -0.7;
		this.scene.add(this.grid);

		this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);

		const orbitFolder = this.gui.addFolder('Mouse Controls');
        orbitFolder.add(this, 'activateControls', false).name("Active")
			.onChange((value) => this.setActivateControls(value));
		
        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setPixelRatio( this.canvas.clientWidth / this.canvas.clientHeight );
        this.renderer.setClearColor("#000000");
        this.renderer.setSize( this.canvas.clientWidth, this.canvas.clientHeight );

        this.initCamera();
		this.loadAssets((object) => {
			this.arcadeModel = object;
			this.initGameController(player1Data, player2Data, gameType, gameID);
			this.render();
			document.getElementById('loader-container').remove();
		});
		
		this.canvas.appendChild( this.renderer.domElement );
		setTimeout(() => document.getElementById('scoreboard').style.visibility = 'visible', 500);
    }

	loadAssets(callback) {
		new FBXLoader().load(
			'/static/assets/models/arcade.fbx',
			(object) => {
				console.log(object);
				callback(object);
			}
		);
	}

	initGameController(player1Data, player2Data, gameType, gameID=null){
		if (gameType == "Remote" || gameType == "Tournament"){
			this.gameController = new RemoteGameController({
				player1Data: player1Data, 
				player2Data: player2Data,
				gameType: gameType,
				gameID: gameID,
				app: this
			});
		} else {
			this.gameController = new LocalGameController({ 
				scene: this.scene,
				player1Data: player1Data, 
				player2Data: player2Data,
				app: this
			});
		}
		this.scene.add(this.gameController);
	}

    /**
     * initializes all the cameras
     */
    initCamera() {
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;

        this.camera = new THREE.PerspectiveCamera( 30, aspect, 0.1, 50 )
        this.camera.position.set(0, 0.5, 3);
		
		const coords = { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z};
		new TWEEN.Tween(coords)
			.to({x: 0, y: 0.15, z: 1.2 }, 2000)
			.easing(TWEEN.Easing.Cubic.Out)
			.onUpdate(() =>this.camera.position.set(coords.x, coords.y, coords.z))
			.start();
    }


	setActivateControls(value) {
		this.activateControls = value;

		if (this.activateControls)
			this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		else 
			this.controls = null;
	}

    updateOrbitControls() {
        if (!this.activateControls)
			return ;
		
		if (this.controls === null) {
			this.controls = new OrbitControls( this.camera, this.renderer.domElement );
			this.controls.enableZoom = true;
			this.controls.enableDamping = true;
			this.controls.update();
		}
		else {
			this.controls.object = this.camera;
		}
    }

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
			this.renderer.render(this.scene, this.camera);
			frameID = requestAnimationFrame( this.render.bind(this) );
			TWEEN.update();
			
			this.stats.end();
		}).bind(this);

		if (window.location.pathname.startsWith('/game'))
			timeoutID = setTimeout(updateCallback, REFRESH_RATE);
    }
}