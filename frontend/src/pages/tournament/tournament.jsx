import React, { useEffect, useState, useRef } from "react";
import { fetchTournament } from "../../service/userService";
import { useNavigate, useParams } from "react-router";
import Loader from "../../components/loader/loader";
import { CSSTransition } from "react-transition-group";
import ScoreTable from "../../components/scoreTable/scoreTable";
import { useDispatch, useSelector } from "react-redux";
import { setTournament } from "../../actionCreators/authAction";
import "./tournament.css";

const Tournament = () => {
    const { tournamentId } = useParams();
    const [displayScore, setDisplayScore] = useState(false);
    const navigate = useNavigate();
    const scoreRef = useRef(null);
    const dispatch = useDispatch();
    const tournamentData = useSelector(state => state.tournament);
    useEffect(() => {

        const fetchData = async () => {
            try {
                dispatch(setTournament(null));
                const tournament = await fetchTournament(tournamentId);
                dispatch(setTournament(tournament));
            } catch (error) {
                console.error('Error fetching tournament:', error);
            }
        };
        fetchData();

        return () => {
            dispatch(setTournament(null));
        };
    }, [dispatch, tournamentId]);

    const getWinnerScore = (game) => {
        const winnerPlayer = game.players.find(player => player.playerId === game.winnerId);
        return winnerPlayer ? winnerPlayer.score : "N/A";
    };

    const navigateToGame = (gameId) => {
    
        navigate(`/game/${gameId}`, { replace: true });
        window.location.reload();
    };

    const getPlayers = () => {
        const playerScores = {};

        tournamentData?.games?.forEach(game => {
            game.players.forEach(player => {
                if (!playerScores[player.playerId]) {
                    playerScores[player.playerId] = { playerName: player?.playerName, score: 0 };
                }
                playerScores[player.playerId].score += player.score;
            });
        });

        return Object.values(playerScores);
    };
    const getWinner =()=>
    {
        let playerScores=getPlayers();
        playerScores.sort((a,b)=>b.score-a.score);
        return playerScores[0]?.playerName;
    }
    const isTournamentEnd=()=>
    {
        if (!tournamentData?.games || tournamentData.games.length < 3) {
            return false;
        }
        console.log(tournamentData?.games[2]?.winnerId);
        return tournamentData?.games[2]?.winnerId!==""
    }

    if (!tournamentData) {
        return (<Loader />);
    }

    return (
        <div key={tournamentId}> 
            <CSSTransition
                in={displayScore}
                nodeRef={scoreRef}
                classNames="Unselect"
                timeout={300}
                unmountOnExit
            >
                <div ref={scoreRef}>
                    <ScoreTable close={setDisplayScore} players={getPlayers()} />
                </div>
            </CSSTransition>
            <div>
                <button
                    className="menuButton"
                    onClick={() => navigate('/menu')}
                    style={{ position: "inherit" }}
                >
                    Menu
                </button>

                {isTournamentEnd()&&<div className="Winner">{getWinner()} won this Tournament!</div>}
                <button
                    className="scoreBtn"
                    onClick={() => { setDisplayScore(!displayScore); }}
                >
                    Score
                </button>
            </div>
            <div className="gamesContainer">
                {tournamentData.games?.map((game, index) => (
                    <div
                        className="game"
                        onClick={() => {if(isNaN(getWinnerScore(game))){navigateToGame(game._id)}}}
                        key={game._id}
                    >
                        <div>Game № {index + 1}</div>
                        {game.winner && <div>Winner:</div>}
                        {game.winner && <div>{game.winner}</div>}
                        {game.winner && <div>The best score:</div>}
                        <div>
                            {isNaN(getWinnerScore(game)) ? "Game's still on!" : getWinnerScore(game)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tournament;
