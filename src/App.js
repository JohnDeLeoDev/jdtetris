import {useState, useEffect, useRef, useCallback} from "react";
import "./App.css";
import { drawCanvas } from "./Canvas";
import { Model } from "./Model";
import { config } from "./Config";
import { Menu } from "./Menu";
import { IoIosMenu } from "react-icons/io";
import { FaPlay } from "react-icons/fa";
import { CiPause1 } from "react-icons/ci";
import { VscDebugRestart } from "react-icons/vsc";


export default function App() {
    const [model] = useState(new Model(config));
    const canvasRef = useRef(null);
    const [menu, setMenu] = useState(false);
    const [touchActive, setTouchActive] = useState(false);
    const [touchMoved, setTouchMoved] = useState(false);
    const [timeLastMovedLR, setTimeLastMoved] = useState(null);
    const [gameStarted, setStarted] = useState(false);
    const [paused, setPaused] = useState(false);
    const [time, setTime] = useState(0);
    const [runTimer, setRunTimer] = useState(false);

    function restartGame() {
        model.restartGame();

    }

    //prevent elastic scrolling
    useEffect(() => {
        document.body.addEventListener('touchmove', function (e) {
            if (!touchActive) {
                e.preventDefault();
            }
        }, { passive: false });
    }, [touchActive]);
    
    function checkTimeLastMovedLR() {
        if (timeLastMovedLR === null) {
            return true;
        } else return new Date().getTime() - timeLastMovedLR > 100;
    }

    // Handles touch gesture
    function handleGesture() {
        let xDiff = model.touchEndX - model.touchStartX;
        let yDiff = model.touchEndY - model.touchStartY;

        if (Math.abs(xDiff) < 20 && Math.abs(yDiff) < 100) {
            return;
        }

        if (Math.abs(xDiff) > Math.abs(yDiff) && checkTimeLastMovedLR()) {
            if (xDiff > 0) {
                model.movePieceRight();
                updateDisplay();
                setTimeLastMoved(new Date().getTime());
            } else if (xDiff < 0) {
                model.movePieceLeft();
                updateDisplay();
                setTimeLastMoved(new Date().getTime());
            }
        } else if (Math.abs(yDiff) > Math.abs(xDiff)) {
            if (yDiff > 0) {
                model.movePieceDown();
                updateDisplay();
                setTimeLastMoved(new Date().getTime());
            } else if (yDiff < 0) {
                model.rotatePiece();
                updateDisplay();
                setTimeLastMoved(new Date().getTime());
            }
        }

    }

    const updateDisplay = useCallback(() => {
        drawCanvas(model, canvasRef);


    }, [model]);

    // Handles start button
    function handleStart() {
        model.startGame();
        setRunTimer(true);
        setStarted(true);
        setPaused(false);
        updateDisplay();
    }

    // Handles all keyboard presses
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.keyCode === 37) {
                model.movePieceLeft();
            } else if (e.keyCode === 39) {
                model.movePieceRight();
            } else if (e.keyCode === 40) {
                model.movePieceDown();
            } else if (e.keyCode === 38) {
                model.rotatePiece();
            }
            updateDisplay();
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [model, updateDisplay]);

    useEffect(() => {
        if (runTimer) {
            const timerInterval = setInterval(() => {
                if (gameStarted && !model.gameOver && !paused) {
                    model.timePlayed++;
                    setTime(model.timePlayed);
                }
            }, 1000);
            return () => clearInterval(timerInterval);
        }
    }, [model.gameOver, gameStarted, paused, model.timePlayed, runTimer]);

    // Every second, move piece down
    useEffect(() => {
        if (runTimer) {
            const interval = setInterval(() => {

                if (gameStarted && !model.gameOver && !paused) {
                    model.checkGameOver();
                    if (model.rowsCleared >= model.speedUpThreshold) {
                        model.fallRate -= (model.fallRate * model.speedUpRate);
                        model.rowsCleared = 0;
                        model.level++;
                    }
                    model.movePieceDown();
                    updateDisplay();
                }
            }, model.fallRate);
            return () => clearInterval(interval);
        }
    }, [gameStarted, paused, runTimer, model, updateDisplay]);

    // Handles restart button
    function handleRestart() {
        setRunTimer(false);
        setTime(0);
        restartGame();
        model.startGame();
        setRunTimer(true);
        updateDisplay();
    }

    function GameOver() {
        return (
            <div className="GameHeader">
                <h1>Game Over</h1>
            </div>
        );
    }

    const TimeDisplay = useCallback(() => {

        return (
            <div className="Time">
                {time ? <p>Time Played: {time}s</p> : <p>Not Started</p>}

            </div>
        );
    }, [time]);


    function Stats() {

        return (
            <div className="GameHeader">
                <p>Rows Cleared: {model.rowsCleared}</p>
                <p>Level: {model.level}</p>
                <p>Score: {model.score}</p>
            </div>
        );
    }

    function handleMenu() {
        setMenu(!menu);
    }

    function handlePause() {
        setPaused(!paused);
    }

    function PauseScreen() {
        return (
            <div className="PauseScreen">

            </div>
        );
    }

    function checkPieceLocked() {
        return model.board.pieceLocked;
    }

    function handleTouchStart(e) {
        e.preventDefault();
        model.board.pieceLocked = false;
        setTouchActive(true);


        let touch = e.touches[0];
        let x = touch.clientX;
        let y = touch.clientY;

        model.touchStartX = x;
        model.touchStartY = y;
        model.touchEndX = x;
        model.touchEndY = y;

        setTouchMoved(false);

    }

    function handleTouchMove(e) {
        e.preventDefault();
        if (!checkPieceLocked()) {
            let touch = e.touches[0];
            let x = touch.clientX;
            let y = touch.clientY;

            model.touchEndX = x;
            model.touchEndY = y;

            setTouchMoved(true);

            handleGesture();
        }
    }

    function handleTouchEnd(e) {
        e.preventDefault();

        if (!touchMoved) {
            model.rotatePiece();
        }
        setTouchActive(false);
        setTouchMoved(false);
    }

    return (
        <div className="App">
            {menu ? <Menu handleMenu={handleMenu} model={model}/> : null}
            <div className="Header">
                <IoIosMenu className="menuIcon" onClick={handleMenu} />
                <h1 className="AppName">JD Tetris</h1>
                <TimeDisplay />
                {gameStarted && paused ? <FaPlay className="pauseIconActive" onClick={handlePause} onTouchEnd={handlePause}/> : null}
                {gameStarted && !paused ? <CiPause1 className="pauseIcon" onClick={handlePause} onTouchEnd={handlePause}/> : null}
                {gameStarted && paused ? <PauseScreen /> : null}
                {!gameStarted ? <FaPlay className="startIcon" onClick={handleStart} /> : <VscDebugRestart className="startIcon" onClick={handleRestart} />}
            </div>
            <div className="GameArea" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                <div className="GameHeader">
                    {model.gameOver ? <GameOver /> : <Stats />}
                </div>
                <canvas className="canvas" id="canvas" ref={canvasRef}   width="600" height="1200"></canvas>
            </div>
            <div className="Footer">
                <p>Controls: Left, Right, Down, Up-Rotates</p>
            </div>
        </div>
    );
}