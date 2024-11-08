import { GameStats } from './GameStats.js';
import { RemotePlayer } from './RemotePlayer.js';
import { ARENA_SEMI_LENGTH, PADDLE_OFFSET_X, STANDARD_KEYBINDS } from './macros.js';
import { AbstractGameController } from './AbstractGameController.js';



export class RemoteGameController extends AbstractGameController {
	constructor({ player1Data, player2Data, gameID, gameSocket, tournamentSocket=null }) {
		super({type: "Remote"});

		this.players = {};
		this.gameSocket = gameSocket;
		this.tournamentSocket = tournamentSocket;
		
		this.registerKeybinds();
		this.registerSocketEvents();
		this.createPlayers(player1Data, player2Data, gameID);
		this.build();
	}

	createPlayers(player1Data, player2Data, gameID) {
		const { id: p1ID, username: p1Username } = player1Data;
		const { id: p2ID, username: p2Username } = player2Data;
		const currPlayerID = document.getElementById('metadata').getAttribute('data-user-id');
		const onUpdate = (id, username, targetY) => {
			this.gameSocket.send(JSON.stringify({
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
			keybinds: p1ID == currPlayerID ? STANDARD_KEYBINDS : null,
			x: -ARENA_SEMI_LENGTH + PADDLE_OFFSET_X 
		});
		this.player2 = new RemotePlayer({ 
			id: p2ID, 
			username: p2Username,
			onUpdate: p2ID == currPlayerID ? onUpdate : null,
			isEnemy: p2ID != currPlayerID,
			keybinds: p2ID == currPlayerID ? STANDARD_KEYBINDS : null,
			x: ARENA_SEMI_LENGTH - PADDLE_OFFSET_X 
		});
		this.players[this.player1.id] = this.player1;
		this.players[this.player2.id] = this.player2;
		this.stats = new GameStats(this.player1, this.player2);
		this.stats.gameID = gameID;
		console.log(this.stats.gameID);
	}

	registerSocketEvents(){
		this.gameSocket.onmessage = (ev) => {
			const { event, data } = JSON.parse(ev.data);
			
			if (event == 'UPDATE')
				this.players[data.id].move(data.y);
			else if (event == 'SYNC')
				this.ball.sync(data.ball);
			else if (event == 'FINISH'){
				this.gameSocket.close();
				setTimeout(() => {
					htmx.ajax('GET', `/tournaments/ongoing/${user.tournamentID}`, {
						target: '#main'  
					});
				}, 1000);
			}
		}

		this.gameSocket.onerror = (ev) => {
			console.error(ev);
		}
	}

	build() {
		const onPaddleHit = () => {
			this.gameSocket.send(JSON.stringify({
				'event': 'SYNC',
				'data': {
					'ball': {
						'position': [...this.ball.position],
						'direction': this.ball.direction,
						'speed': this.ball.speed
					}
				}
			}));
		};
		const ballData = {
			onPaddleHit: onPaddleHit
		};

		super.build(ballData);
	}

	sendGameResults() {
		const results = this.stats.assembleGameResults();
		console.log(`WINNER:`, this.stats.winner, 'SCORE:', this.stats.score);
		console.log('SENDING DATA TO SERVER...');

		this.gameSocket.send(JSON.stringify({
			'event': 'FINISH',
			'data': results
		}));
		
		if (!this.tournamentSocket)
			return ;

		this.tournamentSocket.send(JSON.stringify({
			'event': 'FINISH',
			'data': results
		}));
	}
}