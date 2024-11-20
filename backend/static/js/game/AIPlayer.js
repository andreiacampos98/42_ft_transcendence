import { AbstractPlayer } from './AbstractPlayer.js';

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

}

function	get_future_path(ball)
{
	while (!ball.collidedWithGoals(arena, player1, player2))
		calculate_collisions(ball)
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
