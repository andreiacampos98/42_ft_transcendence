import * as THREE from 'three';
import { Ball } from './Ball.js';
import { Arena } from './Arena.js';
import { GameStats } from './GameStats.js';
import { LocalPlayer } from './LocalPlayer.js';
import { RemotePlayer } from './RemotePlayer.js';


export class GameController extends THREE.Group {
	constructor({ playerData, enemyData, gameType, socket }) {
		super();

		this.gameType = gameType;
		this.keybinds = null;
		this.arena = null;
		this.ball = null;
		this.player = null;
		this.enemy = null;
		this.stats = null;
		
		this.init(playerData, enemyData);
		this.build();
	}

	async init(playerData, enemyData) {
		const { id: playerID, username: playerUsername } = playerData;
		const { id: enemyID, username: enemyUsername } = enemyData;

		this.arena = new Arena({});
		this.ball = new Ball({});
		this.player = new LocalPlayer(playerID, playerUsername, [-25, 0, 0], {'up': 'w', 'down': 's'});
		if (this.gameType == "Local")
			this.enemy = new LocalPlayer(2, 'Andreia', [25, 0, 0], {'up': 'ArrowUp', 'down': 'ArrowDown'});
		else if (this.gameType == "Remote")
			this.enemy = new RemotePlayer(enemyID, enemyUsername, [25, 0, 0], {'up': 'ArrowUp', 'down': 'ArrowDown'});
		this.stats = new GameStats(this.player, this.enemy);
		
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

		const formData = {
		    "user1_id": this.player.id,
		    "user2_id": this.enemy.id,
		    "type": this.gameType
		}

		const response = await fetch(`/games/create`, {
			method: 'POST',
			body: JSON.stringify(formData),
			headers: {
				'Content-Type': 'application/json',
			} 
		});

		const data = await response.json();
		console.log(data);
		this.stats.gameId = data.id;
		console.log(this.stats.gameId);

	}

	build() {
		this.add(this.arena);
		this.add(this.player.paddle);
		this.add(this.enemy.paddle);
		this.add(this.ball);
	}

	update() {
		this.player.update(this.keybinds, this.arena.semiHeight);
		this.enemy.update(this.keybinds, this.arena.semiHeight);
		if (this.ball == null)
			return ;

		const scorer = this.ball.move(this);
		if (scorer != null) {
			this.stats.registerGoal(scorer, this.ball);
			this.ball.reset();
		}
		if (this.stats.winner != null)
		{
			this.remove(this.ball);
			this.ball.dispose();
			this.ball = null;
		}
	}
}