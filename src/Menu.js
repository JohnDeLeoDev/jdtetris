
export function Menu(props) {

    let model = props.model;

    function Stats() {

        let time = Math.floor((new Date() - model.startTime) /1000);

        


        return (
            <div className="stats">
                {model.gameStarted !== false ? <p>Time Played: {time}s</p> : <p>Not Started</p>}
                <p>Initial Fall Rate: {model.config.initialFallRate}</p>
                <p>Current Fall Rate: {model.fallRate}</p>
                <p>Speed Up Threshold: {model.speedUpThreshold}</p>
                <p>Speed Up Rate: {model.speedUpRate}</p>

            </div>
        );
    }





    return (
        <div className="Menu">
            <Stats />          
        </div>
    );
}