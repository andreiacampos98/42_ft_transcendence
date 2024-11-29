import * as THREE from 'three';
import { ARENA_SEMI_HEIGHT, ARENA_SEMI_LENGTH, ARENA_SEMI_DEPTH } from '../macros.js';

export class Arena extends THREE.Group {
	constructor() {
		super();
		this.semiHeight = ARENA_SEMI_HEIGHT;
		this.semiLength = ARENA_SEMI_LENGTH;
		this.semiDepth = ARENA_SEMI_DEPTH;

		this.upperBoundary = null;
		this.lowerBoundary = null;
		this.leftBoundary = null;
		this.rightBoundary = null;

		this.build();
	}

	build() {
		const height = 2 * this.semiHeight;
		const length = 2 * this.semiLength;
		const depth = 2 * this.semiDepth;

		this.upperBoundary = new THREE.Mesh(
			new THREE.PlaneGeometry(length, depth),
			// new THREE.MeshBasicMaterial({ transparent: true, opacity: 1 })
			new THREE.MeshNormalMaterial(length, depth),
		);
		this.leftBoundary = new THREE.Mesh(
			new THREE.PlaneGeometry(depth, height),
			// new THREE.MeshBasicMaterial({ transparent: true, opacity: 1 })
			new THREE.MeshNormalMaterial(length, depth),
		);
		this.lowerBoundary = this.upperBoundary.clone();
		this.rightBoundary = this.leftBoundary.clone();

		this.upperBoundary.position.set(0, this.semiHeight - this.semiDepth, 0);
		this.lowerBoundary.position.set(0, -this.semiHeight + this.semiDepth, 0);
		this.leftBoundary.position.set(-this.semiLength, 0, 0);
		this.rightBoundary.position.set(this.semiLength, 0, 0);
		// this.visible = false;

		this.add(this.lowerBoundary, this.upperBoundary, this.leftBoundary, this.rightBoundary);
	}
}