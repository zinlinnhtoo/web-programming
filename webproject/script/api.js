const API_KEY = "51e92d390f844b7720230baaf82f763c";
const BASE_URL = "https://api.themoviedb.org/3";

/**
 * @param {number} page - The page number to fetch.
 * @returns {Promise<object>} The API response data, or null on failure.
 */

export async function getPopularMovies(page = 1) {
    const API_URL = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`;

    try {
        const response = await fetch(API_URL);

        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch(error) {
        console.error("Error fetching movies: ", error);
        return null;
    }   

}
