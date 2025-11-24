import {
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    getMovieDetail,
    searchMovies
} from './api.js';

import {
    displayMovies,
    displayHeroCarousel,
    setupTopBarScroll,
    initializeSwiper,
    setUpMovieScrollButton,
    displayMovieDetail,
    displaySearchResults
} from './ui.js'

const state = {
    movies: [],
    currentMovie: null,
    isSearchMode: false,
    searchQuery: ''
}

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
        // Wait for cast to render, then set up scroll buttons
        await new Promise(resolve => setTimeout(resolve, 300));
        setUpMovieScrollButton();
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

async function handleSearch(query) {
    const searchDropdown = document.getElementById('search-results-dropdown');
    const searchResultsList = document.getElementById('search-results-list');
    
    if (!query || query.trim() === '') {
        // Hide dropdown and show normal sections
        if (searchDropdown) searchDropdown.style.display = 'none';
        state.isSearchMode = false;
        state.searchQuery = '';
        showNormalSections();
        return;
    }

    state.isSearchMode = true;
    state.searchQuery = query.trim();

    // Show dropdown
    if (searchDropdown) {
        searchDropdown.style.display = 'block';
    }

    if (searchResultsList) {
        searchResultsList.innerHTML = '<div class="search-loading"><p>Searching...</p></div>';
    }

    try {
        const results = await searchMovies(state.searchQuery, 1);
        
        if (results && results.results && results.results.length > 0) {
            displaySearchResults(results.results, "search-results-list", true);
            
            // Set up "Show all results" link
            const showAllLink = document.getElementById('show-all-results-link');
            if (showAllLink) {
                showAllLink.onclick = (e) => {
                    e.preventDefault();
                    // Hide dropdown and show full search results page
                    if (searchDropdown) searchDropdown.style.display = 'none';
                    hideNormalSections();
                    showSearchSection();
                    displayMovies(results.results, "search-results-list");
                    const searchResultsTitle = document.getElementById('search-results-title');
                    if (searchResultsTitle) {
                        searchResultsTitle.textContent = `Search Results for "${state.searchQuery}"`;
                    }
                    setTimeout(() => {
                        setUpMovieScrollButton();
                    }, 300);
                };
            }
        } else {
            if (searchResultsList) {
                searchResultsList.innerHTML = '<div class="search-no-results"><p>No movies found</p></div>';
            }
            const footer = document.getElementById("search-results-footer");
            if (footer) footer.style.display = "none";
        }
    } catch (error) {
        console.error("Failed to search movies:", error);
        if (searchResultsList) {
            searchResultsList.innerHTML = '<div class="search-error"><p>Error searching movies</p></div>';
        }
    }
}

function showNormalSections() {
    const sections = [
        document.querySelector('.hero-carousel'),
        document.getElementById('popular-section'),
        document.getElementById('top-rated-section'),
        document.getElementById('upcoming-section')
    ];
    
    sections.forEach(section => {
        if (section) section.style.display = '';
    });

    const searchSection = document.getElementById('search-results-section');
    if (searchSection) searchSection.style.display = 'none';
    
    const searchDropdown = document.getElementById('search-results-dropdown');
    if (searchDropdown) searchDropdown.style.display = 'none';
}

function hideNormalSections() {
    const sections = [
        document.querySelector('.hero-carousel'),
        document.getElementById('popular-section'),
        document.getElementById('top-rated-section'),
        document.getElementById('upcoming-section')
    ];
    
    sections.forEach(section => {
        if (section) section.style.display = 'none';
    });
}

function showSearchSection() {
    const searchSection = document.getElementById('search-results-section');
    if (searchSection) {
        searchSection.style.display = '';
        // Scroll to search results, accounting for fixed header
        setTimeout(() => {
            const header = document.querySelector('.top-bar');
            const headerHeight = header ? header.offsetHeight : 80;
            const targetPosition = searchSection.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }, 100);
    }
}

function setupSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchDropdown = document.getElementById('search-results-dropdown');

    if (!searchForm || !searchInput) return;

    // Handle form submission
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            // Show full search results page
            const dropdown = document.getElementById('search-results-dropdown');
            if (dropdown) dropdown.style.display = 'none';
            hideNormalSections();
            showSearchSection();
            handleFullSearch(query);
        }
    });

    // Handle input changes (debounced search for dropdown)
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query === '') {
            // Hide dropdown if input is empty
            if (searchDropdown) searchDropdown.style.display = 'none';
            state.isSearchMode = false;
            state.searchQuery = '';
            showNormalSections();
            return;
        }

        // Debounce search - wait 300ms after user stops typing
        searchTimeout = setTimeout(() => {
            handleSearch(query);
        }, 300);
    });

    // Handle escape key to clear search
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            if (searchDropdown) searchDropdown.style.display = 'none';
            state.isSearchMode = false;
            state.searchQuery = '';
            showNormalSections();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const searchWrapper = document.querySelector('.search-wrapper');
        if (searchWrapper && !searchWrapper.contains(e.target)) {
            if (searchDropdown) searchDropdown.style.display = 'none';
        }
    });
}

async function handleFullSearch(query) {
    const searchResultsTitle = document.getElementById('search-results-title');
    const searchResultsList = document.getElementById('search-results-list');
    
    if (searchResultsTitle) {
        searchResultsTitle.textContent = `Search Results for "${query}"`;
    }

    if (searchResultsList) {
        searchResultsList.innerHTML = '<p class="text-center py-5">Searching...</p>';
    }

    try {
        const results = await searchMovies(query, 1);
        
        if (results && results.results && results.results.length > 0) {
            displayMovies(results.results, "search-results-list");
            await new Promise(resolve => setTimeout(resolve, 300));
            setUpMovieScrollButton();
        } else {
            if (searchResultsList) {
                searchResultsList.innerHTML = `<p class="text-center py-5 text-muted">No movies found for "${query}"</p>`;
            }
        }
    } catch (error) {
        console.error("Failed to search movies:", error);
        if (searchResultsList) {
            searchResultsList.innerHTML = `<p class="text-center py-5 text-danger">Error searching movies. Please try again later.</p>`;
        }
    }
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
        setupSearch();
    }
});