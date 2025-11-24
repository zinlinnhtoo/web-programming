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

export async function getTopRatedMovies(page = 1) {
    // Note: The only change is the URL path from /popular to /top_rated
    const API_URL = `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`;
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching top rated movies:", error);
        return null;
    }
}

export async function getUpcomingMovies(page = 1) {
    // Note: The only change is the URL path from /popular to /top_rated
    const API_URL = `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=${page}`;
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching top rated movies:", error);
        return null;
    }
}

export async function getMovieDetail(id) {
    // Append credits so we can show cast info on the detail page
    const API_URL = `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=credits`;

    try {
        const response = await fetch(API_URL);

        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch(error) {
        console.error("Error fetching movie details: ", error);
        throw error;
    }
}

export async function searchMovies(query, page = 1) {
    const API_URL = `${BASE_URL}/search/movie?include_adult=false&language=en-US&page=${page}&api_key=${API_KEY}&query=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(API_URL);

        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch(error) {
        console.error("Error searching movies: ", error);
        return null;
    }
}
