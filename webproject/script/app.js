import {
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    getMovieDetail,
    searchMovies,
    createRequestToken,
    createSession,
    getAccountDetails,
    markAsFavorite,
    getFavorites
} from './api.js';

import {
    displayMovies,
    displayMoviesGrid,
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
        username: null,
        avatarUrl: null,
    },
    favoriteMovies: [],
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
            state.auth.username = parsed.username || null;
            state.auth.avatarUrl = parsed.avatarUrl || null;
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
            username: state.auth.username,
            avatarUrl: state.auth.avatarUrl,
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
    const accountArea = document.getElementById('account-area');
    if (!accountArea) return;

    if (state.auth.isAuthenticated) {
        const username = state.auth.username || 'User';
        const avatarUrl = state.auth.avatarUrl || '';
        const fallbackInitial = username.charAt(0).toUpperCase() || 'U';

        accountArea.innerHTML = `
            <div class="profile-dropdown-wrapper">
                <button class="profile-chip" id="profile-dropdown-trigger" aria-expanded="false">
                    ${avatarUrl
                        ? `<img src="${avatarUrl}" alt="${username}" class="profile-avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />`
                        : ''
                    }
                    <div class="profile-avatar-fallback"${avatarUrl ? ' style="display:none;"' : ''}>
                        <span>${fallbackInitial}</span>
                    </div>
                    <span class="profile-name">${username}</span>
                    <i class="fa-solid fa-chevron-down profile-dropdown-arrow"></i>
                </button>
                <div class="profile-dropdown-menu" id="profile-dropdown-menu">
                    <a href="favorites.html" class="profile-dropdown-item">
                        <i class="fa-solid fa-heart"></i>
                        <span>Favorite Movies</span>
                    </a>
                    <button class="profile-dropdown-item profile-dropdown-logout" id="header-logout-button">
                        <i class="fa-solid fa-sign-out-alt"></i>
                        <span>Log out</span>
                    </button>
                </div>
            </div>
        `;

        setupProfileDropdown();
    } else {
        // Show default profile icon
        accountArea.innerHTML = `
            <div class="profile-dropdown-wrapper">
                <button class="profile-chip profile-chip-default" id="default-profile-button" aria-expanded="false">
                    <div class="profile-avatar-fallback">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <i class="fa-solid fa-chevron-down profile-dropdown-arrow"></i>
                </button>
                <div class="profile-dropdown-menu" id="default-dropdown-menu">
                    <button class="profile-dropdown-item" id="join-zmovie-button">
                        <i class="fa-solid fa-user-plus"></i>
                        <span>Join Z-Movie</span>
                    </button>
                </div>
            </div>
        `;

        setupDefaultProfileDropdown();
    }
}

function setupProfileDropdown() {
    const trigger = document.getElementById('profile-dropdown-trigger');
    const menu = document.getElementById('profile-dropdown-menu');
    const logoutBtn = document.getElementById('header-logout-button');

    if (!trigger || !menu) return;

    let isOpen = false;

    const toggleDropdown = (e) => {
        e.stopPropagation();
        isOpen = !isOpen;
        menu.style.display = isOpen ? 'block' : 'none';
        trigger.setAttribute('aria-expanded', isOpen);
        trigger.classList.toggle('active', isOpen);
    };

    trigger.addEventListener('click', toggleDropdown);
    
    // Also show on hover
    trigger.addEventListener('mouseenter', () => {
        if (!isOpen) {
            isOpen = true;
            menu.style.display = 'block';
            trigger.setAttribute('aria-expanded', 'true');
            trigger.classList.add('active');
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !menu.contains(e.target)) {
            isOpen = false;
            menu.style.display = 'none';
            trigger.setAttribute('aria-expanded', 'false');
            trigger.classList.remove('active');
        }
    });

    // Logout handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

function setupDefaultProfileDropdown() {
    const trigger = document.getElementById('default-profile-button');
    const menu = document.getElementById('default-dropdown-menu');
    const joinBtn = document.getElementById('join-zmovie-button');

    if (!trigger || !menu) return;

    let isOpen = false;

    const toggleDropdown = (e) => {
        e.stopPropagation();
        isOpen = !isOpen;
        menu.style.display = isOpen ? 'block' : 'none';
        trigger.setAttribute('aria-expanded', isOpen);
        trigger.classList.toggle('active', isOpen);
    };

    trigger.addEventListener('click', toggleDropdown);
    
    // Also show on hover
    trigger.addEventListener('mouseenter', () => {
        if (!isOpen) {
            isOpen = true;
            menu.style.display = 'block';
            trigger.setAttribute('aria-expanded', 'true');
            trigger.classList.add('active');
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !menu.contains(e.target)) {
            isOpen = false;
            menu.style.display = 'none';
            trigger.setAttribute('aria-expanded', 'false');
            trigger.classList.remove('active');
        }
    });

    // Join button handler
    if (joinBtn) {
        joinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }
}

async function handleAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const requestToken = params.get('request_token');
    const approved = params.get('approved');
    const denied = params.get('denied');

    // Log for debugging
    console.log('Auth callback - requestToken:', requestToken, 'approved:', approved, 'denied:', denied);

    // Check if user denied access
    if (denied === 'true' || denied === true) {
        console.log('User denied authentication');
        alert('Authentication was cancelled. Please try again if you want to log in.');
        // Clean up URL
        params.delete('request_token');
        params.delete('approved');
        params.delete('denied');
        const newQuery = params.toString();
        const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '');
        window.history.replaceState({}, '', newUrl);
        return;
    }

    // Check if we have a request token and approval
    if (!requestToken) {
        console.log('No request token found in URL');
        return;
    }

    // More flexible approved check (handle both string 'true' and boolean true)
    const isApproved = approved === 'true' || approved === true || approved === '1';
    if (!isApproved) {
        console.log('Authentication not approved. approved value:', approved);
        return;
    }

    console.log('Processing authentication callback...');

    try {
        console.log('Creating session with request token...');
        const sessionData = await createSession(requestToken);
        
        if (!sessionData || !sessionData.session_id) {
            throw new Error('Failed to create session: No session ID returned');
        }
        
        const sessionId = sessionData.session_id;
        console.log('Session created successfully. Session ID:', sessionId);

        console.log('Fetching account details...');
        const account = await getAccountDetails(sessionId);
        
        if (!account || !account.id) {
            throw new Error('Failed to get account details: No account ID returned');
        }
        
        console.log('Account details fetched. Account ID:', account.id, 'Username:', account.username || account.name);

        state.auth.sessionId = sessionId;
        state.auth.accountId = account.id;
        state.auth.username = account.username || account.name || null;
        
        // Build avatar URL if available
        let avatarUrl = null;
        if (account.avatar) {
            if (account.avatar.tmdb && account.avatar.tmdb.avatar_path) {
                avatarUrl = `https://image.tmdb.org/t/p/w45${account.avatar.tmdb.avatar_path}`;
            } else if (account.avatar.gravatar && account.avatar.gravatar.hash) {
                avatarUrl = `https://www.gravatar.com/avatar/${account.avatar.gravatar.hash}`;
            }
        }
        state.auth.avatarUrl = avatarUrl;
        state.auth.isAuthenticated = true;
        
        console.log('Saving authentication to storage...');
        saveAuthToStorage();
        console.log('Authentication saved successfully');

        // Load favorites from TMDB
        console.log('Loading favorites from TMDB...');
        await loadFavoritesFromTMDB();
        
        // Update UI
        console.log('Updating UI...');
        updateAuthUI();
        console.log('Authentication complete! User logged in as:', state.auth.username);

        // Clean up URL
        params.delete('request_token');
        params.delete('approved');
        params.delete('denied');
        const newQuery = params.toString();
        const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '');
        window.history.replaceState({}, '', newUrl);
        
        // Show success message
        console.log('Login successful!');
    } catch (error) {
        console.error('Error handling auth callback:', error);
        alert('Failed to complete login. Error: ' + (error.message || 'Unknown error') + '\n\nPlease try logging in again.');
        
        // Clean up URL even on error
        params.delete('request_token');
        params.delete('approved');
        params.delete('denied');
        const newQuery = params.toString();
        const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '');
        window.history.replaceState({}, '', newUrl);
    }
}

async function handleLogin() {
    try {
        console.log('Starting login process...');
        const data = await createRequestToken();
        
        if (!data || !data.request_token) {
            throw new Error('Failed to get request token from TMDB');
        }
        
        const requestToken = data.request_token;
        console.log('Request token obtained:', requestToken);
        
        // Use clean redirect URL (just the origin + pathname, no query params)
        // This ensures TMDB redirects back cleanly
        const currentUrl = window.location.origin + window.location.pathname;
        const redirectTo = encodeURIComponent(currentUrl);
        console.log('Redirect URL:', currentUrl);
        
        const authUrl = `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=${redirectTo}`;
        console.log('Redirecting to TMDB authentication:', authUrl);
        
        window.location.href = authUrl;
    } catch (error) {
        console.error('Login failed:', error);
        alert('Could not start TMDB login. Error: ' + (error.message || 'Unknown error') + '\n\nPlease try again.');
    }
}

function handleLogout() {
    state.auth.sessionId = null;
    state.auth.accountId = null;
    state.auth.username = null;
    state.auth.avatarUrl = null;
    state.auth.isAuthenticated = false;
    state.favorites.clear();
    state.favoriteMovies = [];
    clearAuthStorage();
    saveFavoritesToStorage();
    updateAuthUI();
    // Redirect to home screen
    window.location.href = 'index.html';
}

async function setupAuth() {
    loadAuthFromStorage();
    loadFavoritesFromStorage();
    
    // If authenticated, try to refresh favorites from TMDB
    if (state.auth.isAuthenticated) {
        await loadFavoritesFromTMDB();
    }
    
    updateAuthUI();
}

async function loadFavoritesFromTMDB() {
    if (!state.auth.isAuthenticated || !state.auth.sessionId || !state.auth.accountId) {
        return;
    }

    try {
        // Load all pages of favorites
        let page = 1;
        let allFavorites = [];
        let hasMore = true;

        while (hasMore) {
            const data = await getFavorites(state.auth.accountId, state.auth.sessionId, page);
            if (data && data.results && Array.isArray(data.results)) {
                allFavorites = allFavorites.concat(data.results);
                hasMore = page < data.total_pages;
                page++;
            } else {
                hasMore = false;
            }
        }

        // Update state with favorite movie IDs and full movie objects
        state.favorites.clear();
        state.favoriteMovies = allFavorites;
        allFavorites.forEach(movie => {
            if (movie && movie.id) {
                state.favorites.add(movie.id);
            }
        });

        saveFavoritesToStorage();
        console.log(`Loaded ${state.favorites.size} favorites from TMDB`);
    } catch (error) {
        console.error('Error loading favorites from TMDB:', error);
        // Don't throw - just use localStorage favorites as fallback
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
        displayMovieDetail(movie, {
            favorites: state.favorites,
            isAuthenticated: state.auth.isAuthenticated,
        });
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

async function loadFavoritesPage() {
    const favoriteListId = 'favorite-movie-list';
    const favoriteContainer = document.getElementById(favoriteListId);

    if (!favoriteContainer) return;

    if (!state.auth.isAuthenticated) {
        favoriteContainer.innerHTML = '<p class="text-center text-muted px-3">Please log in to view your favorite movies.</p>';
        return;
    }

    try {
        // Load favorites from TMDB if not already loaded
        if (state.favoriteMovies.length === 0) {
            await loadFavoritesFromTMDB();
        }

        if (state.favoriteMovies && state.favoriteMovies.length > 0) {
            displayMovies(state.favoriteMovies, favoriteListId, {
                favorites: state.favorites,
                isAuthenticated: state.auth.isAuthenticated,
            });
            setTimeout(() => {
                setUpMovieScrollButton();
            }, 300);
        } else {
            favoriteContainer.innerHTML = '<p class="text-center text-muted px-3">No favorite movies yet. Add some from the home page!</p>';
        }
    } catch (error) {
        console.error('Error loading favorites page:', error);
        favoriteContainer.innerHTML = '<p class="text-center text-danger px-3">Error loading favorite movies. Please try again later.</p>';
    }
}

async function loadMoviesPage() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') || 'popular';
    const page = parseInt(params.get('page')) || 1;

    const titleEl = document.getElementById('movies-page-title');
    const moviesGrid = document.getElementById('movies-grid');
    const paginationEl = document.getElementById('pagination');

    if (!moviesGrid) return;

    // Set title based on type
    const titles = {
        'popular': 'Popular Movies',
        'top-rated': 'Top-rated Movies',
        'upcoming': 'Upcoming Movies'
    };
    if (titleEl) {
        titleEl.textContent = titles[type] || 'Movies';
    }

    moviesGrid.innerHTML = `
        <div class="col-12">
            <div class="loading-state">
                <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Loading movies...</p>
            </div>
        </div>
    `;
    if (paginationEl) paginationEl.innerHTML = '';

    try {
        let data;
        switch (type) {
            case 'popular':
                data = await getPopularMovies(page);
                break;
            case 'top-rated':
                data = await getTopRatedMovies(page);
                break;
            case 'upcoming':
                data = await getUpcomingMovies(page);
                break;
            default:
                data = await getPopularMovies(page);
        }

        if (data && data.results && data.results.length > 0) {
            displayMoviesGrid(data.results, 'movies-grid', {
                favorites: state.favorites,
                isAuthenticated: state.auth.isAuthenticated,
            });

            // Render pagination - use total_pages from API response, max 500
            const totalPages = Math.min(500, data.total_pages || 1);
            if (paginationEl && totalPages > 1) {
                renderPagination(paginationEl, page, totalPages, type);
            } else if (paginationEl) {
                paginationEl.innerHTML = '';
            }
        } else {
            moviesGrid.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="fa-solid fa-film" style="font-size: 4rem; color: var(--color-text-secondary); margin-bottom: 1rem;"></i>
                        <p class="text-muted">No movies found.</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading movies page:', error);
        moviesGrid.innerHTML = `
            <div class="col-12">
                <div class="error-state">
                    <i class="fa-solid fa-exclamation-triangle" style="font-size: 4rem; color: #dc3545; margin-bottom: 1rem;"></i>
                    <p class="text-danger">Error loading movies. Please try again later.</p>
                </div>
            </div>
        `;
    }
}

function renderPagination(container, currentPage, totalPages, type) {
    container.innerHTML = '';

    // Ensure totalPages is a valid number, max 500
    totalPages = Math.min(500, Math.max(1, parseInt(totalPages) || 1));
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="movies.html?type=${type}&page=${currentPage - 1}" ${currentPage === 1 ? 'tabindex="-1" aria-disabled="true"' : ''}>
            <i class="fa-solid fa-chevron-left"></i>
        </a>
    `;
    container.appendChild(prevLi);

    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        const firstLi = document.createElement('li');
        firstLi.className = 'page-item';
        firstLi.innerHTML = `<a class="page-link" href="movies.html?type=${type}&page=1">1</a>`;
        container.appendChild(firstLi);

        if (startPage > 2) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            ellipsisLi.innerHTML = '<span class="page-link">...</span>';
            container.appendChild(ellipsisLi);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="movies.html?type=${type}&page=${i}">${i}</a>`;
        container.appendChild(li);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            ellipsisLi.innerHTML = '<span class="page-link">...</span>';
            container.appendChild(ellipsisLi);
        }

        const lastLi = document.createElement('li');
        lastLi.className = 'page-item';
        lastLi.innerHTML = `<a class="page-link" href="movies.html?type=${type}&page=${totalPages}">${totalPages}</a>`;
        container.appendChild(lastLi);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="movies.html?type=${type}&page=${currentPage + 1}" ${currentPage === totalPages ? 'tabindex="-1" aria-disabled="true"' : ''}>
            <i class="fa-solid fa-chevron-right"></i>
        </a>
    `;
    container.appendChild(nextLi);
}

document.addEventListener("DOMContentLoaded", async () => {
    setupTopBarScroll();

    // Handle authentication callback first (if returning from TMDB)
    const wasAuthenticated = state.auth.isAuthenticated;
    await handleAuthCallback();
    const justAuthenticated = state.auth.isAuthenticated && !wasAuthenticated;
    
    // Setup auth (loads from storage if not just authenticated)
    // If we just authenticated, handleAuthCallback already saved to storage
    await setupAuth();
    
    // If we just authenticated, ensure UI is updated
    if (justAuthenticated) {
        console.log('Just authenticated, ensuring UI is updated...');
        updateAuthUI();
    }
    
    setupFavoriteHandlers();

    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    if (path.includes('detail.html') && params.has('id')) {
        loadMovieDetailPage(movieId);
    } else if (path.includes('favorites.html')) {
        loadFavoritesPage();
    } else if (path.includes('movies.html')) {
        loadMoviesPage();
    } else {
        loadHomePage();
        setupNavigationScroll();
        setupSearch();
    }
});