import { Player } from './Player.js';

export class RemotePlayer extends Player {
	constructor (id, username, position, controls) {
		super(id, username, position, controls);
	}

	update(pressedKeys, arenaSemiHeight) {

	}
}