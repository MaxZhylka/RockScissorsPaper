determineRoundWinner = (players) => {
    let moves = players.map(element => { 
        return { id: element.playerId,name:element.playerName, move: element.moves[element.moves.length - 1] }; 
    });

    const moveCounts = {};
    moves.forEach(({ move }) => {
        if (!moveCounts[move]) {
            moveCounts[move] = 0;
        }
        moveCounts[move]++;
    });

    const moveTypes = Object.keys(moveCounts);
    if (moveTypes.length === 1 || moveTypes.length === 3) {
        return []; 
    }

    let winningMove;
    if (moveTypes.includes('rock') && moveTypes.includes('scissors')) {
        winningMove = 'rock';
    } else if (moveTypes.includes('scissors') && moveTypes.includes('paper')) {
        winningMove = 'scissors';
    } else if (moveTypes.includes('paper') && moveTypes.includes('rock')) {
        winningMove = 'paper';
    } else {
        return [];
    }

    const winners = moves
        .filter(moveObj => moveObj.move === winningMove)
        .map(moveObj => ({
            playerId: moveObj.id,
            playerName: moveObj.name  
        }));

    return winners; 
}



module.exports = determineRoundWinner;
