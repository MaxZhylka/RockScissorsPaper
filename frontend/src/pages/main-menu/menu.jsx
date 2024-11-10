import "./menu.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useWebSocket from '../../websocket/websocket';
import {useSelector } from "react-redux";
import hint from "../../assets/img/hint.png";

const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL;

const Menu = () => {
 
    
    const navigate = useNavigate();
    const gameId = useSelector((state) => state.game._id);
    const [isInitialMount, setIsInitialMount] = useState(true); 
    const { sendMessage } = useWebSocket(WS_BASE_URL);


    const goToProfile = () => {
        navigate('/profile');
    };

    const createDuoGame = () => {
        sendMessage({ type: 'create', onlyTwoPlayers: true });
    };

    const createGame = () => {
        sendMessage({ type: 'create', onlyTwoPlayers: false });
    };

    const createTournament =()=>
    {
        navigate("/tournaments");
    }


    useEffect(() => {
        if (!isInitialMount) {
            const timeOut = setTimeout(() => {
                if (gameId && gameId !== "") {
                    navigate(`/game/${gameId}`);
                }
            }, 0);
            return () => clearTimeout(timeOut);
        } else {
            setIsInitialMount(false); 
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameId, navigate]);

    return (
        <div>
            <h1 className="mainHeader">ROCK | SCISSORS | PAPER</h1>
            <div className="menu">

                <div className="lineWithRules">
                    <button className="menuBtn" onClick={createDuoGame}>PLAY 1 VS 1</button>
                    <div className="rules">
                        <img className="hintIMG" src={hint} alt="hint" />
                        <span className="hint">
                            The game will continue until one player wins 3 times. 
                            In each round, the score will be calculated as follows: 
                            <br/>
                            - Win: 300 points
                            <br/>
                            - Loss: 50 points
                            <br/>
                            - Draw: 100 points
                        </span>
                    </div>
                </div>
                <div className="lineWithRules">
                    <button className="menuBtn" onClick={createGame}>PLAY 3 AND MORE</button>
                    <div className="rules">
                        <img className="hintIMG" src={hint} alt="hint" />
                        <span className="hint">
                        This game type will not end until there is at least one player with no losses. 
                        For each round, the player who lasted will earn 175 points.
                        </span>
                    </div>
                </div>

                <button className="menuBtn" onClick={createTournament}>TOURNAMENT</button>
                <button className="menuBtn" onClick={goToProfile}>PROFILE</button>
            </div>
        </div>
    );
};

export default Menu;
