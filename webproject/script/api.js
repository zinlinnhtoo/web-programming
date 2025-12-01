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

// --- Authentication & Favorites ---

export async function createRequestToken() {
    const API_URL = `${BASE_URL}/authentication/token/new?api_key=${API_KEY}`;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error("Failed to create request token");
        }
        return data; // { success, expires_at, request_token }
    } catch (error) {
        console.error("Error creating request token:", error);
        throw error;
    }
}

export async function createSession(requestToken) {
    const API_URL = `${BASE_URL}/authentication/session/new?api_key=${API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify({ request_token: requestToken })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success || !data.session_id) {
            throw new Error("Failed to create session");
        }

        return data; // { success, session_id }
    } catch (error) {
        console.error("Error creating session:", error);
        throw error;
    }
}

export async function getAccountDetails(sessionId) {
    const API_URL = `${BASE_URL}/account?api_key=${API_KEY}&session_id=${sessionId}`;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data; // includes "id" (account id)
    } catch (error) {
        console.error("Error fetching account details:", error);
        throw error;
    }
}

export async function markAsFavorite(accountId, sessionId, movieId, favorite) {
    const API_URL = `${BASE_URL}/account/${accountId}/favorite?api_key=${API_KEY}&session_id=${sessionId}`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify({
                media_type: "movie",
                media_id: movieId,
                favorite: !!favorite
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error("Failed to update favorite on TMDB");
        }

        return data;
    } catch (error) {
        console.error("Error marking movie as favorite:", error);
        throw error;
    }
}