import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Player from "../../components/player/player";
import useWebSocket from "../../websocket/websocket";
import { useParams } from "react-router-dom"; 
import paperImg from '../../assets/img/paper.png';
import scissorsImg from '../../assets/img/scissors.png';
import rockImg from '../../assets/img/rock.png';
import flag from '../../assets/img/flag.png'
import "./game-page.css"
const GamePage = () => {
    const {gameId} = useParams();
    const user = useSelector(state=>state.auth.user);
    const game = useSelector(state => state.game);
    const headers = ["Prepare", "Round 1", "Round 2", "Round 3"];
    const { sendMessage, ws, readyState } = useWebSocket("ws://localhost:5000");

    useEffect(() => {

        if (ws && readyState) {
            sendMessage({ type: 'join', gameId: gameId, playerId: user.id, playerName: user.login });
        }
    }, [readyState]);

    const move = (move) =>
    {
        sendMessage({type: 'move', gameId: gameId,playerId: user.id,playerName:user.login, move:move });
    }
    
    const Moves ={
        Rock: 'rock',
        Scissors: 'scissors',
        Paper: 'paper'
    }
    

    return (
        <div>
            <header className="gameHeader">
                <img className="headerImg" src={flag} alt="Flag" />
                <h1 className="headerText">{headers[0]}</h1>
            </header>
            <div className="timer"></div>
            <div className="players">
                {game.players.map((player, index) => (
                    <Player key={index} playerData={player} />
                ))}
            </div>
            <div className="buttonsContainer">
                <button className="Btn" onClick={()=>move(Moves.Rock)}><img className="gameBtnImg" src={rockImg}/></button>
                <button className="Btn" onClick={()=>move(Moves.Scissors)}><img className="gameBtnImg" src={scissorsImg}/></button>
                <button className="Btn" onClick={()=>move(Moves.Paper)}><img className="gameBtnImg" src={paperImg}/></button>
            </div>
        </div>
    );
};

export default GamePage;
