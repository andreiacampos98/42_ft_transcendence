import * as THREE from 'three';
import { ALTERNATE_KEYBINDS, LEVER_BALL_RADIUS, LEVER_BOTTOM_RADIUS, LEVER_HEIGHT, 
	LEVER_MAX_ROTATION, LEVER_MIN_ROTATION, LEVER_DEFAULT_ROTATION, 
	LEVER_ROTATION_STEP, LEVER_TOP_RADIUS, PLAYER_COLOR_1, PLAYER_COLOR_2, STANDARD_KEYBINDS 
} from '../macros.js';

export class Lever extends THREE.Group {
	constructor(position) {
		super();
		this.keybinds = position[0] < 0 ? STANDARD_KEYBINDS : ALTERNATE_KEYBINDS;
		this.build(position[0]);
		this.position.set(...position);
	}

	build(x) {
		let bodyGeometry = new THREE.CylinderGeometry(LEVER_TOP_RADIUS, LEVER_BOTTOM_RADIUS, LEVER_HEIGHT);
		let bodyMaterial = new THREE.MeshPhongMaterial({color: '#666666'});
		let body = new THREE.Mesh(bodyGeometry, bodyMaterial);

		let headColor = x < 0 ? PLAYER_COLOR_1 : PLAYER_COLOR_2;
		let headGeometry = new THREE.SphereGeometry(LEVER_BALL_RADIUS);
		let headMaterial = new THREE.MeshPhongMaterial({color: headColor, specular: 0xFFFFFF, shininess: 5}); 
		let head = new THREE.Mesh(headGeometry, headMaterial);
		
		head.position.y = LEVER_HEIGHT / 2;
		head.position.y += 0.05;
		body.position.y += 0.05;

		this.add(head);
		this.add(body);
		this.rotation.set(LEVER_DEFAULT_ROTATION, 0, 0);
	}

	update (pressedKeys) {
		const { up, down } = this.keybinds;

		let step = LEVER_ROTATION_STEP;
				
		if (pressedKeys[down]){
			step = -step;
		}
		if (!pressedKeys[up] && !pressedKeys[down]) {
			this.rotation.x = this.lerp(this.rotation.x, LEVER_DEFAULT_ROTATION, 0.3);
		}
		else {
			const target = Math.min(Math.max(this.rotation.x + step, LEVER_MIN_ROTATION), LEVER_MAX_ROTATION);
			this.rotation.x = this.lerp(this.rotation.x, target, 0.3);
		}
	}

	lerp (start, end, t) {
		return start + (end - start) * t;
	}
}