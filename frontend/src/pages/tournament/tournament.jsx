import React, { useEffect, useState, useRef } from "react";
import { fetchTournament } from "../../service/userService";
import { useNavigate, useParams } from "react-router";
import Loader from "../../components/loader/loader";
import { CSSTransition } from "react-transition-group";
import ScoreTable from "../../components/scoreTable/scoreTable";
import "./tournament.css";

const Tournament = () => {
    const { tournamentId } = useParams();
    const [displayScore, setDisplayScore] = useState(false);
    const navigate = useNavigate();
    const scoreRef = useRef(null);
    const [tournamentData, setTournamentData] = useState(null);

    useEffect(() => {
        console.log("Fetching tournament data for:", tournamentId);

        const fetchData = async () => {
            try {
                setTournamentData(null); // Сброс данных перед загрузкой новых
                const tournament = await fetchTournament(tournamentId);
                setTournamentData(tournament);
            } catch (error) {
                console.error('Error fetching tournament:', error);
            }
        };
        fetchData();

        // Cleanup function to reset tournament data on unmount
        return () => {
            setTournamentData(null);
        };
    }, [tournamentId]);

    const getWinnerScore = (game) => {
        const winnerPlayer = game.players.find(player => player.playerId === game.winnerId);
        return winnerPlayer ? winnerPlayer.score : "N/A";
    };

    const navigateToGame = (gameId) => {
        // Обновляем страницу, чтобы гарантировать полное обновление данных
        navigate(`/game/${gameId}`, { replace: true });
        window.location.reload();
    };

    const getPlayers = () => {
        const playerScores = {};

        tournamentData?.games?.forEach(game => {
            game.players.forEach(player => {
                if (!playerScores[player.playerId]) {
                    playerScores[player.playerId] = { playerName: player.playerName, score: 0 };
                }
                playerScores[player.playerId].score += player.score;
            });
        });

        return Object.values(playerScores);
    };

    if (!tournamentData) {
        return (<Loader />);
    }

    return (
        <div key={tournamentId}> {/* Принудительное обновление по ключу */}
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
