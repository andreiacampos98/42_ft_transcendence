import * as THREE from 'three';
import { Ball } from './Ball.js';
import { Player } from './Player.js';
import { Arena } from './Arena.js';
import { GameStats } from './GameStats.js';
import { LocalPlayer } from './LocalPlayer.js';


export class GameController extends THREE.Group {
	constructor(gameType) {
		super();

		this.gameType = gameType;
		this.keybinds = null;
		this.arena = null;
		this.ball = null;
		this.player = null;
		this.enemy = null;
		this.stats = null;
		
		this.init();
		this.build();
	}

	async init() {
		this.arena = new Arena({});
		this.ball = new Ball({});
		this.player = new LocalPlayer(1, 'Nuno', [-25, 0, 0], {'up': 'w', 'down': 's'});
		if (this.gameType == "Local")
			this.enemy = new LocalPlayer(2, 'Andreia', [25, 0, 0], {'up': 'ArrowUp', 'down': 'ArrowDown'});
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
		    "user1_id": document.getElementById('game-engine').getAttribute('data-user-id'),
		    "user2_id": null,
		    "type": document.getElementById('game-engine').getAttribute('game-type')
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