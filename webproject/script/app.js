import {
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
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

// async function init() {

//     console.log("App starting...");

//     setupTopBarScroll();

//     const urlParams = new URLSearchParams(window.location.search);
//     const movieId = urlParams.get("id");

//     if (movieId) {
//         console.log("Loading Detail Page...");
//         try {
//             const movie = await getMovieDetail(movieId);
//             state.currentMovie = movie;
//             displayMovieDetail(movie);
//         } catch (error) {
//             console.error("Failed to load movie detail", error);
//             const detailContainer = document.getElementById("movie-detail");
//             if (detailContainer) detailContainer.innerHTML = `<p class="text-danger">Error loading movie details.</p>`;
//         }

//     } else {

//         console.log("Loading Home page...");
//         const data = await getPopularMovies(1);
//         if (data && data.results) {
//             state.movies = data.results;
//             displayMovies(state.movies);
//             displayHeroCarousel(state.movies);
//             setUpMovieScrollButton();
//             initializeSwiper();
//         } else {
//             console.error("No movies found");
//         }
//     }
// }

async function loadHomePage() {
    console.log("loading Home page...");

    // Load popular movies
    try {
        const popularMovies = await getPopularMovies(1);
        if (popularMovies && popularMovies.results) {
            state.movies = popularMovies.results;
            displayMovies(state.movies, "popular-movie-list");
            displayHeroCarousel(state.movies);
            initializeSwiper();
        } else {
            console.error("No popular movies found");
        }
    } catch (error) {
        console.error("Failed to load popular movies:", error);
        const popularContainer = document.getElementById("popular-movie-list");
        if (popularContainer) {
            popularContainer.innerHTML = `<p class="text-danger">Error loading popular movies. Please try again later.</p>`;
        }
    }

    // Load top rated movies
    try {
        const topRatedMovies = await getTopRatedMovies(1);
        if (topRatedMovies && topRatedMovies.results) {
            displayMovies(topRatedMovies.results, "top-rated-movie-list");
        } else {
            console.error("No top rated movies found");
        }
    } catch (error) {
        console.error("Failed to load top rated movies:", error);
        const topRatedContainer = document.getElementById("top-rated-movie-list");
        if (topRatedContainer) {
            topRatedContainer.innerHTML = `<p class="text-danger">Error loading top rated movies. Please try again later.</p>`;
        }
    }

    // Load upcoming movies
    try {
        const upcomingMovies = await getUpcomingMovies(1);
        if (upcomingMovies && upcomingMovies.results) {
            displayMovies(upcomingMovies.results, "upcoming-movie-list");
        } else {
            console.error("No upcoming movies found");
        }
    } catch (error) {
        console.error("Failed to load upcoming movies:", error);
        const upcomingContainer = document.getElementById("upcoming-movie-list");
        if (upcomingContainer) {
            upcomingContainer.innerHTML = `<p class="text-danger">Error loading upcoming movies. Please try again later.</p>`;
        }
    }

    // Wait for all content to be rendered before setting up scroll buttons
    await new Promise(resolve => setTimeout(resolve, 300));
    setUpMovieScrollButton();
} 

async function loadMovieDetailPage(movieId) {
    try {
        const movie = await getMovieDetail(movieId);
        state.currentMovie = movie;
        displayMovieDetail(movie);
    } catch (error) {
        console.error("Failed to load movie detail", error);
        const detailContainer = document.getElementById("movie-detail");
        if (detailContainer) detailContainer.innerHTML = `<p class="text-danger">Error loading movie details.</p>`;
    }
}

function setupNavigationScroll() {
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            
            if (targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    // Calculate offset to account for fixed header
                    const header = document.querySelector('.top-bar');
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {

    setupTopBarScroll();

    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    if(path.includes('detail.html') && params.has('id')) {
        loadMovieDetailPage(movieId);
    } else {
        loadHomePage();
        setupNavigationScroll();
    }
});