import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Player from "../../components/player/player";
import useWebSocket from "../../websocket/websocket";
import { useParams } from "react-router-dom";
import paperImg from '../../assets/img/paper.png';
import scissorsImg from '../../assets/img/scissors.png';
import rockImg from '../../assets/img/rock.png';
import flag from '../../assets/img/flag.png';
import { CSSTransition } from 'react-transition-group';
import Loader from '../../components/loader/loader';
import "./game-page.css";
import { useNavigate } from "react-router-dom";


const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL;
const GamePage = () => {
    const { gameId } = useParams();

    const user = useSelector(state => state.auth.user);
    const game = useSelector(state => state.game);
    const [isLoading, setIsLoading] = useState(true);
    const { sendMessage, readyState } = useWebSocket(WS_BASE_URL, setIsLoading);
    const [currentMove, setCurrentMove] = useState("");
    const [isSelectButtonActive, setIsSelectButtonActive] = useState(false);
    const [unselectStates, setUnselectStates] = useState({ rock: false, paper: false, scissors: false });
    const navigate = useNavigate(); 
    const [displayScore,setDisplayScore]=useState(false);
    const rockRef = useRef(null);
    const paperRef = useRef(null);
    const scissorsRef = useRef(null);

    useEffect(() => {
        if ( readyState) {
            
            sendMessage({ type: 'join', gameId: gameId, playerId: user.id, playerName: user.login,},()=>{setIsLoading(false);});
            

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readyState]);

    useEffect(() => {
        if (!game.isDisplay) {
            setIsSelectButtonActive(false);
            setCurrentMove('');
        }
    }, [game.isDisplay]);

    useEffect(()=>
        {
            const currentPlayer=game.players.find(player=>player.playerId===user.id);
            if(currentPlayer&&game.results.length<currentPlayer.moves.length)
            {   
                setIsSelectButtonActive(true);
                setCurrentMove(currentPlayer.moves[currentPlayer.moves.length-1]);
            }
            
        // eslint-disable-next-line react-hooks/exhaustive-deps
        },[game.players]);

    useEffect(() => {
        const newUnselectStates = { rock: true, paper: true, scissors: true };
        if (currentMove === "rock") {
            newUnselectStates.paper = false;
            newUnselectStates.scissors = false;
        } else if (currentMove === "paper") {
            newUnselectStates.rock = false;
            newUnselectStates.scissors = false;
        } else if (currentMove === "scissors") {
            newUnselectStates.rock = false;
            newUnselectStates.paper = false;
        }
        setUnselectStates(newUnselectStates);
    }, [currentMove]);

    const move = () => {
        if (currentMove !== "") {
            sendMessage({
                type: 'move',
                gameId: gameId,
                playerId: user.id,
                playerName: user.login,
                move: currentMove
            });
            setIsSelectButtonActive(true);
        }
    };
    const GoToMenu=()=>{
        navigate('/menu/');
        
    }
    const isLoose = () => {
        
        if (!game || !game.players) {
            return false; 
        }
    
        if ((game.players.find(player => player.playerId === user.id && player.isLoose)) || 
            (!game.players.find(player => player.playerId === user.id))) {
            return true;
        }
    
        return false;
    };
    
    
    const Moves = {
        Rock: 'rock',
        Scissors: 'scissors',
        Paper: 'paper'
    };


    const calcScore = () => {
        if (game.players.length !== 2) return "";

        const scores = { [game.players[0].playerId]: 0, [game.players[1].playerId]: 0 };

        (game.results || []).forEach(result => {
            if (result.winnerId[0] && result.winnerId.length > 0) {
                if (result.winnerId[0].includes(game.players[0].playerId)) {
                    scores[game.players[0].playerId]++;
                } else if (result.winnerId[0].includes(game.players[1].playerId)) {
                    scores[game.players[1].playerId]++;
                }
            }
        });
        return `${scores[game.players[0].playerId]} : ${scores[game.players[1].playerId]}`;
    };
    const GiveUp=()=>
        {
            
            sendMessage({type:"giveUp",
                gameId: gameId,
                playerId: user.id,
                playerName: user.login
            });
        }   
   

        if(isLoading)
        {
            return(<Loader/>);
        }

    return (
        <div>
            <header className="gameHeader">
                {!game.winnerId&&<img onClick={GiveUp} className="headerImg" src={flag} alt="Flag" />}
                {(game.winnerId||isLoose())&&<button onClick={GoToMenu} className="menuButton">Menu</button>}
                {(game.winnerId||isLoose())&& <button onClick={setDisplayScore(!displayScore)}>SCORE</button>}
                <h1 className="headerText"> {game.winner?`${game.winner} WIN`:`Round ${game.results?.length +1|| 1}`}</h1>
                {game.players?.length === 2 && <div className="scoreText">{calcScore()}</div>}
            </header>
            <div className="timer"></div>
            <div className="players">
                {(game.players || []).map((player, index) => {
                    
                    return <Player key={index} playerData={player} isDisplay={game.isDisplay} />
                })}
            </div>
            {!game.winnerId&&!isLoose()&&<div className="BtnContainer">
                <button className="selectBtn" disabled={isSelectButtonActive} onClick={move}>
                    {isSelectButtonActive ? "Selected" : "Select"}
                </button>
            </div>
            }

            {!game.winnerId&&!isLoose()&&<div className="buttonsContainer"> 
                <button className="Btn" disabled={isSelectButtonActive} onClick={() => setCurrentMove(Moves.Rock)}>
                    <img className="gameBtnImg" src={rockImg} alt="Rock" />
                    <CSSTransition nodeRef={rockRef} in={!unselectStates.rock} classNames="Unselect" timeout={200} unmountOnExit>
                        <div ref={rockRef} className="Unactive"></div>
                    </CSSTransition>
                </button>
                <button className="Btn" disabled={isSelectButtonActive} onClick={() => setCurrentMove(Moves.Scissors)}>
                    <img className="gameBtnImg" src={scissorsImg} alt="Scissors" />
                    <CSSTransition nodeRef={scissorsRef} in={!unselectStates.scissors} classNames="Unselect" timeout={200} unmountOnExit>
                        <div ref={scissorsRef} className="Unactive"></div>
                    </CSSTransition>
                </button>
                <button className="Btn" disabled={isSelectButtonActive} onClick={() => setCurrentMove(Moves.Paper)}>
                    <img className="gameBtnImg" src={paperImg} alt="Paper" />
                    <CSSTransition nodeRef={paperRef} in={!unselectStates.paper} classNames="Unselect" timeout={200} unmountOnExit>
                        <div ref={paperRef} className="Unactive"></div>
                    </CSSTransition>
                </button>
            </div>
            }
        </div>
    );
};

export default GamePage;
