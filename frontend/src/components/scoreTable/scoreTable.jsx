import React from "react";
import { useSelector } from "react-redux";
import "./scoreTable.css";
const ScoreTable = ({ close, players: propPlayers }) => {
    const game = useSelector(state => state.game);
    const players = propPlayers?.slice().sort((a,b)=>b.score-a.score) || game.players.slice().sort((a, b) => b.score - a.score);
    
    return(<div onClick={()=>{close(false)}} className="backGroundOpacity" >
        <div className="scoreTable" onClick={(e)=>{e.stopPropagation()}}>
        {players.map((player,index)=>
            {
                return <div key={index} className="playerScore">
                        <span className="playerIndex">#{index+1}</span>
                        <span className="playerTabeName">{player.playerName}</span>
                        <span className="playerScoreTxt">{player.score}</span>
                    </div>
            }
        )}
        </div>
    </div>)
};
export default ScoreTable;