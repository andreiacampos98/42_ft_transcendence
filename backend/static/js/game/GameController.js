import * as THREE from 'three';
import { Ball } from './Ball.js';
import { Player } from './Player.js';
import { Arena } from './Arena.js';
import { GameStats } from './GameStats.js';

export class GameController extends THREE.Group {
	constructor({}) {
		super();

		this.gameId = 0;
		this.pressedKeys = {};
		this.arena = new Arena({});
		this.ball = new Ball({});
		this.player = new Player(1, 'Nuno', [-25, 0, 0], {'up': 'w', 'down': 's'});
		this.enemy = new Player(2, 'Andreia', [25, 0, 0], {'up': 'ArrowUp', 'down': 'ArrowDown'});
		this.stats = new GameStats(this.player, this.enemy);

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
		// this.player.update(this.pressedKeys, this.arena.semiHeight);
		// this.enemy.update(this.pressedKeys, this.arena.semiHeight);
		// if (this.ball == null)
		// 	return ;

		// const scorer = this.ball.move(this);
		// if (scorer != null)
		// 	this.stats.registerGoal(scorer, this.ball);
		// if (this.stats.winner != null)
		// {
		// 	this.remove(this.ball);
		// 	this.ball.dispose();
		// 	this.ball = null;
		// }
	}
}