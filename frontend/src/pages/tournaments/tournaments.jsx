import React, { useEffect, useState, useRef } from "react";
import { fetchTournaments } from "../../service/userService";
import { CSSTransition } from 'react-transition-group';
import TournamentForm from "../../components/tournament-form/tournament-form";
import "./tournaments.css";
import { useNavigate } from "react-router";

const Tournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false); 
    const [hasMore, setHasMore] = useState(false);
    const [displayTournamentForm, setDisplayTournamentForm] = useState(false);
    const formRef = React.createRef();
    const observerRef = useRef(null);

    const navigate = useNavigate();

    const isTournamentEnd = (tournament) => {
        return tournament.games[2].winnerId ;
    };

    // Fetch tournaments based on current page and search query
    const loadTournaments = async (pageToLoad, reset = false) => {
        setIsLoading(true);
        try {
            const newTournaments = await fetchTournaments(pageToLoad, 10, searchQuery);
            setTournaments((prev) => reset ? newTournaments : [...prev, ...newTournaments]);
            // Set hasMore to false when fewer items than requested are returned
            setHasMore(newTournaments.length === 10);
        } catch (error) {
            console.error("Error loading tournaments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setTournaments([]);
            setHasMore(false);
            return;
        }

        setHasMore(true); 
        const debounceTimeout = setTimeout(() => {
            setPage(1);
        }, 400);

        return () => clearTimeout(debounceTimeout);
    }, [searchQuery]);

    useEffect(() => {
        if (searchQuery.trim() === "") return; 
        loadTournaments(page, page === 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchQuery]);

    const handleObserver = (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading && hasMore && searchQuery.trim() !== "") {
            setPage((prevPage) => prevPage + 1); 
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: "0px",
            threshold: 1.0, 
        });
        const currentNode = observerRef.current;
        if (currentNode && hasMore) {
            observer.observe(currentNode); 
        }
        
        return () => {
            if (currentNode) {
                observer.unobserve(currentNode); 
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, hasMore]);

    return (
        <div>
            <button className="MenuBtn" onClick={() => navigate("/menu")}>Menu</button>
            <div className="tournamentsContainer">
                <input 
                    placeholder="Input tournament name" 
                    className="searchTournament"
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
                <div className="tournaments">
                    {tournaments.map((tournament) => (
                        <div className="tournament" key={tournament._id} onClick={() => navigate(`/tournament/${tournament._id}`)}>
                            <span className="tournamentName">{tournament.name}</span>
                            <span className={isTournamentEnd(tournament) ? "tournamentEnd" : "tournamentActive"}>
                                {isTournamentEnd(tournament) ? "Over" : "Active"}
                            </span>
                        </div>
                    ))}
                    {isLoading && <p>Loading...</p>}
                    {hasMore && <div ref={observerRef} style={{ height: "1px" }} />} 
                </div>
            </div>
            <button className="createTournamentBtn" onClick={() => setDisplayTournamentForm(true)}>Create</button>
            <CSSTransition in={displayTournamentForm} nodeRef={formRef} classNames="Unselect" timeout={300} unmountOnExit>
                <div ref={formRef}>
                    <TournamentForm close={setDisplayTournamentForm} />
                </div>
            </CSSTransition>
        </div>
    );
};

export default Tournaments;
