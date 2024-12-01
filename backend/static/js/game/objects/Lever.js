import * as THREE from 'three';
import { ALTERNATE_KEYBINDS, LEVER_BALL_RADIUS, LEVER_BOTTOM_RADIUS, LEVER_HEIGHT, 
	LEVER_MAX_ROTATION, LEVER_MIN_ROTATION, LEVER_DEFAULT_ROTATION, 
	LEVER_ROTATION_STEP, LEVER_TOP_RADIUS, PLAYER_COLOR_1, PLAYER_COLOR_2, STANDARD_KEYBINDS 
} from '../macros.js';

export class Lever extends THREE.Group {
	constructor(position) {
		super();
		this.upperLever = null;
		this.keybinds = position[0] < 0 ? STANDARD_KEYBINDS : ALTERNATE_KEYBINDS;
		this.build(position[0]);
		this.position.set(...position);
	}

	build(x) {
		let body = new THREE.Mesh(
			new THREE.CylinderGeometry(LEVER_TOP_RADIUS, LEVER_BOTTOM_RADIUS, LEVER_HEIGHT, 8, 8), 
			new THREE.MeshPhongMaterial({color: '#666666'})
		);

		let headColor = x < 0 ? PLAYER_COLOR_1 : PLAYER_COLOR_2;
		let head = new THREE.Mesh(
			new THREE.SphereGeometry(LEVER_BALL_RADIUS),
			new THREE.MeshPhongMaterial({
				color: headColor, 
				specular: 0xFFFFFF, 
				shininess: 50, 
				emissive: headColor, 
				emissiveIntensity: 0.5})
		);
		
		head.position.y = LEVER_HEIGHT / 2;
		head.position.y += 0.051;
		body.position.y += 0.051;

		this.upperLever = new THREE.Group();
		this.upperLever.add(head, body);

		let base = new THREE.Mesh(
			new THREE.CylinderGeometry(0.023, 0.023, 0.01),
			new THREE.MeshPhongMaterial({color: '#444444'}),
		);
		let baseBall = new THREE.Mesh(
			new THREE.SphereGeometry(0.020, 32, 8),
			new THREE.MeshPhongMaterial({
				color: '#333333', 
				specular: '#FFFFFF',
				shininess: 1,
			})
		);
		base.position.set(0, 0.01, 0);
		baseBall.position.set(0, 0.01, 0);

		this.add(this.upperLever);
		this.add(base, baseBall);
		base.rotation.set(LEVER_DEFAULT_ROTATION, 0, 0);
	}

	update (pressedKeys) {
		const { up, down } = this.keybinds;

		let step = LEVER_ROTATION_STEP;
		
		if (pressedKeys[down])
			step = -step;
		if (!pressedKeys[up] && !pressedKeys[down]) {
			this.upperLever.rotation.x = 
				this.lerp(this.upperLever.rotation.x, LEVER_DEFAULT_ROTATION, 0.3);
		}
		else {
			const target = Math.min(Math.max(this.upperLever.rotation.x + step, LEVER_MIN_ROTATION), LEVER_MAX_ROTATION);
			this.upperLever.rotation.x = 
				this.lerp(this.upperLever.rotation.x, target, 0.3);
		}
	}

	lerp (start, end, t) {
		return start + (end - start) * t;
	}
}