import {
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    getMovieDetail,
    searchMovies,
    createRequestToken,
    createSession,
    getAccountDetails,
    markAsFavorite
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
    topRatedMovies: [],
    upcomingMovies: [],
    currentMovie: null,
    isSearchMode: false,
    searchQuery: '',
    auth: {
        sessionId: null,
        accountId: null,
        isAuthenticated: false,
    },
    favorites: new Set(),
}

const AUTH_STORAGE_KEY = 'zmovie_auth';
const FAVORITES_STORAGE_KEY = 'zmovie_favorites';

function loadAuthFromStorage() {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.sessionId && parsed.accountId) {
            state.auth.sessionId = parsed.sessionId;
            state.auth.accountId = parsed.accountId;
            state.auth.isAuthenticated = true;
        }
    } catch (e) {
        console.error('Failed to load auth from storage', e);
    }
}

function saveAuthToStorage() {
    try {
        const data = {
            sessionId: state.auth.sessionId,
            accountId: state.auth.accountId,
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save auth to storage', e);
    }
}

function clearAuthStorage() {
    try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
        console.error('Failed to clear auth from storage', e);
    }
}

function loadFavoritesFromStorage() {
    try {
        const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            state.favorites = new Set(parsed);
        }
    } catch (e) {
        console.error('Failed to load favorites from storage', e);
    }
}

function saveFavoritesToStorage() {
    try {
        const arr = Array.from(state.favorites);
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
        console.error('Failed to save favorites to storage', e);
    }
}

function updateAuthUI() {
    const loginBtn = document.getElementById('login-button');
    const logoutBtn = document.getElementById('logout-button');

    if (!loginBtn || !logoutBtn) return;

    if (state.auth.isAuthenticated) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-flex';
    } else {
        loginBtn.style.display = 'inline-flex';
        logoutBtn.style.display = 'none';
    }
}

async function handleAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const requestToken = params.get('request_token');
    const approved = params.get('approved');

    if (!requestToken || approved !== 'true') {
        return;
    }

    try {
        const sessionData = await createSession(requestToken);
        const sessionId = sessionData.session_id;
        const account = await getAccountDetails(sessionId);

        state.auth.sessionId = sessionId;
        state.auth.accountId = account.id;
        state.auth.isAuthenticated = true;
        saveAuthToStorage();

        // Clean up URL
        params.delete('request_token');
        params.delete('approved');
        const newQuery = params.toString();
        const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '');
        window.history.replaceState({}, '', newUrl);
    } catch (error) {
        console.error('Error handling auth callback:', error);
    }
}

async function handleLogin() {
    try {
        const data = await createRequestToken();
        const requestToken = data.request_token;
        const redirectTo = encodeURIComponent(window.location.href);
        const authUrl = `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=${redirectTo}`;
        window.location.href = authUrl;
    } catch (error) {
        console.error('Login failed:', error);
        alert('Could not start TMDB login. Please try again.');
    }
}

function handleLogout() {
    state.auth.sessionId = null;
    state.auth.accountId = null;
    state.auth.isAuthenticated = false;
    state.favorites.clear();
    clearAuthStorage();
    saveFavoritesToStorage();
    updateAuthUI();
    // Reload to clear favorite UI state
    window.location.reload();
}

function setupAuth() {
    loadAuthFromStorage();
    loadFavoritesFromStorage();
    updateAuthUI();

    const loginBtn = document.getElementById('login-button');
    const logoutBtn = document.getElementById('logout-button');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

function updateFavoriteButtonsForMovie(movieId, isFavorite) {
    const selector = `[data-favorite-btn="true"][data-movie-id="${movieId}"]`;
    const buttons = document.querySelectorAll(selector);

    buttons.forEach((btn) => {
        if (isFavorite) {
            btn.classList.add('active');
            btn.textContent = '♥';
            btn.setAttribute('aria-label', 'Remove from favorites');
        } else {
            btn.classList.remove('active');
            btn.textContent = '♡';
            btn.setAttribute('aria-label', 'Add to favorites');
        }
    });
}

function setupFavoriteHandlers() {
    document.body.addEventListener('click', async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        const button = target.closest('[data-favorite-btn="true"]');
        if (!button) return;

        const movieIdStr = button.getAttribute('data-movie-id');
        if (!movieIdStr) return;
        const movieId = Number(movieIdStr);
        if (!Number.isFinite(movieId)) return;

        if (!state.auth.isAuthenticated) {
            alert('Please login with your TMDB account to use favorites.');
            return;
        }

        const currentlyFavorite = state.favorites.has(movieId);
        const newFavoriteValue = !currentlyFavorite;

        try {
            await markAsFavorite(
                state.auth.accountId,
                state.auth.sessionId,
                movieId,
                newFavoriteValue
            );

            if (newFavoriteValue) {
                state.favorites.add(movieId);
            } else {
                state.favorites.delete(movieId);
            }

            saveFavoritesToStorage();
            updateFavoriteButtonsForMovie(movieId, newFavoriteValue);
        } catch (error) {
            console.error('Failed to update favorite:', error);
            alert('Could not update favorite on TMDB. Please try again.');
        }
    });
}

async function loadHomePage() {
    console.log("loading Home page...");

    // Load popular movies
    try {
        const popularMovies = await getPopularMovies(1);
        if (popularMovies && popularMovies.results) {
            state.movies = popularMovies.results;
            displayMovies(state.movies, "popular-movie-list", {
                favorites: state.favorites,
                isAuthenticated: state.auth.isAuthenticated,
            });
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
            state.topRatedMovies = topRatedMovies.results;
            displayMovies(state.topRatedMovies, "top-rated-movie-list", {
                favorites: state.favorites,
                isAuthenticated: state.auth.isAuthenticated,
            });
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
            state.upcomingMovies = upcomingMovies.results;
            displayMovies(state.upcomingMovies, "upcoming-movie-list", {
                favorites: state.favorites,
                isAuthenticated: state.auth.isAuthenticated,
            });
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

document.addEventListener("DOMContentLoaded", async () => {
    setupTopBarScroll();

    await handleAuthCallback();
    setupAuth();
    setupFavoriteHandlers();

    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    if (path.includes('detail.html') && params.has('id')) {
        loadMovieDetailPage(movieId);
    } else {
        loadHomePage();
        setupNavigationScroll();
        setupSearch();
    }
});