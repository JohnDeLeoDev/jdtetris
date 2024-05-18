export class Model {
	constructor(config) {
		this.config = config; // config object
		this.pieceTypes = []; // array of piece types
		for (let piece in config.pieces) {
			this.pieceTypes.push(piece);
		}
		this.piecesArray = []; // array of piece objects
		for (let i = 0; i < this.pieceTypes.length; i++) {
			this.piecesArray.push(config.pieces[this.pieceTypes[i]]);
		}
		this.invisibleRows = this.config.invisibleRows; // number of invisible rows at top of board
		this.startingCentralBox = Object.freeze([5, -2]); // starting central box coordinates		this.board = new Board(config); // board object
		this.canvasWidth = config.canvasWidth; // width of canvas
		this.canvasHeight = config.canvasHeight; // height of canvas
		this.squareSize = config.squareSize;   // size of each square in pixels
		this.boardIndent = config.boardIndent; // indent of board from left and top of canvas
		this.activePiece = null; // current active piece
		this.gameOver = false; // true if game is over
		this.rowsCleared = 0; // number of rows cleared
		this.score = 0; // score
		this.startTime = null; // time game started
		this.fallRate = config.initialFallRate; // initial fall rate
		this.speedUpThreshold = config.speedUpThreshold; // number of rows cleared before speed up
		this.speedUpRate = config.speedUpRate; // amount to speed up by
		this.level = 0; // level
		this.timePlayed = 0; // time played
		this.touchStartX = null; // x position of touch start
		this.touchStartY = null; // y position of touch start
		this.touchEndX = null; // x position of touch end
		this.touchEndY = null; // y position of touch end
		this.board = new Board(config); // board object
	}

	restartGame() {
		this.gameOver = false;
		this.rowsCleared = 0;
		this.score = 0;
		this.startTime = null;
		this.fallRate = this.config.initialFallRate;
		this.level = 0;
		this.timePlayed = 0;
		this.board = new Board(this.config);
		this.activePiece = null;
	}

	// Triggered by start button in App.js
	startGame() {
		let pieceType = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
		this.activePiece = new Piece(pieceType, this.config, this.startingCentralBox);
		this.makeShadow(this.activePiece);
		this.startTime = new Date();
	}

	removeShadow() {
		let squares = this.board.squares;
		for (let row = 0; row < squares.length; row++) {
			for (let col = 0; col < squares[row].length; col++) {
				if (squares[row][col].shadow) {
					squares[row][col].color = 'white';
					squares[row][col].shadow = false;
				}
			}
		}
	}

	makeShadow(piece) {
		let boxes = piece.boxes;
		let shadowColor = this.config.colors.shadowColor;
		let lowestRow = 0;

		// find the lowest possible position for current piece while maintaining shape
		for (let row = 0; row < this.config.boardSize.rows + this.invisibleRows; row++) {
			let newBoxes = [];
			for (let i = 0; i < boxes.length; i++) {
				let box = boxes[i];
				newBoxes.push(new Box(box.row + row, box.col, box.color));
			}

			if (this.checkCollision(newBoxes)) {
				break;
			}
			lowestRow = row;

		}

		// create shadow
		for (let i = 0; i < boxes.length; i++) {
			let box = boxes[i];
			this.board.squares[box.row + lowestRow + this.invisibleRows][box.col].color = shadowColor;
			this.board.squares[box.row + lowestRow + this.invisibleRows][box.col].shadow = true;
		}
	}

	movePieceLeft() {
		this.removeShadow();
		let currentBoxes = this.activePiece.boxes;
		let newBoxes = [];
		for (let i = 0; i < currentBoxes.length; i++) {
			let box = currentBoxes[i];
			newBoxes.push(new Box(box.row, box.col - 1, box.color));
		}

		if (!this.checkCollision(newBoxes)) {
			this.activePiece.moveLeft();
		}
		this.makeShadow(this.activePiece);
	}

	movePieceRight() {
		this.removeShadow();
		let currentBoxes = this.activePiece.boxes;
		let newBoxes = [];
		for (let i = 0; i < currentBoxes.length; i++) {
			let box = currentBoxes[i];
			newBoxes.push(new Box(box.row, box.col + 1, box.color));
		}
		if (!this.checkCollision(newBoxes)) {
			this.activePiece.moveRight();
		}
		this.makeShadow(this.activePiece);

	}

	movePieceDown() {
		this.removeShadow();
		let newBoxes = [];

		for (let i = 0; i < this.activePiece.boxes.length; i++) {
			let box = this.activePiece.boxes[i];
			newBoxes.push(new Box(box.row + 1, box.col, box.color));
		}
		if (!this.checkCollision(newBoxes)) {
			this.activePiece.moveDown();
		} else {
			this.lockActivePiece(this.activePiece);
		}
		if (this.activePiece) {
			this.makeShadow(this.activePiece);
		}

	}

	makeNewPiece() {
		let pieceType = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
		this.activePiece = new Piece(pieceType, this.config, this.startingCentralBox);
		this.makeShadow(this.activePiece);
	}

	rotatePiece() {
		this.removeShadow();
		let currentRotation = this.activePiece.currentRotation;
		let nextRotation = (currentRotation + 1) % this.activePiece.rotationsArray.length;
		let newBoxes = this.activePiece.rotations[nextRotation];

		if (!this.checkCollision(newBoxes)) {
			this.activePiece.boxes = newBoxes;
			this.activePiece.currentRotation = nextRotation;
			this.makeShadow(this.activePiece);
		} else {
			this.activePiece.currentRotation = currentRotation;
			this.makeShadow(this.activePiece);
		}
	}

	checkRows() {
		let squares = this.board.squares;
		let invisibleRows = this.invisibleRows;
		let rowsToClear = [];
		for (let row = invisibleRows; row < squares.length; row++) {
			let rowFull = true;
			for (let col = 0; col < squares[row].length; col++) {
				if (!squares[row][col].occupied) {
					rowFull = false;
					break;
				}
			}
			if (rowFull) {
				rowsToClear.push(row);
			}
		}

		if (rowsToClear.length > 0) {
			this.clearRows(rowsToClear);
		}
	}

	clearRows(rowsToClear) {
		let squares = this.board.squares;
		let invisibleRows = this.invisibleRows;
		for (let i = 0; i < rowsToClear.length; i++) {
			let row = rowsToClear[i];
			for (let col = 0; col < squares[row].length; col++) {
				squares[row][col].occupied = false;
				squares[row][col].color = 'white';
			}
		}

		for (let row = rowsToClear[0] - 1; row >= invisibleRows; row--) {
			for (let col = 0; col < squares[row].length; col++) {
				if (squares[row][col].occupied) {
					squares[row + rowsToClear.length][col].occupied = true;
					squares[row + rowsToClear.length][col].color = squares[row][col].color;
					squares[row][col].occupied = false;
					squares[row][col].color = 'white';
				}
			}
		}

		this.rowsCleared += rowsToClear.length;

	}
	// checks for collisions with pieces and walls. True if collision, false if no collision
	checkCollision(newBoxes) {
		let boxes = newBoxes;

		for (let i = 0; i < boxes.length; i++) {
			let box = boxes[i];

			if (box.col < 0 || box.col >= this.config.boardSize.columns) {
				return true;
			} else if (box.row >= this.config.boardSize.rows) {
				return true;
			} else if (box.row >= 0) {
				if (this.board.squares[box.row + this.invisibleRows][box.col].occupied) {
					return true;
				}
			}
		}
		return false;
	}

	checkTopRow() {
		let squares = this.board.squares;
		let invisibleRows = this.invisibleRows;
		for (let col = 0; col < squares[invisibleRows].length; col++) {
			if (squares[invisibleRows][col].occupied) {
				return true;
			}
		}
		return false;
	}

	lockActivePiece() {
		this.board.lockPiece(this.activePiece);
		this.checkTopRow();
		this.checkRows();
		if (!this.gameOver) {
			this.makeNewPiece();
		}
	}

	checkGameOver() {
		if (this.checkTopRow()) {
			this.gameOver = true;
		}
	}
}

export class Board {
	constructor(config) {
		this.config = config;
		this.emptyColor = this.config.colors.emptyColor;
		this.invisibleRows = config.invisibleRows;
		this.squares = this.createSquares();
		this.pieceLocked = false;
	}


	createSquares() {
		let squares = [];
		let invisibleSize = this.config.invisibleRows;

		// create invisible squares first
		for (let row = -invisibleSize; row < 0; row++) {
			squares.push([]);
			for (let col = 0; col < this.config.boardSize.columns; col++) {
				squares[row + invisibleSize].push(new Square(row, col, 'white'));
			}
		}

		// create visible squares
		for (let row = 0; row < this.config.boardSize.rows; row++) {
			squares.push([]);
			for (let col = 0; col < this.config.boardSize.columns; col++) {
				squares[row + invisibleSize].push(new Square(row, col, this.emptyColor));
			}
		}
		return squares;
	}

	lockPiece(piece) {
		let boxes = piece.boxes;
		for (let i = 0; i < boxes.length; i++) {
			let box = boxes[i];
			this.squares[box.row + this.invisibleRows][box.col].occupied = true;
			this.squares[box.row + this.invisibleRows][box.col].color = box.color;
			this.squares[box.row + this.invisibleRows][box.col].shadow = false;
			this.pieceLocked = true;
		}
	}


}

export class Square {
	constructor(row, col, color) {
		this.row = row;
		this.col = col;
		this.color = color;
		this.occupied = false;
		this.visible = row >= 0;
		this.shadow = false;
	}
}

export class Piece {
	constructor(pieceType, config, centralBoxCoords) {
		this.invisibleRows = config.invisibleRows;
		this.rotationsArray = config.pieces[pieceType]['rotations'];
		this.centralBox = config.pieces[pieceType]['centralBox'];
		this.centralBoxCoords = [centralBoxCoords[0], centralBoxCoords[1]];
		this.currentRotation = 0;
		this.color = config.colors[pieceType];
		this.boxes = this.createPiece();
		this.rotations = this.calcRotationsFromCentralBox();
	}

	createPiece() {
		let boxes = [];
		for (let row = 0; row < this.rotationsArray[this.currentRotation].length; row++) {
			for (let col = 0; col < this.rotationsArray[this.currentRotation][row].length; col++) {
				if (this.rotationsArray[this.currentRotation][row][col] === 1) {
					let newCol = this.centralBoxCoords[0] - col;
					let newRow = this.centralBoxCoords[1] - row;
					boxes.push(new Box(newRow, newCol, this.color));
				}
			}

		}
		return boxes;
	}

	calcRotationsFromCentralBox() {
		let rotations = {};
		let centralBox = this.centralBox;
		let rotationsArray = this.rotationsArray;
		let color = this.color;
		let localCentralBoxCoords = this.centralBoxCoords;
		let distanceFromCentralBox = [0,0]

		for (let rotation in rotationsArray) {
			let newBoxes = [];
			for (let row = 0; row < rotationsArray[rotation].length; row++) {
				for (let col = 0; col < rotationsArray[rotation][row].length; col++) {
					if (rotationsArray[rotation][row][col] === 1) {
						distanceFromCentralBox = [centralBox[0] - col, centralBox[1] - row];
						console.log(localCentralBoxCoords);
						console.log(distanceFromCentralBox);
						let newRow = distanceFromCentralBox[1] + localCentralBoxCoords[1];
						let newCol = distanceFromCentralBox[0] + localCentralBoxCoords[0];
						newBoxes.push(new Box(newRow, newCol - 1, color));
					}
				}
			}
			rotations[rotation] = newBoxes;
		}

		return rotations;
	}

	moveLeft() {
		this.centralBoxCoords[0]--;
		for (let i = 0; i < this.boxes.length; i++) {
			this.boxes[i].col--;
		}

		this.rotations = this.calcRotationsFromCentralBox();

		return true;

	}

	moveRight() {
		this.centralBoxCoords[0]++;
		for (let i = 0; i < this.boxes.length; i++) {
			this.boxes[i].col++;
		}

		this.rotations = this.calcRotationsFromCentralBox();

		return true;
	}

	moveDown() {
		this.centralBoxCoords[1]++;
		for (let i = 0; i < this.boxes.length; i++) {
			this.boxes[i].row++;
		}

		this.rotations = this.calcRotationsFromCentralBox();

		return true;
	}
}

export class Box {
	constructor(row, col, color) {
		this.row = row;
		this.col = col;
		this.color = color;

	}
}

