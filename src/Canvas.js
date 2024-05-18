export function drawCanvas(model, canvasRef) {
    let canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");

    // clear canvas
    ctx.clearRect(0, 0, model.canvasWidth, model.canvasHeight);

    drawSquares(ctx, model);
    drawPiece(ctx, model);

}


function drawSquares(ctx, model) {
    let squareSize = model.squareSize;
    let boardIndent = model.boardIndent;
    let squares = model.board.squares;

    for (let row = 0; row < squares.length; row++) {
        for (let col = 0; col < squares[row].length; col++) {
            if (!squares[row][col].visible) {
                continue;
            }
            let square = squares[row][col];
            ctx.fillStyle = square.color;
            ctx.fillRect(col * squareSize + boardIndent, row * squareSize + boardIndent, squareSize, squareSize);
            ctx.strokeStyle = model.config.colors.lineColor;
            ctx.lineWidth = model.config.lineWidth;
            ctx.strokeRect(col * squareSize + boardIndent, row * squareSize + boardIndent, squareSize, squareSize);
        }
    }
}

function drawPiece(ctx, model) {
    let squareSize = model.squareSize;
    let boardIndent = model.boardIndent;
    let activePiece = model.activePiece;
    let invisibleRows = model.config.invisibleRows;

    if (activePiece === null) {
        return;
    }

    for (let i = 0; i < activePiece.boxes.length; i++) {
        let box = activePiece.boxes[i];
        ctx.fillStyle = box.color;
        ctx.fillRect((box.col) * squareSize + boardIndent, (box.row + invisibleRows) * squareSize + boardIndent, squareSize, squareSize);
        ctx.strokeRect((box.col) * squareSize + boardIndent, (box.row + invisibleRows) * squareSize + boardIndent, squareSize, squareSize);
    }

}
