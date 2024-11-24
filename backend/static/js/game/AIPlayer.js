import { AbstractPlayer } from './AbstractPlayer.js';
import { ARENA_SEMI_LENGTH } from './macros.js';

export class AIPlayer extends AbstractPlayer {
	constructor () {
		super(0, "AI Bot", null, null);
	}
	while (round_still_on) {
		wait(1) //1 second wait time.
		ball_destination = null;
		enemy_pos = null;
		ball_dir = get_ball_dir(ball);
		if (coming_dir_AI)
			ball_destination = get_future_path(ball);
		else
			enemy_pos = get_play_pos(player);
		final_pos = final_AI_position(ball_destination, enemy_pos);
		keypress, time_pressed =get_necessary_input(current_pos, final_pos);
		update(keypress, time_pressed) 
		{
		}
	}
};

function	calculate_collisions(ball) {

	t = -1;
	goals = false;
	//for upper wall
	temp = -1 * ball.position.y / ball.direction.y;
	if (t == -1 && temp > 0){
		t = temp;
		goals = false;
	}
	//for lower wall
	temp = (ARENA_SEMI_HEIGHT * 2 - ball.position.y) / ball.direction.y;
	if ((t == -1 && temp > 0) || ( t != -1 && temp < t && temp > 0)) {
		t = temp;
		goals = false;
	}
	//for aiwall wall
	temp = (ARENA_SEMI_LENGTH * 2 - ball.position.x) / ball.direction.x;
	if ((t == -1 && temp > 0) || ( t != -1 && temp < t && temp > 0)) {
		t = temp;
		goals = true;
	}
	//for player wall
	temp = (-1 * ball.position.x) / ball.direction.x;
	if ((t == -1 && temp > 0) || ( t != -1 && temp < t && temp > 0)) {
		t = temp;
		goals = true;
	}
	if (t < 0){
		console.log("Ball outside the arena??");
		exit(1);
	}
	return(goals);
}

function	get_future_path(ball)
{
	t = -1;
	goals = false;
	while (!goals) {
		//for upper wall
		temp_ball = ball;
		temp = -1 * ball.position.y - BALL_RADIUS / ball.direction.y;
		if (t == -1 && temp > 0){
			t = temp;
			goals = false;
			temp_ball.direction.y *= -1;
			//position ??
			
		}
		//for lower wall
		temp = (ARENA_SEMI_HEIGHT * 2 - ball.position.y - BALL_RADIUS) / ball.direction.y;
		if ((t == -1 && temp > 0) || ( t != -1 && temp < t && temp > 0)) {
			t = temp;
			goals = false;
			temp_ball.direction.y *= -1;
			//position ??
			
		}
		//for aiwall wall
		temp = (ARENA_SEMI_LENGTH * 2 - ball.position.x - BALL_RADIUS) / ball.direction.x;
		if ((t == -1 && temp > 0) || ( t != -1 && temp < t && temp > 0)) {
			t = temp;
			goals = true;
			temp_ball.direction.x *= -1;
			//position ??
			
		}
		//for player wall
		temp = (-1 * ball.position.x - BALL_RADIUS) / ball.direction.x;
		if ((t == -1 && temp > 0) || ( t != -1 && temp < t && temp > 0)) {
			t = temp;
			goals = true;
			temp_ball.direction.x *= -1;
			//position ??
			
		}
		ball = temp_ball;
		if (t < 0){
			console.log("Ball outside the arena??");
			exit(1);
		}
	}
	return ball_position_at_paddle_position;
};

function	final_AI_position(ball_destination, enemy_pos) {
	if (ball_destination == null) {
		if (enemy_pos.position.y <= 3/2 * ARENA_SEMI_LENGTH && enemy_pos.position.y >= 1/2 * ARENA_SEMI_LENGTH) 
			return (PADDLE_OFFSET_X, enemy_pos.position.y);
		 else if (enemy_pos.position.y > 3/2 * ARENA_SEMI_LENGTH)
			return (PADDLE_OFFSET_X, 5/4 * ARENA_SEMI_LENGTH);
		 else 
			return (PADDLE_OFFSET_X, 1/2 * ARENA_SEMI_LENGTH);
	}
	return (ball_destination);
}

function	get_necessary_input(current_pos, final_pos) {

	if (final_pos.y > current_pos.y)
		return upKey, (final_pos.y - current_pos.y - PADDLE_SEMI_HEIGHT / 2) / PADDLE_SPEED;
	else
		return downKey, (current_pos.y - final_pos.y + PADDLE_SEMI_HEIGHT / 2) / PADDLE_SPEED;
};
