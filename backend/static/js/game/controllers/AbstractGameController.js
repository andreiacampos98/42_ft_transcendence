import * as THREE from 'three';
import { Ball } from '../objects/Ball.js';
import { Arena } from '../objects/Arena.js';
import { Arcade } from '../objects/Arcade.js';


export class AbstractGameController extends THREE.Group {
	constructor ({ type, app }) {
		super();

		this.pressedKeys = null;
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

	build({ onPaddleHit=null }) {
		this.arena = new Arena();
		this.ball = new Ball({ onPaddleHit: onPaddleHit });
		this.arcade = new Arcade(this.app);

		this.add(this.arena);
		this.add(this.player1.paddle);
		this.add(this.player2.paddle);
		this.add(this.ball);
		this.add(this.arcade);

		this.fillPlayerHUD(this.player1, 'p1');
		this.fillPlayerHUD(this.player2, 'p2');
	}

	update(delta) {
		this.player1.update(this.pressedKeys);
		this.player2.update(this.pressedKeys, this.ball, this.player1);
		this.arcade.update(this.pressedKeys);

		if (this.stats.isGameOver())
			return;

		const scorer = this.ball.move(this, delta);
		if (scorer != null) {
			this.stats.registerGoal(scorer, this.ball);
			this.ball.reset({});
		}
		if (!this.stats.isGameOver())
			return;

		this.ball.speed.x = this.ball.speed.y = 0;
		this.sendGameResults();
		this.displayEndGame();
	}

	fillPlayerHUD(player, selector) {
		const playerName = document.getElementById(selector);
		playerName.textContent = `${player.username}`;
		
		const playerImage = document.getElementById(`${selector}-img`);
		const uri = player.picture;

		if(!player.picture)
			return ;
		else if (player.picture.includes('http') && player.id != 1) 
			playerImage.src = `https://${decodeURIComponent(uri).slice(14)}`
		else 
			playerImage.src = uri;
	}

	displayEndGame() {
		document.getElementById('scoreboard').remove();
		
		const winnerContainer = document.getElementById('winner-container');
		winnerContainer.style.visibility = 'visible';

		const winnerName = document.getElementById('winner-name');
		const winnerImg = document.getElementById('winner-img');
		winnerName.textContent = this.stats.winner.username;
		if (this.stats.winner.picture)
			winnerImg.src = this.stats.winner.picture;
	}

	createPlayers() {}
	sendGameResults() {}
}