export const HELLO = "Hello";
export const BALL_START_SPEED = {'x': -0.3, 'y': 0.3};
export const BALL_SPEED_FACTOR = 0.02;
export const BALL_RADIUS = 1.25;

export const PADDLE_SEMI_LENGTH = 0.25;
export const PADDLE_SEMI_HEIGHT = 3.75;
export const PADDLE_SPEED = 2;

export const ARENA_SEMI_HEIGHT = 20;
export const ARENA_SEMI_LENGTH = 30;
export const ARENA_SEMI_DEPTH = 0.25;

export const MAX_GOALS = 5;

export const FPS = 75;
export const REFRESH_RATE = 1000 / FPS;

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