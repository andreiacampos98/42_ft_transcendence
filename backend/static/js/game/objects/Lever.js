import * as THREE from 'three';
import { ALTERNATE_KEYBINDS, LEVER_BALL_RADIUS, LEVER_BOTTOM_RADIUS, LEVER_HEIGHT, 
	LEVER_MAX_ROTATION, LEVER_MIN_ROTATION, LEVER_NO_ROTATION, 
	LEVER_ROTATION_STEP, LEVER_TOP_RADIUS, PLAYER_COLOR_1, PLAYER_COLOR_2, STANDARD_KEYBINDS 
} from '../macros.js';

export class Lever extends THREE.Group {
	constructor(position, keybinds) {
		super();
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
		this.rotation.set(LEVER_NO_ROTATION, 0, 0);
	}

	// update(pressedKeys) {
	// 	const { up: upKey, down: downKey } = STANDARD_KEYBINDS;
	// 	const { up: upKey2, down: downKey2 } = ALTERNATE_KEYBINDS;
	// 	let step = LEVER_ROTATION_STEP;
	// 	let lever = null;

	// 	if (!this.lever1 || !this.lever2)
	// 		return ;
				
	// 	if (pressedKeys[upKey] || pressedKeys[downKey])
	// 		lever = this.lever1;
	// 	else if (pressedKeys[upKey2] || pressedKeys[downKey2])
	// 		lever = this.lever2;

	// 	if (pressedKeys[downKey] || pressedKeys[downKey2])
	// 		step = -step;
		
	// 	if (!lever) {
	// 		this.lever1.rotation.x = this.lerp(this.lever1.rotation.x, LEVER_NO_ROTATION, 0.3);
	// 		this.lever2.rotation.x = this.lerp(this.lever2.rotation.x, LEVER_NO_ROTATION, 0.3);
	// 		return ;
	// 	}
		
	// 	const target = Math.min(Math.max(lever.rotation.x + step, LEVER_MIN_ROTATION), LEVER_MAX_ROTATION);
	// 	lever.rotation.x = this.lerp(lever.rotation.x, target, 0.5);
	// }

	// lerp (start, end, t) {
	// 	return start + (end - start) * t;
	// }
}