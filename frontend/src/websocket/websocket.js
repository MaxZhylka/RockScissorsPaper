import { useEffect, useState } from 'react';
import { setGame } from '../actionCreators/gameActions';
import { useDispatch } from 'react-redux';

const useWebSocket = (url) => {
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
            console.log(event.data);
            const data = JSON.parse(event.data);
            dispatch(setGame(data.game));
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            socket.close();
        };
    }, [url]);

    const sendMessage = (message) => {
        if (ws) {
            ws.send(JSON.stringify(message));
        }
    };

    return { ws,readyState, sendMessage };
};

export default useWebSocket;
