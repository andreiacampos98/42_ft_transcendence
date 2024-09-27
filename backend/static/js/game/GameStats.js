import { MAX_GOALS } from "./macros.js";

export class GameStats {
	constructor(player, enemy) {
		this.player = player;
		this.enemy = enemy;
		this.score = {};
		this.goals = [];
		this.loser = null;
		this.winner = null;
		this.gameStats = null;
		this.scoredFirst = null;
		this.start = null;
		this.init();
	}

	init() {
		this.start = new Date().getTime();
		this.score[this.player.username] = 0;
		this.score[this.enemy.username] = 0;
	}

	registerGoal(scorer, ball) {
		const goal = {
			'timestamp': new Date().toISOString(),
			'user': scorer.id,
			'rally_length': ball.rally,
			'ball_speed': ball.speed,
		};
		this.score[scorer.username] += 1;
		this.goals.push(goal);
		console.log(goal);

		if (this.gameHasEnded()){
			this.calculateAdvancedStats();
			this.sendGameResults();
		}
		if (this.goals.length == 1)
			this.scoredFirst = scorer;
	}

	calculateAdvancedStats() {
		//! HERE map goals to find the rally and lengths
		
	}

	sendGameResults() {
		const now = new Date().getTime();
		const data = {
			"duration": Math.round((now - this.start) / 1000),
			"nb_goals_user1": this.score[this.player.username],
			"nb_goals_user2": this.score[this.enemy.username],
			"game_stats": {
				"average_rally": 15,
				"longer_rally": 25,
				"shorter_rally": 10,
				"max_ball_speed": 60,
				"min_ball_speed": 30,
				"average_ball_speed": 45,
				"greatest_deficit_overcome": 5,
				"gdo_user": 1,
				"most_consecutive_goals": 7,
				"mcg_user": 1,
				"biggest_lead": 10,
				"bg_user": 1
			},
			"user1_stats": {
				"scored_first": this.scoredFirst == this.player
			},
			"user2_stats": {
				"scored_first": this.scoredFirst == this.enemy
			},
			"goals": this.goals
		};
		console.log(data);

		this.winner = this.score[this.player.username] == MAX_GOALS ? this.player : this.enemy;
		this.loser = this.winner == this.player ? this.enemy : this.player;
	}

	gameHasEnded() {
		return (Object.values(this.score).includes(MAX_GOALS));
	}

	debug() {

	}
}