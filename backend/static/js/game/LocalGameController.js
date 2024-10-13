import * as THREE from 'three';
import { Ball } from './Ball.js';
import { Arena } from './Arena.js';
import { GameStats } from './GameStats.js';
import { LocalPlayer } from './LocalPlayer.js';


export class LocalGameController extends THREE.Group {
	constructor({ playerData, enemyData, ballDirection }) {
		super();

		this.keybinds = null;
		this.arena = null;
		this.ball = null;
		this.player = null;
		this.enemy = null;
		this.stats = null;
		
		this.registerKeybinds();
		this.createPlayers(playerData, enemyData);
		this.createGameInstance();
		this.build(ballDirection);
	}

	createPlayers(playerData, enemyData) {
		const { id: playerID, username: playerUsername } = playerData;
		const { id: enemyID, username: enemyUsername } = enemyData;
		
		this.player = new LocalPlayer({ id: playerID, username: playerUsername, 
			position: [-25, 0, 0], keybinds: {'up': 'w', 'down': 's'}
		});
		this.enemy = new LocalPlayer({
			position: [25, 0, 0], keybinds: {'up': 'ArrowUp', 'down': 'ArrowDown'}
		});

		this.stats = new GameStats(this.player, this.enemy);
	}

	async createGameInstance() {
		const formData = {
		    "user1_id": this.player.id,
		    "user2_id": this.enemy.id,
		    "type": "Local"
		}

		const response = await fetch(`/games/create`, {
			method: 'POST',
			body: JSON.stringify(formData),
			headers: {
				'Content-Type': 'application/json',
			} 
		});

		const gameData = await response.json();
		this.stats.gameId = gameData.id;
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

	build(ballDirection) {
		this.arena = new Arena({});
		this.ball = new Ball({ direction: ballDirection });

		this.add(this.arena);
		this.add(this.player.paddle);
		this.add(this.enemy.paddle);
		this.add(this.ball);
	}

	update() {
		this.player.update(this.keybinds);
		this.enemy.update(this.keybinds);
		if (this.ball == null)
			return ;

		const scorer = this.ball.move(this);
		if (scorer != null) {
			this.stats.registerGoal(scorer, this.ball);
			this.ball.reset();
		}
		if (this.stats.winner != null) {
			this.remove(this.ball);
			this.ball.dispose();
			this.ball = null;
		}
	}
}