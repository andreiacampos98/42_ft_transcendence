import { GameStats } from './GameStats.js';
import { LocalPlayer } from './LocalPlayer.js';
import { AbstractGameController } from './AbstractGameController.js';
import { PADDLE_OFFSET_X, ARENA_SEMI_LENGTH, STANDARD_KEYBINDS, ALTERNATE_KEYBINDS } from './macros.js';

export class LocalGameController extends AbstractGameController {
	constructor({ player1Data, player2Data, ballDirection }) {
		super();
		
		this.registerKeybinds();
		this.createPlayers(player1Data, player2Data);
		this.createGameInstance();
		this.build(ballDirection);
	}

	createPlayers(player1Data, player2Data) {
		const { id: p1ID, username: p1Username } = player1Data;
		// const { id: enemyID, username: enemyUsername } = player2Data;
		
		this.player1 = new LocalPlayer({ 
			id: p1ID, 
			username: p1Username, 
			x: -ARENA_SEMI_LENGTH + PADDLE_OFFSET_X,
			keybinds: STANDARD_KEYBINDS
		});
		this.player2 = new LocalPlayer({
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
		this.stats.gameId = gameData.id;
	}

	build(ballDirection) {
		const ballData = {
			ballDirection: ballDirection,
		};

		super.build(ballData);
	}
}