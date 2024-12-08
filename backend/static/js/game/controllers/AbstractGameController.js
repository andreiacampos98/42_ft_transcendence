import * as THREE from 'three';
import { Ball } from '../objects/Ball.js';
import { Arena } from '../objects/Arena.js';
import { Arcade } from '../objects/Arcade.js';

if (!onKeydown)
	var onKeydown = (event, pressedKeys) => {
		if (event.key in pressedKeys)
			pressedKeys[event.key] = true;
	};

if (!onKeyup)
	var onKeyup = (event, pressedKeys) => {
		if (event.key in pressedKeys)
			pressedKeys[event.key] = false;
	};

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

		document.addEventListener('keydown', (event) => onKeydown(event, this.pressedKeys));
		document.addEventListener('keyup', (event) => onKeyup(event, this.pressedKeys));
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

	update() {
		this.player1.update(this.pressedKeys);
		this.player2.update(this.pressedKeys, this.ball, this.player1);
		this.arcade.update(this.pressedKeys);

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
		if (this.type != 'Tournament')
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
		winnerContainer.style.opacity = 1;

		const winnerName = document.getElementById('winner-name');
		const winnerImg = document.getElementById('winner-img');
		winnerName.textContent = this.stats.winner.username;
		console.log(`this.player1.picture: ${this.player1.picture}`);
		console.log(`this.player2.picture: ${this.player2.picture}`);
		console.log(`winner.picture ${this.stats.winner.picture}`);
		
		if (this.stats.winner.picture && 
			this.stats.winner.picture.includes('intra.42.fr') &&
			this.stats.winner.picture.includes('/media')) {
				console.log('42 image');
				winnerImg.src = `https://${decodeURIComponent(this.stats.winner.picture).slice(14)}`;
			}
		else if (this.stats.winner.picture)
		{
			console.log('Something else');
			winnerImg.src = this.stats.winner.picture;
		}
	}

	createPlayers() {}
	sendGameResults() {}
}