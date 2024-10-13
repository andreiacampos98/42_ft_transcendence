import * as THREE from 'three';
import { Ball } from './Ball.js';
import { Arena } from './Arena.js';
import { GameStats } from './GameStats.js';
import { RemotePlayer } from './RemotePlayer.js';
import { ARENA_SEMI_LENGTH, PADDLE_OFFSET_X } from './macros.js';

export class RemoteGameController extends THREE.Group {
	constructor({ player1Data, player2Data, socket, ballDirection }) {
		super();

		this.keybinds = null;
		this.arena = null;
		this.ball = null;
		this.player1 = null;
		this.player2 = null;
		this.players = {};
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
					'y': targetY,
					'ball': {
						'position': [...this.ball.position]
					}
				}
			}));
		}

		this.player1 = new RemotePlayer({ 
			id: p1ID, 
			username: p1Username,
			onUpdate: p1ID == currPlayerID ? onUpdate : null,
			isEnemy: p1ID != currPlayerID,
			keybinds: p1ID == currPlayerID ? {'up': 'w', 'down': 's'} : null,
			x: -ARENA_SEMI_LENGTH + PADDLE_OFFSET_X 
		});
		this.player2 = new RemotePlayer({ 
			id: p2ID, 
			username: p2Username,
			onUpdate: p2ID == currPlayerID ? onUpdate : null,
			isEnemy: p2ID != currPlayerID,
			keybinds: p2ID == currPlayerID ? {'up': 'w', 'down': 's'} : null,
			x: ARENA_SEMI_LENGTH - PADDLE_OFFSET_X 
		});
		this.players[this.player1.id] = this.player1;
		this.players[this.player2.id] = this.player2;
		this.stats = new GameStats(this.player1, this.player2);
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
		this.socket.onmessage = (ev) => {
			const { event, data } = JSON.parse(ev.data);
			
			if (event == 'UPDATE')
				this.players[data.id].move(data.y);
			else if (event == 'SYNC')
				this.ball.sync(data.ball);
		}

		this.socket.onerror = (ev) => {
			console.error(ev);
		}
	}

	build(ballDirection) {
		const onPaddleHit = () => {
			this.socket.send(JSON.stringify({
				'event': 'SYNC',
				'data': {
					'ball': {
						'position': [...this.ball.position],
						'direction': this.ball.direction,
						'speed': this.ball.speed
					}
				}
			}));
		}

		this.arena = new Arena({});
		this.ball = new Ball({ 
			direction: ballDirection, 
			onPaddleHit: onPaddleHit 
		});

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
			this.ball.reset({});
		}
		if (this.stats.winner != null) {
			this.remove(this.ball);
			this.ball.dispose();
			this.ball = null;
		}
	}
}