import { GameStats } from '../GameStats.js';
import { RemotePlayer } from '../players/RemotePlayer.js';
import { PADDLE_OFFSET, STANDARD_KEYBINDS } from '../macros.js';
import { AbstractGameController } from './AbstractGameController.js';

export class RemoteGameController extends AbstractGameController {
	constructor({ player1Data, player2Data, gameID, gameType, app }) {
		super({ type: gameType, app: app });

		this.player1 = null;
		this.player2 = null;
		this.players = {};
		
		this.registerKeybinds();
		this.registerSocketEvents();
		this.createPlayers(player1Data, player2Data, gameID);
		this.build();
	}

	createPlayers(player1Data, player2Data, gameID) {
		const { id: p1ID, username: p1Username, picture: p1Picture } = player1Data;
		const { id: p2ID, username: p2Username, picture: p2Picture } = player2Data;
		const currPlayerID = document.getElementById('metadata').getAttribute('data-user-id');
		const onUpdate = (id, username, targetY) => {
			myUser.gameSocket.send(JSON.stringify({
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
			x: -(PADDLE_OFFSET),
			picture: p1Picture
		});
		this.player2 = new RemotePlayer({ 
			id: p2ID, 
			username: p2Username,
			onUpdate: p2ID == currPlayerID ? onUpdate : null,
			isEnemy: p2ID != currPlayerID,
			keybinds: p2ID == currPlayerID ? STANDARD_KEYBINDS : null,
			x: PADDLE_OFFSET,
			picture: p2Picture
		});
		this.players[this.player1.id] = this.player1;
		this.players[this.player2.id] = this.player2;
		this.stats = new GameStats(this.player1, this.player2);
		this.stats.gameID = gameID;
		console.log(this.stats.gameID);
	}

	registerSocketEvents(){
		myUser.gameSocket.onmessage = (ev) => {
			const { event, data } = JSON.parse(ev.data);
			
			if (event == 'UPDATE')
				this.players[data.id].move(data.y);
			else if (event == 'SYNC')
				this.ball.sync(data.ball);
		}

		myUser.gameSocket.onerror = (ev) => {
			console.error(ev);
		}
	}

	build() {
		const onPaddleHit = () => {
			myUser.gameSocket.send(JSON.stringify({
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

		myUser.gameSocket.send(JSON.stringify({
			'event': 'GAME_END',
			'data': results
		}));
		myUser.gameSocket.close();
		
		if (!myUser.tournamentSocket)
			return ;

		myUser.tournamentSocket.send(JSON.stringify({
			'event': 'GAME_END',
			'data': results
		}));

		myTournament.onGameEnd( this.stats.gameID, this.player1.username,
			this.player2.username, this.stats.score );
		setTimeout(() => {
			history.pushState(null, '', `/tournaments/ongoing/${myUser.tournamentID}`);
			htmx.ajax('GET', `/tournaments/ongoing/${myUser.tournamentID}`, {
				target: '#main'  
			});
		}, 1000);
	}
}