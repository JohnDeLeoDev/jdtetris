import { useState, useEffect, useRef, setState } from "react";
import "./App.css";
import { UpdateDisplay } from "./Canvas";
import { Model } from "./Model";
import { config } from "./Config";
import { Menu } from "./Menu";
import { IoIosMenu } from "react-icons/io";
import { FaPlay } from "react-icons/fa";
import { CiPause1 } from "react-icons/ci";
import { VscDebugRestart } from "react-icons/vsc";


export default function App() {
    const [model, setModel] = useState(new Model(config));
    const canvasRef = useRef(null);
    const [redraw, forceRedraw] = useState(false);
    const [menu, setMenu] = useState(false);
    const [touchActive, setTouchActive] = useState(false);
    const [timeTouchStart, setTimeTouchStart] = useState(null);
    const [touchMoved, setTouchMoved] = useState(false);
    const [timeLastMovedLR, setTimeLastMoved] = useState(null);
    const [timeLastMovedDown, setTimeLastMovedDown] = useState(null);
    const [timeSinceLastMove, setTimeSinceLastMove] = useState(null);

    //prevent elastic scrolling
    useEffect(() => {
        document.body.addEventListener('touchmove', function (e) {
            if (!touchActive) {
                e.preventDefault();
            }
        }, { passive: false });
    }, [touchActive]);

    // Event listeners
    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [redraw]);

    function checkTimeLastMovedLR() {
        if (timeLastMovedLR === null) {
            return true;
        } else if (new Date().getTime() - timeLastMovedLR > 100) {
            return true;
        } else {
            return false;
        }
    }

    function checkTimeLastMovedDown() {
        if (timeLastMovedDown === null) {
            return true;
        } else if (new Date().getTime() - timeLastMovedDown > 75) {
            return true;
        } else {
            return false;
        }
    }

    // Handles touch gesture
    function handleGesture() {
        let xDiff = model.touchEndX - model.touchStartX;
        let yDiff = model.touchEndY - model.touchStartY;

        if (Math.abs(xDiff) < 10 && Math.abs(yDiff) < 200) {
            return;
        }

        if (Math.abs(xDiff) > Math.abs(yDiff) && checkTimeLastMovedLR()) {
            if (xDiff > 0) {
                model.movePieceRight();
                setTimeLastMoved(new Date().getTime());
                forceRedraw(!redraw);
            } else if (xDiff < 0) {
                model.movePieceLeft();
                setTimeLastMoved(new Date().getTime());
                forceRedraw(!redraw);
            }
        } else if (Math.abs(yDiff) > Math.abs(xDiff) && checkTimeLastMovedDown()) {
            if (yDiff > 0) {
                model.movePieceDown();
                setTimeLastMoved(new Date().getTime());
            } else if (yDiff < 0) {
                model.rotatePiece();
                setTimeLastMoved(new Date().getTime());
            }
        }

        forceRedraw(!redraw);
    }

    // Handles start button
    function handleStart() {
        model.startGame();
        forceRedraw(!redraw);
    }

    // Handles all keyboard presses
    function handleKeyDown(e) {
        if (e.keyCode === 37) {
            model.movePieceLeft();
            forceRedraw(!redraw);
        } else if (e.keyCode === 39) {
            model.movePieceRight();
            forceRedraw(!redraw);
        } else if (e.keyCode === 40) {
            model.movePieceDown();
            forceRedraw(!redraw);
        } else if (e.keyCode === 38) {
            model.rotatePiece();
            forceRedraw(!redraw);
        }
    }

    useEffect(() => {
        const timerInterval = setInterval(() => {
            if (model.gameStarted && !model.gameOver && !model.paused) {
                model.timePlayed++;
            }
        }, 1000);
        return () => clearInterval(timerInterval);
    }, []);

    // Every second, move piece down
    useEffect(() => {
        const interval = setInterval(() => {
            if (model.gameStarted && !model.gameOver && !model.paused) {
                model.checkGameOver();
                if (model.rowsCleared >= model.speedUpThreshold) {
                    model.fallRate -= (model.fallRate * model.speedUpRate);
                    model.rowsCleared = 0;
                    model.level++;
                }
                model.movePieceDown();
                forceRedraw(!redraw);
            }
        }, model.fallRate);
        return () => clearInterval(interval);
    }, [redraw]);

    // Handles restart button
    function handleRestart() {
        setModel(new Model(config));
        model.startGame();
        forceRedraw(!redraw);
    }

    function GameOver() {
        return (
            <div className="GameHeader">
                <h1>Game Over</h1>
            </div>
        );
    }

    function TimeDisplay() {

        let time = model.timePlayed;

        return (
            <div className="Time">
                {model.startTime !== null ? <p>Time Played: {time}s</p> : <p>Not Started</p>}
                
            </div>
        ); 
    }

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
        model.paused = !model.paused;
        forceRedraw(!redraw);
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

        setTimeTouchStart(new Date().getTime());
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
            forceRedraw(!redraw);
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
                {model.gameStarted && model.paused ? <FaPlay className="pauseIconActive" onClick={handlePause} onTouchEnd={handlePause}/> : null}
                {model.gameStarted && !model.paused ? <CiPause1 className="pauseIcon" onClick={handlePause} onTouchEnd={handlePause}/> : null}
                {model.gameStarted && model.paused ? <PauseScreen /> : null}
                {!model.gameStarted ? <FaPlay className="startIcon" onClick={handleStart} /> : <VscDebugRestart className="startIcon" onClick={handleRestart} />} 
            </div>
            <div className="GameArea" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                <div className="GameHeader">
                    {model.gameOver ? <GameOver /> : <Stats />}
                </div>             
                <canvas className="canvas" id="canvas" ref={canvasRef}   width="600" height="1200"></canvas>
                <UpdateDisplay canvasRef={canvasRef} model={model} redraw={redraw} />
            </div>
            <div className="Footer">
                <p>Controls: Left, Right, Down, Up-Rotates</p>
            </div>            
        </div>
    );
}