import fs from 'fs';

class Database {
	/**
	 * Main constructor, manages existing storage file and parses options against default ones.
	 * @param {string} filePath The path of the file to use as storage.
	 * @constructor
	 */

	constructor(filePath) {
		// Mandatory arguments check
		if (!filePath || !filePath.length) {
			throw new Error('Missing file path argument.');
		} else {
			this.filePath = filePath;
		}

		// Storage initialization
		this.storage = {};

		// File existence check
		let stats;

		try {
			stats = fs.statSync(filePath);
		} catch (err) {
			if (!err) {
				console.info(`${filePath} found`);
			}
			if (err.code === 'ENOENT') {
				/* File doesn't exist if app is opened first time, create a new file */
				fs.writeFileSync(filePath, JSON.stringify(this.storage));
				stats = fs.statSync(filePath);
			} else {
				// Other error
				throw new Error(
					`Error while checking for existence of path "${filePath}": ${err}`
				);
			}
		}

		/* File exists */
		try {
			// eslint-disable-next-line no-bitwise
			fs.accessSync(filePath, fs.constants.R_OK | fs.constants.W_OK);
		} catch (err) {
			throw new Error(
				`Cannot read & write on path "${filePath}". Check permissions!`
			);
		}

		if (stats.size > 0) {
			let data;
			try {
				data = fs.readFileSync(filePath);
				this.storage = JSON.parse(data);
			} catch (err) {
				throw err; // TODO: Do something meaningful
			}
		}

		/* wrtie to local file before exit to save new changes */

		// do something when app is closing
		process.on('exit', this.sync);

		// catches ctrl+c event
		process.on('SIGINT', this.sync);

		// catches "kill pid" (for example: nodemon restart)
		process.on('SIGUSR1', this.sync);
		process.on('SIGUSR2', this.sync);

		// catches uncaught exceptions
		process.on('uncaughtException', this.sync);

		// store a states of writing cycle to avoid data loss
		this.isWriting = false;
		this.hasChanges = false;
	}

	/**
	 * Validates the contents of a JSON file.
	 * @param {string} fileContent
	 * @returns {boolean} `true` if content is ok, throws error if not.
	 */

	/**
	 * Creates or modifies a key in the database.
	 * @param {string} key The key to create or alter.
	 * @param {object} value Whatever to store in the key. You name it, just keep it JSON-friendly.
	 */
	insert(key, value) {
		this.storage[key] = value;
		this.hasChanges = true;
		this.async();
	}

	/**
	 * Extracts the value of a key from the database.
	 * @param {string} key The key to search for.
	 * @returns {object|undefined} The value of the key or `undefined` if it doesn't exist.
	 */
	get(key) {
		return Object.prototype.hasOwnProperty.call(this.storage, key)
			? this.storage[key]
			: undefined;
	}

	/**
	 * Checks if a key is contained in the database.
	 * @param {string} key The key to search for.
	 * @returns {boolean} `True` if it exists, `false` if not.
	 */
	has(key) {
		return Object.prototype.hasOwnProperty.call(this.storage, key);
	}

	/**
	 * Deletes a key from the database.
	 * @param {string} key The key to delete.
	 * @returns {boolean|undefined} `true` if the deletion succeeded, `false` if there was an error, or `undefined` if the key wasn't found.
	 */
	remove(key) {
		const check = Object.prototype.hasOwnProperty.call(this.storage, key)
			? delete this.storage[key]
			: undefined;

		this.hasChanges = true;
		this.async();

		return check;
	}

	/**
	 * Give array of all values
	 * @returns {Array} with values
	 */

	getAll() {
		return Object.values(this.storage);
	}

	/**
	 * Deletes all keys from the database.
	 * @returns {object} The JSONdb instance itself.
	 */
	removeAll() {
		this.storage = {};
		this.async();
	}

	/*
	 * sync db and remove storage from memory
	 */
	close() {
		this.sync();
		delete this;
	}

	/**
	 * simply search item by given key and its value with regex
	 * @param {String} key The key whos value is checked
	 * @param {regex} reg The regex to test with value of key
	 * @returns {Array} Array with all objects that pass the test
	 */

	search(key, reg) {
		const result = [];
		Object.values(this.storage).forEach(item => {
			if (item[key]) {
				if (reg.test(item[key])) {
					result.push(item);
				}
			}
		});
		return result;
	}

	/**
	 * update object by its id.
	 * @param {String} id The id key of object. by default db creates id for each object
	 * @param {Object} newValue The object to placed at id. must contain id key
	 * @returns {Boolean} true if succesfully updated or false if faild
	 */
	set(id, newValue) {
		// in case new object passed without id
		newValue.id = id;

		if (this.storage[id]) {
			this.storage[id] = newValue;
			return true;
		}
		this.async();
		return false;
	}

	/**
	 * Writes the local storage object to disk synchronously.
	 */
	sync() {
		try {
			fs.writeFileSync(this.filePath, JSON.stringify(this.storage, null, 4));
		} catch (err) {
			if (err.code === 'EACCES') {
				throw new Error(`Cannot access path "${this.filePath}".`);
			} else {
				throw new Error(
					`Error while writing to path "${this.filePath}": ${err}`
				);
			}
		}
	}

	/**
	 * Writes the local storage object to disk in asynchronous manner
	 * with managing states to avoid corruption of file. It is safe.
	 */

	async() {
		if (this.isWriting) {
			return;
		}
		try {
			this.isWriting = true;
			const jsonString = JSON.stringify(this.storage, null, 4);
			fs.writeFile(this.filePath, jsonString, {}, err => {
				if (err) {
					throw err;
				}
				this.isWriting = false;
				if (this.hasChanges) {
					this.hasChanges = false;
					this.async();
				}
			});
		} catch (err) {
			throw err;
		}
	}
}

export default Database;
