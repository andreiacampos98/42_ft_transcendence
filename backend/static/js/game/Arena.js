import * as THREE from 'three';

export class Arena extends THREE.Group {
	constructor({ height, length, depth }) {
		super();
		this.semiHeight = height || 20;
		this.semiLength = length || 30;
		this.semiDepth = depth || 0.25;

		this.upperBoundary = null;
		this.lowerBoundary = null;

		this.build();
	}

	build() {
		const height = 2 * this.semiHeight;
		const length = 2 * this.semiLength;
		const depth = 2 * this.semiDepth;

		this.upperBoundary = new THREE.Mesh(
			new THREE.BoxGeometry(length, depth, depth),
			new THREE.MeshPhongMaterial()
		);
		const leftBoundary = new THREE.Mesh(
			new THREE.BoxGeometry(depth, height, depth),
			new THREE.MeshPhongMaterial()
		);
		this.lowerBoundary = this.upperBoundary.clone();
		const rightBoundary = leftBoundary.clone();

		this.upperBoundary.position.set(0, this.semiHeight - this.semiDepth, 0);
		this.lowerBoundary.position.set(0, -this.semiHeight + this.semiDepth, 0);
		leftBoundary.position.set(-this.semiLength, 0, 0);
		rightBoundary.position.set(this.semiLength, 0, 0);

		this.add(this.lowerBoundary, this.upperBoundary, leftBoundary, rightBoundary);
	}
}