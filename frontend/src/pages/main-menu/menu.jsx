import "./menu.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useWebSocket from '../../websocket/websocket';
import {useSelector } from "react-redux";


const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL;

const Menu = () => {
 
    const { sendMessage } = useWebSocket(WS_BASE_URL);
    const navigate = useNavigate();
    const gameId = useSelector((state) => state.game._id);
    const [isInitialMount, setIsInitialMount] = useState(true); 


    const goToProfile = () => {
        navigate('/profile');
    };

    const createDuoGame = () => {
        sendMessage({ type: 'create', onlyTwoPlayers: true });
    };

    const createGame = () => {
        sendMessage({ type: 'create', onlyTwoPlayers: false });
    };

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
                <button className="menuBtn" onClick={createDuoGame}>PLAY 1 VS 1</button>
                <button className="menuBtn" onClick={createGame}>PLAY 3 AND MORE</button>
                <button className="menuBtn">TOURNAMENT</button>
                <button className="menuBtn" onClick={goToProfile}>PROFILE</button>
            </div>
        </div>
    );
};

export default Menu;
