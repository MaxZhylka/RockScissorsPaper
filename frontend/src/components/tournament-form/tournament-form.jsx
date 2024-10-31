import React, { useState, useEffect } from "react";
import useWebSocket from "../../websocket/websocket";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
const WS_BASE_URL=process.env.REACT_APP_WS_BASE_URL;
const TournamentForm=({close})=>
{
    const navigate= useNavigate();
    const gameId= useSelector(state=>state.game._id);
    const [query, setQuery]=useState("");
    const {sendMessage}=useWebSocket(WS_BASE_URL);
    const [isInitialMount,setIsInitialMount]=useState(true);
    const createTournament=()=>
    {
        if(query!=="")
        {   
            sendMessage({type:"tournament", tournamentName:query});
        }
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
        <div onClick={()=>{close(false)}} className="backGroundOpacity">
            <div className="scoreTable" onClick={(e)=>{e.stopPropagation()}} style={{justifyContent:"center", gap:"100px"}}>
                <div className="text">Input tournament name</div>
                <input className="input text" value={query} onChange={(e)=>{setQuery(e.target.value)}}/>
                <button className="createTournamentBtn" onClick={createTournament}>Create</button>
            </div>
        </div>
    );
}
export default TournamentForm;