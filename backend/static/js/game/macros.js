export const DIRECTION = Object.freeze({
	UP: 1,
	DOWN: -1,
	LEFT: -1,
	RIGHT: 1,
});

export const BALL_START_SPEED = 0.1;
export const BALL_ACCELERATION = 0.05;
export const BALL_RADIUS = 0.01;
export const BALL_COLOR = 0xFFFFFF;

export const ARENA_SEMI_HEIGHT = 0.143;
export const ARENA_SEMI_LENGTH = 0.2;
export const ARENA_SEMI_DEPTH = 0.01;

export const PADDLE_SEMI_LENGTH = 0.005;
export const PADDLE_SEMI_HEIGHT = ARENA_SEMI_LENGTH / 6;
export const PADDLE_SEMI_DEPTH = 0.01;
export const PADDLE_SPEED = 0.015;
export const PADDLE_OFFSET = 0.8 * ARENA_SEMI_LENGTH - PADDLE_SEMI_LENGTH;
export const PADDLE_TOP_LIMIT = ARENA_SEMI_HEIGHT - 2*ARENA_SEMI_DEPTH - PADDLE_SEMI_HEIGHT;
export const PADDLE_BOTTOM_LIMIT = -PADDLE_TOP_LIMIT;

export const LEVER_TOP_RADIUS = 0.005;
export const LEVER_BOTTOM_RADIUS = 0.005;
export const LEVER_BALL_RADIUS = 0.015;
export const LEVER_HEIGHT = 0.045;
export const LEVER_MAX_ROTATION = Math.PI * 0.2;
export const LEVER_DEFAULT_ROTATION = Math.PI * 0.07;
export const LEVER_MIN_ROTATION = -Math.PI * 0.1;
export const LEVER_ROTATION_STEP = -0.15;

export const MAX_GOALS = 5;
export const PLAYER_COLOR_1 = 0xCC0000;
export const PLAYER_COLOR_2 = 0x00FFFF;

export const FPS = 144;
export const REFRESH_RATE = 1000 / FPS;

export const STANDARD_KEYBINDS = {
	'up': 'w', 
	'down': 's'
};

export const ALTERNATE_KEYBINDS = {
	'up': 'ArrowUp', 
	'down': 'ArrowDown'
};

//! ================== DEPENDENCY INJECTION TESTING ================== 

export var TEST_GOALS = [
	{
		'timestamp': new Date().toISOString(),
		'user': 2,
		'rally_length': Math.round(Math.random() * 30),
		'ball_speed': Math.random() * 10,
	},
	{
		'timestamp': new Date().toISOString(),
		'user': 1,
		'rally_length': Math.round(Math.random() * 30),
		'ball_speed': Math.random() * 10,
	},
	{
		'timestamp': new Date().toISOString(),
		'user': 2,
		'rally_length': Math.round(Math.random() * 30),
		'ball_speed': Math.random() * 10,
	},
	{
		'timestamp': new Date().toISOString(),
		'user': 2,
		'rally_length': Math.round(Math.random() * 30),
		'ball_speed': Math.random() * 10,
	},
	{
		'timestamp': new Date().toISOString(),
		'user': 2,
		'rally_length': Math.round(Math.random() * 30),
		'ball_speed': Math.random() * 10,
	},
	{
		'timestamp': new Date().toISOString(),
		'user': 1,
		'rally_length': Math.round(Math.random() * 30),
		'ball_speed': Math.random() * 10,
	},
	{
		'timestamp': new Date().toISOString(),
		'user': 1,
		'rally_length': Math.round(Math.random() * 30),
		'ball_speed': Math.random() * 10,
	},
	{
		'timestamp': new Date().toISOString(),
		'user': 1,
		'rally_length': Math.round(Math.random() * 30),
		'ball_speed': Math.random() * 10,
	},
	{
		'timestamp': new Date().toISOString(),
		'user': 1,
		'rally_length': Math.round(Math.random() * 30),
		'ball_speed': Math.random() * 10,
	},
];

export const TEST_STATS = [
	{
		day: "2024-10-18T00:00:00Z",
		total_games: 5,
		win_rate: 20
	},
	{
		day: "2024-10-19T00:00:00Z",
		total_games: 6,
		win_rate: 33
	},
	{
		day: "2024-10-20T00:00:00Z",
		total_games: 7,
		win_rate: 42
	},	
	{
		day: "2024-10-21T00:00:00Z",
		total_games: 8,
		win_rate: 50
	},
	{
		day: "2024-10-22T00:00:00Z",
		total_games: 16,
		win_rate: 58
	},
	{
		day: "2024-10-24T00:00:00Z",
		total_games: 7,
		win_rate: 100
	}
];