import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import  Stats  from 'three/addons/libs/stats.module.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Axis } from './objects/Axis.js';
import { LocalGameController } from './controllers/LocalGameController.js';
import { RemoteGameController } from './controllers/RemoteGameController.js';
import { REFRESH_RATE } from './macros.js';
import { TWEEN } from 'https://unpkg.com/three@0.139.0/examples/jsm/libs/tween.module.min.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';


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
                
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x101010 );
		this.scene.add(new Axis(this));

		this.gui = new GUI({ autoPlace: false });
		this.gui.domElement.id = 'gui';
		document.getElementById('main-content').appendChild(this.gui.domElement);

		this.scene.add(new THREE.AmbientLight(0xFFFFFF, 0.7));
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
		});
		
		this.canvas.appendChild( this.renderer.domElement );
    }

	loadAssets(callback) {
		const objLoader = new OBJLoader();
		const texLoader = new THREE.TextureLoader();
		const files = ['duck_beak', 'rug', 'button_base_front', 'button_base_top', 'buttons', 'duck_body', 'rainbow_leds', 'metal_fake_screen'];
		const textures = Object.fromEntries(files.map(x => [x, texLoader.load(`/static/assets/textures/${x}.png`)]));

		objLoader.load(
			'/static/assets/models/arcade.obj',
			(object) => {
				const [leds, arcade, _, leds_42, buttons, ducks] = object.children;
				
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
				// this.scene.add(object);
				callback(object);
			}
		);
	}

	initGameController(player1Data, player2Data, gameType, gameID=null){
		if (gameType == "Remote" || gameType == "Tournament"){
			this.gameController = new RemoteGameController({
				scene: this.scene, 
				player1Data: player1Data, 
				player2Data: player2Data,
				gameType: gameType,
				gameID: gameID,
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

        this.camera = new THREE.PerspectiveCamera( 50, aspect, 0.1, 50 )
        this.camera.position.set(5, 5, 1.2);
		
		const coords = { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z};
		new TWEEN.Tween(coords)
			.to({x: 0, y: 0.15, z: 0.7 }, 1500)
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