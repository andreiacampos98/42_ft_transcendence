export const BALL_START_SPEED = 0.6;
export const BALL_SPEEDUP_FACTOR = 0.06;
export const BALL_RADIUS = 1.25;

export const DIRECTION = Object.freeze({
	UP: 1,
	DOWN: -1,
	LEFT: -1,
	RIGHT: 1,
});

export const PADDLE_SEMI_LENGTH = 0.25;
export const PADDLE_SEMI_HEIGHT = 3.75;
export const PADDLE_SPEED = 3.5;
export const PADDLE_OFFSET_X = 7;

export const ARENA_SEMI_HEIGHT = 20;
export const ARENA_SEMI_LENGTH = 30;
export const ARENA_SEMI_DEPTH = 0.25;

export const MAX_GOALS = 5;

export const FPS = 30;
export const REFRESH_RATE = 1000 / FPS;

export const STANDARD_KEYBINDS = {
	'up': 'w', 
	'down': 's'
};

export const ALTERNATE_KEYBINDS = {
	'up': 'ArrowUp', 
	'down': 'ArrowDown'
};


//! DEPENDENCY INJECTION TESTING

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