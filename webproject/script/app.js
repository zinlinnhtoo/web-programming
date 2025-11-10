import {getPopularMovies} from './api.js';
import {
    displayMovies,
    displayHeroCarousel,
    setupTopBarScroll,
    initializeSwiper,
    setUpMovieScrollButton
} from './ui.js'

const state = {
    movies: []
}

async function init() {

    console.log("App starting...");

    setupTopBarScroll();

    const data = await getPopularMovies(1);
    if(data && data.results) {
        state.movies = data.results;
        displayMovies(state.movies);
        displayHeroCarousel(state.movies);

        setUpMovieScrollButton();
    } else {
        console.error("No movies found");
    }

    initializeSwiper();
}

document.addEventListener("DOMContentLoaded", init);