let canvasWidth = 600;
let canvasHeight = 1200;
let squareSize = canvasWidth / 13;
let boardIndent = (canvasWidth - (squareSize* 10))/2;

export const config = {

    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
    squareSize: squareSize,
    boardIndent: boardIndent,


    boardSize: {
        columns: 10,
        rows: 20
    },

    initialFallRate: 1000,

    speedUpThreshold: 5, //5 rows cleared

    speedUpRate: .10, //every speedUpThreshold rows cleared, speed up by 50ms

    invisibleRows: 3,

    colors: {
        I: 'darkcyan',
        O: 'darkgoldenrod',
        T: 'mediumpurple',
        S: 'darkseagreen',
        Z: 'crimson',
        J: 'steelblue',
        L: 'sandybrown',
        emptyColor: 'white',
        lineColor: 'black',
        shadowColor: 'lightgrey'
    },

    lineWidth: 2,

    pieces: {
        Z: {
            rotations: [
                [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ], [
                    [0, 0, 1],
                    [0, 1, 1],
                    [0, 1, 0]
                ], [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ], [
                    [0, 0, 1],
                    [0, 1, 1],
                    [0, 1, 0]
                ]
            ],
            centralBox: [
                1, 1
            ]
        },
        S: {
            rotations: [
                [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ], [
                    [0, 1, 0],
                    [0, 1, 1],
                    [0, 0, 1]
                ], [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ], [
                    [0, 1, 0],
                    [0, 1, 1],
                    [0, 0, 1]
                ]
            ],
            centralBox: [
                1, 1
            ]
        },
        L: {
            rotations: [
                [
                    [0, 0, 1],
                    [1, 1, 1],
                    [0, 0, 0]
                ], [
                    [0, 1, 0],
                    [0, 1, 0],
                    [0, 1, 1]
                ], [
                    [0, 0, 0],
                    [1, 1, 1],
                    [1, 0, 0]
                ], [
                    [1, 1, 0],
                    [0, 1, 0],
                    [0, 1, 0]
                ]
            ],
            centralBox: [
                1, 1
            ]
        },
        J: {
            rotations: [
                [
                    [1, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ], [
                    [0, 1, 1],
                    [0, 1, 0],
                    [0, 1, 0]
                ], [
                    [0, 0, 0],
                    [1, 1, 1],
                    [0, 0, 1]
                ], [
                    [0, 1, 0],
                    [0, 1, 0],
                    [1, 1, 0]
                ]
            ],
            centralBox: [
                1, 1
            ]
        },
        T: {
            rotations: [
                [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ], [
                    [0, 1, 0],
                    [0, 1, 1],
                    [0, 1, 0]
                ], [
                    [0, 0, 0],
                    [1, 1, 1],
                    [0, 1, 0]
                ], [
                    [0, 1, 0],
                    [1, 1, 0],
                    [0, 1, 0]
                ]
            ],
            centralBox: [
                1, 1
            ]
        },
        O: {
            rotations: [
                [
                    [1, 1],
                    [1, 1]
                ]
            ],
            centralBox: [
                1, 1
            ]
        }
    }
}


                
  