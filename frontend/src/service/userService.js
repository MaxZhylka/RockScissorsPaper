import $api from "../http";


export const fetchTournaments = async (page = 1, limit = 10, searchQuery = '') => {
    try {
        const response = await $api.get('/tournaments', {
        params: {
            page,
            limit,
            query: searchQuery
        }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        throw error;
    }
};
export const fetchTournament = async (tournamentId) => {
    try {
        const response = await $api.get(`/tournament`, {
            params:{
                tournamentId:tournamentId
            }
        }); 
        return response.data;
    } catch (error) {
        console.error('Error fetching tournament:', error);
        throw error; 
    }
};
