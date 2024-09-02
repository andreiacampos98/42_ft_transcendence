import * as THREE from 'three';

export class GameDisplay extends THREE.Group {
	constructor({}) {
		super();
		
		this.build();
	}

	build() {
		this.playerPylon = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 5, 0.5),
			new THREE.MeshPhongMaterial()
		);
		this.enemyPylon = this.playerPylon.clone();

		this.playerPylon.position.set(-15, 0, 0);
		this.enemyPylon.position.set(15, 0, 0);

		this.add(this.playerPylon, this.enemyPylon);
	}
}