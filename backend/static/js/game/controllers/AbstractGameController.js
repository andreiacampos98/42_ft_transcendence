import * as THREE from 'three';
import { Ball } from '../objects/Ball.js';
import { Arena } from '../objects/Arena.js';
import { Arcade } from '../objects/Arcade.js';

export class AbstractGameController extends THREE.Group {
	constructor ({ type, scene, app }) {
		super();

		this.keybinds = null;
		this.arena = null;
		this.ball = null;
		this.player1 = null;
		this.player2 = null;
		this.arcade = null;
		this.stats = null;
		this.type = type;
		this.scene = scene;
		this.app = app;
	}

	registerKeybinds() {
		this.keybinds = {
			'w': false, 's': false,
			'ArrowUp': false, 'ArrowDown': false
		};

		document.addEventListener('keydown', (event) => {
			if (event.key in this.keybinds) 
				this.keybinds[event.key] = true;
		});
		document.addEventListener('keyup', (event) => {
			if (event.key in this.keybinds) 
				this.keybinds[event.key] = false;
		});
	}

	build({ onPaddleHit=null }) {
		this.arena = new Arena();
		this.ball = new Ball({ onPaddleHit: onPaddleHit });
		this.arcade = new Arcade(this.scene, this.app);

		this.add(this.arena);
		this.add(this.player1.paddle);
		this.add(this.player2.paddle);
		this.add(this.ball);

		const p1display = document.getElementById('p1');
		const p2display = document.getElementById('p2');
		p1display.textContent = `${this.player1.id}-${this.player1.username}`;
		p2display.textContent = `${this.player2.id}-${this.player2.username}`;
	}

	update() {
		this.player1.update(this.keybinds);
		this.player2.update(this.keybinds);
		this.arcade.update(this.keybinds);

		if (this.ball == null)
			return ;

		const scorer = this.ball.move(this);
		if (scorer != null) {
			this.stats.registerGoal(scorer, this.ball);
			this.ball.reset({});
		}
		if (!this.stats.isGameOver())
			return ;

		this.cleanArena();
		this.sendGameResults();
	}

	cleanArena() {
		this.remove(this.ball);
		this.ball.dispose();
		this.ball = null;
	}

	createPlayers() {}
	sendGameResults() {}
}