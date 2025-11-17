import {
    getPopularMovies,
    getMovieDetail
} from './api.js';

import {
    displayMovies,
    displayHeroCarousel,
    setupTopBarScroll,
    initializeSwiper,
    setUpMovieScrollButton,
    displayMovieDetail
} from './ui.js'

const state = {
    movies: [],
    currentMovie: null
}

async function init() {

    console.log("App starting...");

    setupTopBarScroll();

    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get("id");

    if (movieId) {
        console.log("Loading Detail Page...");
        try {
            const movie = await getMovieDetail(movieId);
            state.currentMovie = movie;
            displayMovieDetail(movie);
        } catch (error) {
            console.error("Failed to load movie detail", error);
            const detailContainer = document.getElementById("movie-detail");
            if (detailContainer) detailContainer.innerHTML = `<p class="text-danger">Error loading movie details.</p>`;
        }

    } else {

        console.log("Loading Home page...");
        const data = await getPopularMovies(1);
        if (data && data.results) {
            state.movies = data.results;
            displayMovies(state.movies);
            displayHeroCarousel(state.movies);
            setUpMovieScrollButton();
            initializeSwiper();
        } else {
            console.error("No movies found");
        }
    }
}

document.addEventListener("DOMContentLoaded", init);