import * as THREE from 'three';
import { Ball } from './Ball.js';
import { Arena } from './Arena.js';
import { GameStats } from './GameStats.js';
import { RemotePlayer } from './RemotePlayer.js';


export class RemoteGameController extends THREE.Group {
	constructor({ player1Data, player2Data, socket, ballDirection }) {
		super();

		this.keybinds = null;
		this.arena = null;
		this.ball = null;
		this.player1 = null;
		this.player2 = null;
		this.socket = socket;
		this.stats = null;
		
		this.registerKeybinds();
		this.registerSocketEvents();
		this.createPlayers(player1Data, player2Data);
		this.createGameInstance();
		this.build(ballDirection);
	}

	createPlayers(player1Data, player2Data) {
		const { id: p1ID, username: p1Username } = player1Data;
		const { id: p2ID, username: p2Username } = player2Data;
		const currPlayerID = document.getElementById('game-engine').getAttribute('data-user-id');
		const onUpdate = (id, username, targetY) => {
			this.socket.send(JSON.stringify({
				'event': 'UPDATE',
				'data': {
					'id': id,
					'username': username,
					'y': targetY
				}
			}));
		}

		if (p1ID == currPlayerID) {
			this.player1 = new RemotePlayer({ id: p1ID, username: p1Username, 
				position: [-25, 0, 0], onUpdate: onUpdate, keybinds: {'up': 'w', 'down': 's'}
			});
			this.player2 = new RemotePlayer({ id: p2ID, username: p2Username, 
				position: [25, 0, 0], isEnemy: true
			});
		}
		else {
			this.player1 = new RemotePlayer({ id: p1ID, username: p1Username, 
				position: [-25, 0, 0], isEnemy: true
			});
			this.player2 = new RemotePlayer({ id: p2ID, username: p2Username, 
				position: [25, 0, 0], onUpdate: onUpdate, keybinds: {'up': 'w', 'down': 's'}
			});
		}
		this.stats = new GameStats(this.player1, this.player2);

		console.log(this.player1);
		console.log(this.player2);

	}

	async createGameInstance() {
		const formData = {
		    "user1_id": this.player1.id,
		    "user2_id": this.player2.id,
		    "type": "Remote"
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

	registerSocketEvents(){
		this.socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log(data.event);
			// console.log(`player = ${this.player.username}, enemy = ${this.enemy.username}, data.username = ${data.username}`);
			if (data.event == 'MOVE') {
				if (data.data.id == this.player1.id)
					this.player1.move(data.data.y);
				else
					this.player2.move(data.data.y);
			}
			else if (data.event == 'RESET')
				this.ball.reset();
		}

		this.socket.onerror = (event) => {
			console.log(event);
		}
	}

	build(ballDirection) {
		this.arena = new Arena({});
		this.ball = new Ball({ direction: ballDirection });

		this.add(this.arena);
		this.add(this.player1.paddle);
		this.add(this.player2.paddle);
		this.add(this.ball);
	}

	update() {
		this.player1.update(this.keybinds);
		this.player2.update(this.keybinds);
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