import {getPopularMovies} from './api.js';
import {
    displayMovies,
    displayHeroCarousel,
    setupTopBarScroll,
    initializeSwiper,
} from './ui.js'

const state = {
    movies: []
}

async function init() {

    console.log("App starting...");

    setupTopBarScroll();

    const data = await getPopularMovies(1);
    const data2 = await getPopularMovies(2);
    if(data && data.results && data2.results && data2) {
        state.movies = [...data.results, ...data2.results];
        displayMovies(state.movies);
        displayHeroCarousel(state.movies);
    } else {
        console.error("No movies found");
    }

    initializeSwiper();
}

document.addEventListener("DOMContentLoaded", init);