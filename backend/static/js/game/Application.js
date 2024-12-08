import * as THREE from 'three';
import  Stats  from 'three/addons/libs/stats.module.js'
import { LocalGameController } from './controllers/LocalGameController.js';
import { RemoteGameController } from './controllers/RemoteGameController.js';
import { FPS, REFRESH_RATE } from './macros.js';
import { TWEEN } from 'https://unpkg.com/three@0.139.0/examples/jsm/libs/tween.module.min.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { AIGameController } from './controllers/AIGameController.js';


var frameID;
var timeoutID;

export class Application  {
    constructor() {
        this.scene = null;

        this.renderer = null;
		this.gameController = null;
		this.activateControls = true;

		this.canvas = document.querySelector('#canvas-container');
		this.framesTimestamps = [];
		this.currFps = 0;
		this.gameCanStart = false;

    }

    init({player1Data, player2Data, gameType, gameID=null}) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x101010 );

		this.scene.add(new THREE.AmbientLight(0xFFFFFF, 1));
		this.buildRoomScene();
	
		this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);

        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setPixelRatio( window.innerWidth / window.innerHeight );
        this.renderer.setClearColor("#000000");
        this.renderer.setSize( this.canvas.clientWidth, this.canvas.clientHeight );

		window.addEventListener('resize', this.onResize.bind(this), false );

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

	buildRoomScene(){
		let backWall = new THREE.Mesh(
			new THREE.PlaneGeometry(3, 1.5),
			new THREE.MeshPhongMaterial({color: 0x222222})
		);
		backWall.position.z = -0.3;

		let floor = backWall.clone();
		floor.position.set(0, -0.5, 0);
		floor.rotation.set(-Math.PI / 2, 0 ,0);

		let light = new THREE.SpotLight(0xAA0000, 10, 3, Math.PI / 6, 0, 1);
		light.position.set(-1, 1, 1);
		this.scene.add(light);

		let light2 = new THREE.SpotLight(0x00AAAA, 10, 3, Math.PI / 6, 0, 1);
		light2.position.set(1, 1, 1);
		this.scene.add(light2);
		

		this.scene.add(backWall);
		this.scene.add(floor);
	}

	loadAssets(callback) {
		new FBXLoader().load(
			'/static/assets/models/arcade.fbx',
			(object) => callback(object)
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
		} 
		else if (gameType == "Local") {
			this.gameController = new LocalGameController({ 
				scene: this.scene,
				player1Data: player1Data, 
				player2Data: player2Data,
				app: this
			});
		}
		else {
			this.gameController = new AIGameController({ 
				scene: this.scene,
				player1Data: player1Data, 
				player2Data: player2Data,
				app: this
			});
		}
		this.scene.add(this.gameController);
	}

    initCamera() {
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;

        this.camera = new THREE.PerspectiveCamera( 80, aspect, 0.1, 50 )
        this.camera.position.set(0, 2, 1);
		
		const params = { 
			x: this.camera.position.x, 
			y: this.camera.position.y, 
			z: this.camera.position.z, 
			fov: this.camera.fov
		};
		new TWEEN.Tween(params)
			.to({x: 0, y: 0, z: 0.75, fov: 45}, 2000)
			.easing(TWEEN.Easing.Cubic.Out)
			.onUpdate(() => {
				this.camera.position.set(params.x, params.y, params.z);
				this.camera.fov = params.fov;
				this.camera.lookAt(0, 0, 0);
				this.camera.updateProjectionMatrix();
			})
			.onComplete(() => {
				this.gameCanStart = true; 
			})
			.start()
    }

    render () {
		let then = Date.now();
		this.stats.begin();
		const updateCallback = (() => {
			if (this.gameCanStart)
				this.gameController.update();
			then = Date.now();
			this.renderer.render(this.scene, this.camera);
			TWEEN.update();
			this.stats.end();

			this.render();
		}).bind(this);

		if (window.location.pathname.startsWith('/game'))
			timeoutID = setTimeout(updateCallback, 32);
    }

	calculateFPS() {
		const now = performance.now();
		while (this.framesTimestamps.length > 0 && this.framesTimestamps[0] <= now - 1000)
			this.framesTimestamps.shift();
	
		this.framesTimestamps.push(now);
		return this.framesTimestamps.length;
	}

	onResize() {
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.activeCamera.aspect = window.innerWidth / window.innerHeight;
            this.activeCamera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        }
    }
}