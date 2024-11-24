import { GameStats } from '../GameStats.js';
import { LocalPlayer } from '../players/LocalPlayer.js';
import { AbstractGameController } from './AbstractGameController.js';
import { PADDLE_OFFSET, STANDARD_KEYBINDS, ALTERNATE_KEYBINDS } from '../macros.js';

export class LocalGameController extends AbstractGameController {
	constructor({ player1Data, player2Data, app }) {
		super({type: "Local", app: app });
		
		this.registerKeybinds();
		this.createPlayers(player1Data, player2Data);
		this.createGameInstance();
		super.build({});
	}

	createPlayers(player1Data, player2Data) {
		const { id: p1ID, username: p1Username, picture: p1Picture } = player1Data;
		const { id: p2ID, username: p2Username } = player2Data;
		
		this.player1 = new LocalPlayer({ 
			id: p1ID, 
			username: p1Username, 
			x: -(PADDLE_OFFSET),
			keybinds: STANDARD_KEYBINDS,
			picture: p1Picture
		});
		this.player2 = new LocalPlayer({
			id: p2ID, 
			username: p2Username,
			x: PADDLE_OFFSET,
			keybinds: ALTERNATE_KEYBINDS,
		});

		this.stats = new GameStats(this.player1, this.player2);
	}

	async createGameInstance() {
		const formData = {
		    "user1_id": this.player1.id,
		    "user2_id": this.player2.id,
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
		this.stats.gameID = gameData.id;
		const p1Image = document.getElementById('p1-img');
		p1Image.src = this.player1.picture;
	}

	async sendGameResults() {
		const results = this.stats.assembleGameResults();

		await fetch(`/games/update/${this.stats.gameID}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				'event': 'FINISH',
				'data': results
			}),
		});
	}
}