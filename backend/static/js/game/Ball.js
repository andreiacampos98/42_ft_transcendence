import * as THREE from 'three';

export class Ball extends THREE.Object3D { 
	constructor ({ radius, color, speed }) {
		super();

		this.radius = radius || 1.25;
		this.color = color || "#FF0000";
		this.speed = speed || {'x': -0.5, 'y': 0.5};
		this.build();
	}

	build() {
		this.ball = new THREE.Mesh(
			new THREE.SphereGeometry(this.radius),
			new THREE.MeshNormalMaterial()
		);

		this.add(this.ball);
	}

	collide(arena, player, enemy) {
		const { upperBoundary, lowerBoundary, length } = arena;
		const { paddleSemiLength: paddleLength, paddle: playerPaddle } = player;
		const { paddle: enemyPaddle } = enemy;
		
		if (this.position.y + this.radius >= upperBoundary.position.y)
			this.speed.y = -Math.abs(this.speed.y);
		if (this.position.y - this.radius <= lowerBoundary.position.y)
			this.speed.y = Math.abs(this.speed.y);

		//! - Change ball speed according to the speed of the paddle at the time
		if (this.position.x - this.radius <= playerPaddle.position.x + paddleLength)
			this.speed.x = Math.abs(this.speed.x);	
		if (this.position.x + this.radius >= enemyPaddle.position.x - paddleLength)
			this.speed.x = -Math.abs(this.speed.x);	

		this.position.x += this.speed.x;
		this.position.y += this.speed.y;
	}
}