import * as THREE from 'three';
import { Ball } from '../objects/Ball.js';
import { Arena } from '../objects/Arena.js';
import { Arcade } from '../objects/Arcade.js';


export class AbstractGameController extends THREE.Group {
	constructor ({ type, app }) {
		super();

		this.keybinds = null;
		this.arena = null;
		this.ball = null;
		this.player1 = null;
		this.player2 = null;
		this.arcade = null;
		this.stats = null;
		this.type = type;
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
		this.arcade = new Arcade(this.app);
		this.arcade2 = new Arcade(this.app);
		this.arcade2.position.x = -0.6;
		this.arcade3 = new Arcade(this.app);
		this.arcade3.position.x = 0.6;

		this.add(this.arena);
		this.add(this.player1.paddle);
		this.add(this.player2.paddle);
		this.add(this.ball);
		this.add(this.arcade, this.arcade2, this.arcade3);

		const p1display = document.getElementById('p1');
		const p2display = document.getElementById('p2');
		p1display.textContent = `${this.player1.username}`;
		p2display.textContent = `${this.player2.username}`;
	}

	update() {
		this.player1.update(this.keybinds);
		this.player2.update(this.keybinds);
		this.arcade.update(this.keybinds);

		if (this.stats.isGameOver())
			return;

		const scorer = this.ball.move(this);
		if (scorer != null) {
			this.stats.registerGoal(scorer, this.ball);
			this.ball.reset({});
		}
		if (!this.stats.isGameOver())
			return;

		this.ball.speed.x = this.ball.speed.y = 0;
		this.sendGameResults();
	}

	createPlayers() {}
	sendGameResults() {}
}