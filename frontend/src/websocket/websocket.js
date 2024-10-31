import { useEffect, useState } from 'react';
import { setGame } from '../actionCreators/gameActions';
import { useDispatch } from 'react-redux';
import { setTournament } from '../actionCreators/authAction';

const useWebSocket = (url, onMessageReceived) => {
    const [ws, setWs] = useState(null);
    const [readyState, setReady] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        const socket = new WebSocket(url);
        setWs(socket);

        socket.onopen = () => {
            console.log('WebSocket connection established');
            setReady(true);
        };

        socket.onmessage = (event) => {

            const data = JSON.parse(event.data);
            if(data.type==="tournament")
            {
                dispatch(setTournament(data.tournamet));
            }
            dispatch(setGame(data.game));
            if (onMessageReceived) onMessageReceived();
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            socket.close();
        };
    }, [url, dispatch, onMessageReceived]);

    const sendMessage = (message) => {
        if (ws) {
            
            ws.send(JSON.stringify(message));
            
        }
    };

    return { ws,readyState, sendMessage };
};

export default useWebSocket;
