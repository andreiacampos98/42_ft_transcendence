import * as THREE from 'three';
import { Ball } from './Ball.js';
import { Player } from './Player.js';
import { Arena } from './Arena.js';
import { MAX_GOALS } from './macros.js';

export class ArcadeController extends THREE.Group {
	constructor({}) {
		super();

		this.gameId = 0;
		this.pressedKeys = {};
		this.arena = new Arena({});
		this.ball = new Ball({});
		this.player = new Player(1, 'Nuno', [-25, 0, 0], {'up': 'w', 'down': 's'});
		this.enemy = new Player(2, 'Andreia', [25, 0, 0], {'up': 'ArrowUp', 'down': 'ArrowDown'});
		
		this.score = {};
		this.goals = [];

		this.init();
		this.build();
	}

	init() {
		this.score[this.player.username] = 0;
		this.score[this.enemy.username] = 0;
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
		if (this.ball != null)
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
		this.score[player.username] += 1;
		this.goals.push(goal);

		if (this.score[this.player.username] == MAX_GOALS || this.score[this.enemy.username] == MAX_GOALS){
			const winner = this.score[this.player.username] == 5 ? this.player.username : this.enemy.username;
			const loser = winner == this.player.username ? this.enemy.username : this.player.username;
			console.log(`${winner} has won the game!`);
			console.log(`Final score: ${winner} ${this.score[winner]}:${this.score[loser]} ${loser}`);
			this.remove(this.ball);
			this.ball.dispose();
			this.ball = null;
		}
		console.log(this.score);
		console.log(goal);
	}
}