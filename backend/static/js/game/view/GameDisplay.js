import * as THREE from 'three';

export class GameDisplay extends THREE.Group {
	constructor({}) {
		super();
		this.arenaHeight = 20;
		this.arenaLength = 30;
		this.paddleHeight = 2.5;
		this.paddleVelocity = 2;
		this.ballVelocity = {'x': -0.5, 'y': 0.5};

		this.userPaddle = null;
		this.enemyPaddle = null;
		this.arena = null;
		this.ball = null;

		this.build();
	}

	build() {
		this.buildArena();
		this.buildPaddels();
		this.buildBall();
	}

	buildPaddels() {
		this.userPaddle = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 2 * this.paddleHeight, 0.5),
			new THREE.MeshPhongMaterial()
		);
		this.userPaddle.position.set(-(this.arenaLength - 5), 0, 0);

		this.enemyPaddle = this.userPaddle.clone();
		this.enemyPaddle.position.x = -this.enemyPaddle.position.x;
		
		this.add(this.userPaddle, this.enemyPaddle);
	}

	buildArena() {
		this.arena = new THREE.Group();

		this.upperBoundary = new THREE.Mesh(
			new THREE.BoxGeometry(2 * this.arenaLength, 0.5, 0.5),
			new THREE.MeshPhongMaterial()
		);
		const leftBoundary = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 2 * this.arenaHeight, 0.5),
			new THREE.MeshPhongMaterial()
		);
		this.lowerBoundary = this.upperBoundary.clone();
		const rightBoundary = leftBoundary.clone();

		this.upperBoundary.position.set(0, this.arenaHeight - 0.25, 0);
		this.lowerBoundary.position.set(0, -this.arenaHeight + 0.25, 0);
		leftBoundary.position.set(-this.arenaLength, 0, 0);
		rightBoundary.position.set(this.arenaLength, 0, 0);

		this.arena.add(this.lowerBoundary, this.upperBoundary, leftBoundary, rightBoundary);
		this.add(this.arena);
	}

	buildBall() {
		this.ball = new THREE.Mesh(
			new THREE.SphereGeometry(this.paddleHeight / 2),
			new THREE.MeshPhongMaterial({color: "#FF0000"})
		);

		this.add(this.ball);
		const aabb = new THREE.Box3().setFromObject(this.ball);
		this.ball.add(new THREE.Box3Helper(aabb));
	}

	update(pressedKeys) {
		const targetPos = this.userPaddle.position.clone();

		if (pressedKeys['w']) {
			this.userPaddle.position.y = Math.min(
				this.userPaddle.position.y + this.paddleVelocity,
				this.arenaHeight - this.paddleHeight - 0.5
			);
		}

		if (pressedKeys['s']){
			this.userPaddle.position.y = Math.max(
				this.userPaddle.position.y - this.paddleVelocity,
				-(this.arenaHeight - this.paddleHeight - 0.5)
			);
		}
		this.userPaddle.position.lerp(targetPos, 0.5);
		this.ball.position.x += this.ballVelocity.x;
		this.ball.position.y += this.ballVelocity.y;

		if (this.upperBoundary == null)
			return ;
		
		//! TO DO:
		//! - Change ball speed according to the speed of the paddle at the time
		
		if (this.ball.position.y + this.paddleHeight / 2 >= this.upperBoundary.position.y)
			this.ballVelocity.y = -Math.abs(this.ballVelocity.y);
		if (this.ball.position.y - this.paddleHeight / 2 <= this.lowerBoundary.position.y)
			this.ballVelocity.y = Math.abs(this.ballVelocity.y);
		if (this.ball.position.x - this.paddleHeight / 2 <= -(this.arenaLength - 5 - 0.25) )
			this.ballVelocity.x = Math.abs(this.ballVelocity.x);			
	}
}