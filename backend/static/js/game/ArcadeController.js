import * as THREE from 'three';
import { Ball } from './Ball.js';
import { Player } from './Player.js';
import { Arena } from './Arena.js';

export class ArcadeController extends THREE.Group {
	constructor({}) {
		super();

		this.gameId = 0;
		this.pressedKeys = {};
		this.arena = new Arena({});
		this.ball = new Ball({});
		this.player = new Player(1, 'Player', [-25, 0, 0], {'up': 'w', 'down': 's'});
		this.enemy = new Player(2, 'Enemy Player', [25, 0, 0], {'up': 'ArrowUp', 'down': 'ArrowDown'});
		
		this.goals = [];

		this.init();
		this.build();
	}

	init() {
		this.pressedKeys = {
			'w': false, 's': false,
			'ArrowUp': false, 'ArrowDown': false
		};
		
		document.addEventListener('keydown', (event) => {
			if (event.key in this.pressedKeys)
				this.pressedKeys[event.key] = true;
		});
		document.addEventListener('keyup', (event) => {
			if (event.key in this.pressedKeys)
				this.pressedKeys[event.key] = false;
		});
	}

	build() {
		this.add(this.arena);
		this.add(this.player.paddle);
		this.add(this.enemy.paddle);
		this.add(this.ball);
	}

	update() {
		this.player.update(this.pressedKeys, this.arena.semiHeight);
		this.enemy.update(this.pressedKeys, this.arena.semiHeight);
		this.ball.move(this);
	}

	registerGoal(ball, player) {
		const goal = {
			'timestamp': new Date().toISOString(),
			'user': player.id,
			'rally_length': ball.rally,
			'ball_speed': ball.speed,
			'game': this.gameId
		};
		this.goals.push(goal);
		console.log(goal);
	}
}