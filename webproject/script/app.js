import {getPopularMovies} from './api.js';
import { displayMovies } from './ui.js';

const state = {
    movies: [],
}

async function init() {

    console.log("App starting...");

    const data = await getPopularMovies(1);
    const data2 = await getPopularMovies(2);

    if(data && data.results && data2.results && data2) {
        state.movies = [...data.results, ...data2.results];
        displayMovies(state.movies);
    } else {
        console.error("No movies found");
    }
}

document.addEventListener("DOMContentLoaded", init);