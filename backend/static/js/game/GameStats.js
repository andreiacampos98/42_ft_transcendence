/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameStats.js                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: nunomiguel533 <nunomiguel533@student.42    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/09/30 18:34:16 by ncarvalh          #+#    #+#             */
/*   Updated: 2024/11/05 20:47:25 by nunomiguel5      ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { MAX_GOALS, TEST_GOALS } from "./macros.js";

export class GameStats {
	constructor(player1, player2) {
		this.player1 = player1;
		this.player2 = player2;
		this.score = {};
		this.goals = [];
		this.loser = null;
		this.winner = null;
		this.gameID = 0;
		this.gameStats = {};
		this.scoredFirst = null;
		this.startTime = null
		this.gameScore = null;
		this.init();
	}

	init() {
		this.startTime = new Date().getTime();
		this.score[this.player1.username] = 0;
		this.score[this.player2.username] = 0;
		this.gameScore = document.getElementById('score');
		
		//! Testing
		// this.goals = TEST_GOALS;
		// this.calculateSmallStats();
		// this.calculateAdvancedStats();
		// this.sendGameResults();
	}

	registerGoal(scorer, ball) {
		const goal = {
			'timestamp': new Date().toISOString(),
			'user': scorer.id,
			'rally_length': ball.rally,
			'ball_speed': parseFloat(ball.speed.x.toFixed(2)),
		};
		this.score[scorer.username] += 1;
		this.goals.push(goal);
		this.gameScore.textContent = 
		`${this.score[this.player1.username]} : ${this.score[this.player2.username]}`;
	}

	calculateSmallStats() {
		const rallys = this.goals.map((goal) => goal.rally_length);
		const speeds = this.goals.map((goal) => goal.ball_speed);
		
		this.gameStats["shorter_rally"] = Math.round(Math.min(...rallys));
		this.gameStats["longer_rally"] = Math.round(Math.max(...rallys));
		this.gameStats["average_rally"] = Math.round(rallys.reduce((sum, rally) => sum + rally, 0) / rallys.length);

		this.gameStats["min_ball_speed"] = parseFloat(Math.min(...speeds).toFixed(1));
		this.gameStats["max_ball_speed"] = parseFloat(Math.max(...speeds).toFixed(1));
		this.gameStats["average_ball_speed"] = parseFloat((speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length).toFixed(1));	
	}

	calculateAdvancedStats() {
		let stats = {}, p1 = this.player1.id, p2 = this.player2.id;
		stats[p1] = { "score": 0, "canOvercome": false, "maxOvercome": 0, "overcome": 0,
			"maxLead": 0, "lead": 0, "maxConsecutive": 0, "consecutive": 0 };
		stats[p2] = { "score": 0, "canOvercome": false, "maxOvercome": 0, "overcome": 0,
			"maxLead": 0, "lead": 0, "maxConsecutive": 0, "consecutive": 0 };

		for (let goal of this.goals) {
			let scorer = goal.user;
			let loser = goal.user == p1 ? p2 : p1;
			
			stats[scorer].score++;

			// Greatest Deficit Overcome
			if (stats[p1].score == stats[p2].score) {
				stats[scorer].maxOvercome = Math.max(stats[scorer].overcome + 1, stats[scorer].maxOvercome);
				stats[scorer].canOvercome = false;
				stats[scorer].overcome = 0;
			}
			else if (stats[scorer].canOvercome)
				stats[scorer].overcome++;
			else if (stats[p1].score < stats[p2].score)
				stats[p1].canOvercome = true;
			else if (stats[p2].score < stats[p1].score) 
				stats[p2].canOvercome = true;
	
			// Biggest Lead
			stats[scorer].lead = stats[scorer].score - stats[loser].score;
			stats[p1].maxLead = Math.max(stats[p1].lead, stats[p1].maxLead);
			stats[p2].maxLead = Math.max(stats[p2].lead, stats[p2].maxLead);
			stats[loser].lead = 0;
			
			// Most Consecutive Goals
			stats[scorer].consecutive++;
			stats[p1].maxConsecutive = Math.max(stats[p1].consecutive, stats[p1].maxConsecutive);
			stats[p2].maxConsecutive = Math.max(stats[p2].consecutive, stats[p2].maxConsecutive);
			stats[loser].consecutive = 0;
		}

		this.gameStats["greatest_deficit_overcome"] = Math.max(stats[p1].maxOvercome, stats[p2].maxOvercome);
		this.gameStats["gdo_user"] = stats[p1].maxOvercome >= stats[p2].maxOvercome ? p1 : p2;
		this.gameStats["most_consecutive_goals"] = Math.max(stats[p1].maxConsecutive, stats[p2].maxConsecutive);
		this.gameStats["mcg_user"] = stats[p1].maxConsecutive >= stats[p2].maxConsecutive ? p1 : p2;
		this.gameStats["biggest_lead"] = Math.max(stats[p1].maxLead, stats[p2].maxLead);
		this.gameStats["bg_user"] = stats[p1].maxLead >= stats[p2].maxLead ? p1 : p2;
	}

	assembleGameResults(){
		this.calculateSmallStats();
		this.calculateAdvancedStats();

		const now = new Date().getTime();
		const results = {
			"id": this.gameID, 
			"duration": Math.round((now - this.startTime) / 1000),
			"nb_goals_user1": this.score[this.player1.username],
			"nb_goals_user2": this.score[this.player2.username],
			"game_stats": this.gameStats,
			"user1_stats": {
				"scored_first": this.goals[0].user == this.player1.id
			},
			"user2_stats": {
				"scored_first": this.goals[0].user == this.player2.id
			},
			"goals": this.goals				
		};
		console.log('GAME REPORT', results);
		return results;
	}

	isGameOver() {
		if (!Object.values(this.score).includes(MAX_GOALS))
			return false;

		this.winner = this.score[this.player1.username] == MAX_GOALS ? this.player1 : this.player2;
		this.loser = this.winner == this.player1 ? this.player2 : this.player1;

		return true;
	}
}