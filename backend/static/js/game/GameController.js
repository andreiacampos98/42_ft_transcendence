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
		this.gameId = 0;
		this.keybinds = null;
		this.arena = null;
		this.ball = null;
		this.player = null;
		this.enemy = null;
		this.stats = null;
		
		this.init();
		this.build();
	}

	init() {
		this.keybinds = {
			'w': false, 's': false,
			'ArrowUp': false, 'ArrowDown': false
		};
		this.arena = new Arena({});
		this.ball = new Ball({});
		this.player = new Player(1, 'Nuno', [-25, 0, 0], {'up': 'w', 'down': 's'});
		if (this.gameType == "local")
			this.enemy = new LocalPlayer(2, 'Andreia', [25, 0, 0], {'up': 'ArrowUp', 'down': 'ArrowDown'});
		// else if (this.gameType == "remote")
		// 	this.enemy = new RemotePlayer(2, 'Andreia', [25, 0, 0], {'up': 'ArrowUp', 'down': 'ArrowDown'});
		// else
		// 	this.enemy = new AIPlayer(2, 'Andreia', [25, 0, 0], {'up': 'ArrowUp', 'down': 'ArrowDown'});
		this.stats = new GameStats(this.player, this.enemy);
		
		document.addEventListener('keydown', (event) => {
			if (event.key in this.keybinds)
				this.keybinds[event.key] = true;
		});
		document.addEventListener('keyup', (event) => {
			if (event.key in this.keybinds)
				this.keybinds[event.key] = false;
		});
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
		if (scorer != null)
			this.stats.registerGoal(scorer, this.ball);
		if (this.stats.winner != null)
		{
			this.remove(this.ball);
			this.ball.dispose();
			this.ball = null;
		}
	}
}