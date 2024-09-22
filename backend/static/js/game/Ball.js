import * as THREE from 'three';

export class Ball extends THREE.Object3D { 
	constructor ({ radius, color, speed }) {
		super();

		this.radius = radius || 1.25;
		this.color = color || "#FF0000";

		this.speed = speed || {'x': -0.5, 'y': 0.5};
		this.startSpeed = {'x': -0.5, 'y': 0.5};
		this.speedFactor = 0.02;
		this.rallyLen = 0;

		this.build();
	}

	build() {
		this.ball = new THREE.Mesh(
			new THREE.SphereGeometry(this.radius),
			new THREE.MeshNormalMaterial()
		);

		this.add(this.ball);
	}

	move(arcade) {
		const { arena, player, enemy } = arcade;

		this.collideWithArena(arcade, arena, player, enemy);
		this.collideWithPaddles(player, enemy);
		
		this.position.x += this.speed.x;
		this.position.y += this.speed.y;
	}

	collideWithArena(arcade, arena, player, enemy) {
		const { upperBoundary, lowerBoundary, 
			rightBoundary, leftBoundary } = arena;
				
		if (this.position.y + this.radius >= upperBoundary.position.y)
			this.speed.y = -Math.abs(this.speed.y);
		else if (this.position.y - this.radius <= lowerBoundary.position.y)
			this.speed.y = Math.abs(this.speed.y);
		else if (this.position.x - this.radius <= leftBoundary.position.x)
		{
			arcade.registerGoal(this, enemy);
			this.rallyLen = 0;
			this.speed = this.startSpeed;
			this.position.set(0, 0, 0);
		}
		else if (this.position.x + this.radius >= rightBoundary.position.x)
		{
			arcade.registerGoal(this, player);
			this.rallyLen = 0;
			this.speed = this.startSpeed;
			this.position.set(0, 0, 0);
		}

	}

	collideWithPaddles(player, enemy) {
		const { paddleSemiLength: paddleLength, paddle: playerPaddle } = player;
		const { paddle: enemyPaddle } = enemy;

		//! - Change ball speed according to the speed of the paddle at the time
		if (
			this.position.x - this.radius <= playerPaddle.position.x + paddleLength &&
			this.position.y - this.radius <= playerPaddle.position.y + paddleLength &&
			this.position.y + this.radius >= playerPaddle.position.y - paddleLength
		){
			this.speed.x = Math.abs(this.speed.x);	
			this.rallyLen += 1;
			this.speed.x += this.speedFactor;
			console.log(this.speed);
		}
		else if (
			this.position.x + this.radius >= enemyPaddle.position.x - paddleLength &&
			this.position.y - this.radius <= enemyPaddle.position.y + paddleLength &&
			this.position.y + this.radius >= enemyPaddle.position.y - paddleLength
		){
			this.speed.x = -Math.abs(this.speed.x);	
			this.rallyLen += 1;
			this.speed.x -= this.speedFactor;
			console.log(this.speed);
		}
	}
}