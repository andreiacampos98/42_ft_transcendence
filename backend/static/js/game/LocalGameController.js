import { GameStats } from './GameStats.js';
import { LocalPlayer } from './LocalPlayer.js';
import { AbstractGameController } from './AbstractGameController.js';
import { PADDLE_OFFSET_X, ARENA_SEMI_LENGTH, STANDARD_KEYBINDS, ALTERNATE_KEYBINDS } from './macros.js';

export class LocalGameController extends AbstractGameController {
	constructor({ player1Data, player2Data }) {
		super({type: "Local"});
		
		this.registerKeybinds();
		this.createPlayers(player1Data, player2Data);
		this.createGameInstance();
		super.build({});
	}

	createPlayers(player1Data, player2Data) {
		const { id: p1ID, username: p1Username } = player1Data;
		const { id: p2ID, username: p2Username } = player2Data;
		
		this.player1 = new LocalPlayer({ 
			id: p1ID, 
			username: p1Username, 
			x: -ARENA_SEMI_LENGTH + PADDLE_OFFSET_X,
			keybinds: STANDARD_KEYBINDS
		});
		this.player2 = new LocalPlayer({
			id: p2ID, 
			username: p2Username,
			x: ARENA_SEMI_LENGTH - PADDLE_OFFSET_X,
			keybinds: ALTERNATE_KEYBINDS
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
		console.log(gameData);
		this.stats.gameID = gameData.id;
	}

	async sendGameResults() {
		const results = this.stats.assembleGameResults();

		await fetch(`/games/update/${this.stats.gameID}`, {
			method: 'POST',
			body: JSON.stringify({
				'event': 'FINISH',
				'data': results
			}),
			headers: {
				'Content-Type': 'application/json',
			}
		});
	}
}