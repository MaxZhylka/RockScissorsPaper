import React, { useEffect, useState, useCallback } from "react";
import questionImg from '../../assets/img/question.png'; 
import paperImg from '../../assets/img/paper.png';
import scissorsImg from '../../assets/img/scissors.png';
import rockImg from '../../assets/img/rock.png';
import conErrorImg from '../../assets/img/conError.png';
import "./player.css";
import { useSelector } from "react-redux";
import loser from '../../assets/img/loser.png';

const Player = ({ playerData, isDisplay }) => {
    const [img, setImg] = useState(questionImg); 
    const winnerId = useSelector(state => state.game.winnerId);
    const displayMove = useCallback(() => {
        const moves = playerData.moves || [];
        
        if (moves.length > 0 && isDisplay) {
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
    }, [playerData.moves, isDisplay]);


    useEffect(() => {
        const actions = playerData.actions || []; 
        const lastAction=actions.length>0?actions[actions.length - 1]:[];
            switch (lastAction) {
                case 'connect':
                    displayMove(); 
                    break;
                case 'disconnect':
                    if(!winnerId)
                    {
                        setImg(conErrorImg); 
                    }else
                    {
                        displayMove(); 
                    }
                    
                    break;
                default:
                    displayMove();
                    break;}
            }, [playerData, displayMove, winnerId]);

    return (
        <div className="playerContainer">
            <div className="playerName">{playerData.playerName}</div>
            <div className="playerChoose">
                <img className="playerImg" src={img} alt="Player's move" />
                {playerData.isLoose&&<img className="playerImg" src={loser} alt="Loser"/>}
            </div>
        </div>
    );
};

export default Player;
