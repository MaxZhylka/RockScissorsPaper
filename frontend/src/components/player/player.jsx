import React, { useEffect, useState, useCallback } from "react";
import questionImg from '../../assets/img/question.png'; 
import paperImg from '../../assets/img/paper.png';
import scissorsImg from '../../assets/img/scissors.png';
import rockImg from '../../assets/img/rock.png';
import conErrorImg from '../../assets/img/conError.png';
import "./player.css";

const Player = ({ playerData }) => {
    const [img, setImg] = useState(questionImg); 

    const displayMove = useCallback(() => {
        const moves = playerData.moves || [];
        if (moves.length > 0) {
            const lastMove = moves[moves.length - 1];
            switch (lastMove) {
                case 'paper':
                    setImg(paperImg);
                    break;
                case 'scissors':
                    setImg(scissorsImg);
                    break;
                case 'rock':
                    setImg(rockImg);
                    break;
                default:
                    setImg(questionImg);
                    break;
            }
        } else {
            setImg(questionImg); 
        }
    }, [playerData.moves]);

    useEffect(() => {
        const actions = playerData.actions || []; 
        if (actions.length > 0) {
            const lastAction = actions[actions.length - 1];
            switch (lastAction) {
                case 'connect':
                    displayMove(); 
                    break;
                case 'disconnect':
                    setImg(conErrorImg); 
                    break;
                default:
                    setImg(questionImg); 
                    break;
            }
        } else {
            setImg(questionImg);
        }
    }, [playerData, displayMove]);

    return (
        <div className="playerContainer">
            <div className="playerName">{playerData.playerName}</div>
            <div className="playerChoose">
                <img className="playerImg" src={img} alt="Player's move" />
            </div>
        </div>
    );
};

export default Player;
