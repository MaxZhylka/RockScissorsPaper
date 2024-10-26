import React, { useEffect }  from "react";
import "./menu.css";
import { useNavigate } from "react-router";
import useWebSocket from '../../websocket/websocket';
import { useSelector } from "react-redux";
const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL;
const Menu=()=>
{ 
    const { sendMessage } = useWebSocket(WS_BASE_URL); 
    const navigate=useNavigate();
    const gameId=useSelector( (state)=>state.game._id);
    const goToProfile=()=>
    {
        navigate('/profile');
    }
    const createGame=()=>
    {
        sendMessage({type: 'create'});

    }
    useEffect(()=>
    {
        if(gameId!=="")
        {
            navigate(  `/game/${gameId}`);
        }
    },[gameId, navigate]);

    return(
        <div>
            <h1 className="mainHeader">ROCK | SCISSORS | PAPPER</h1>
            <div className="menu">
                <button className="menuBtn">PLAY WITH BOT</button>
                <button className="menuBtn" onClick={createGame}>PLAY 1 VS 1</button>
                <button className="menuBtn">TOURNAMENT</button>
                <button className="menuBtn" onClick={goToProfile}>PROFILE</button>
            </div>
        </div>
    )
}
export default Menu;