# Z Movie - Final Project Report

**Course:** Web Programming  
**Semester:** [Your Semester]  
**Date:** [Current Date]  
**Student:** [Your Name]

---

## Table of Contents
1. [Introduction](#introduction)
2. [Content](#content)
   - [Planning/Design](#planningdesign)
   - [Screen Captures](#screen-captures)
   - [Menu/Operation Description](#menuoperation-description)
   - [Code Explanation](#code-explanation)
3. [Conclusion](#conclusion)
   - [Future Improvements](#future-improvements)

---

## Introduction

### Goal/Motivation

The **Z Movie** project is a modern, responsive web application designed to provide users with a comprehensive movie browsing and discovery experience. The primary goal of this project is to create a user-friendly platform that integrates with The Movie Database (TMDB) API to deliver real-time movie information, user authentication, and personalized favorite movie management.

**Key Motivations:**
- **Learning Objective**: To demonstrate proficiency in modern web development technologies including HTML5, CSS3, JavaScript (ES6+), and RESTful API integration
- **User Experience**: To create an intuitive and visually appealing interface that makes movie discovery enjoyable and efficient
- **Technical Challenge**: To implement a complete authentication system using TMDB's OAuth-like flow and manage user-specific data (favorites) across sessions
- **Real-World Application**: To build a production-ready application that follows best practices in code organization, error handling, and responsive design

**Project Scope:**
The application provides users with the ability to:
- Browse popular, top-rated, and upcoming movies
- Search for movies by title
- View detailed movie information including cast and crew
- Authenticate using TMDB accounts
- Save and manage favorite movies
- Navigate through paginated movie lists
- Experience a responsive design that works across different devices

---

## Content

### Planning/Design

#### Architecture Overview

The project follows a **modular architecture** with clear separation of concerns:

```
Z Movie Project Structure
├── index.html          # Home page with movie sections
├── detail.html         # Movie detail page
├── favorites.html      # User's favorite movies page
├── movies.html         # Paginated movie list page
├── script/
│   ├── api.js         # All TMDB API calls (data layer)
│   ├── app.js         # Application logic & state management
│   └── ui.js          # UI rendering functions (presentation layer)
└── style/
    └── style.css      # All styling and responsive design
```

#### Design Principles

1. **Separation of Concerns**
   - **api.js**: Handles all external API communication
   - **app.js**: Manages application state, routing, and business logic
   - **ui.js**: Responsible for rendering UI components

2. **State Management**
   - Global `state` object maintains application data
   - `localStorage` for persistent authentication and favorites
   - Synchronization between local storage and TMDB API

3. **User Experience Design**
   - **Hero Carousel**: Showcases featured movies with auto-play
   - **Horizontal Scrolling**: Movie lists with smooth scroll buttons
   - **Responsive Grid**: Adapts to different screen sizes
   - **Search Functionality**: Real-time search with dropdown results
   - **Profile Management**: Dropdown menu for user actions

#### Technology Stack

- **Frontend Framework**: Vanilla JavaScript (ES6+ modules)
- **Styling**: Custom CSS with Bootstrap 5.3.2 for grid system
- **Icons**: Font Awesome 6.5.1
- **Carousel**: Swiper.js 11
- **API**: The Movie Database (TMDB) REST API
- **Storage**: Browser localStorage
- **Fonts**: Google Fonts (Inter)

#### Data Flow

```
User Action → app.js (Event Handler) → api.js (API Call) → TMDB API
                                                              ↓
User Interface ← ui.js (Render) ← app.js (Update State) ← API Response
```

---

### Screen Captures

*Note: Screenshots should be added here. Below are descriptions of key screens:*

#### 1. Home Page (index.html)
- **Hero Carousel**: Large backdrop images of popular movies with fade transitions
- **Navigation Bar**: Fixed header with logo, search bar, and profile area
- **Movie Sections**: Three horizontal scrolling sections:
  - Popular Movies
  - Top-rated Movies
  - Upcoming Movies
- **View All Buttons**: Links to paginated movie list pages
- **Search Dropdown**: Real-time search results appear below search bar

#### 2. Movie Detail Page (detail.html)
- **Backdrop Image**: Full-width movie backdrop with overlay
- **Movie Information**: Title, rating, release date, genres, overview
- **Favorite Button**: Heart icon button (only visible when logged in)
- **Cast Section**: Horizontal scrolling list of top-billed cast members
- **Responsive Layout**: Adapts to mobile and desktop views

#### 3. Movies List Page (movies.html)
- **Page Title**: Dynamic title based on movie type (Popular/Top-rated/Upcoming)
- **Grid Layout**: Responsive grid showing movie posters
- **Pagination**: Page numbers with navigation (max 500 pages)
- **Loading States**: Loading indicators while fetching data

#### 4. Favorites Page (favorites.html)
- **Page Title**: "Your Favorite Movies"
- **Movie Grid**: Horizontal scrolling list of favorited movies
- **Empty State**: Message when no favorites are saved

#### 5. Authentication States
- **Logged Out**: Default profile icon with "Join Z-Movie" dropdown
- **Logged In**: Profile picture/avatar with username and dropdown menu:
  - Favorite Movies (link)
  - Log out (red button)

---

### Menu/Operation Description

#### Navigation Structure

**Main Navigation (Header)**
- **Logo**: "Z Movie" - links to home page
- **Nav Links**: Popular, Top-rated, Upcoming (scroll to sections)
- **Search Bar**: Real-time movie search with dropdown results
- **Account Area**: Dynamic based on authentication status

#### User Operations

##### 1. Browsing Movies
- **Home Page Sections**: Scroll horizontally through movie cards
- **Scroll Buttons**: Left/right arrows to navigate movie lists
- **View All**: Click "View All →" to see complete paginated list
- **Movie Card Click**: Navigate to movie detail page

##### 2. Searching Movies
- **Search Input**: Type movie title in search bar
- **Dropdown Results**: Shows up to 5 results with "Show all results" link
- **Search Results Page**: Full list of matching movies

##### 3. Viewing Movie Details
- **Access**: Click any movie card or search result
- **Information Displayed**:
  - Movie poster and backdrop
  - Title, rating (1 decimal place), release date
  - Genres, runtime, overview
  - Top-billed cast with photos
- **Favorite Button**: Toggle favorite status (requires login)

##### 4. Authentication
- **Login Process**:
  1. Click default profile icon (when logged out)
  2. Select "Join Z-Movie" from dropdown
  3. Redirected to TMDB authentication page
  4. Approve access
  5. Redirected back to application
  6. Session saved in localStorage

- **Profile Menu** (When Logged In):
  - **Favorite Movies**: Navigate to favorites page
  - **Log out**: Clear session and redirect to home

##### 5. Managing Favorites
- **Add Favorite**: Click heart button on movie detail page
- **Remove Favorite**: Click heart button again (toggles state)
- **View Favorites**: Access via profile dropdown → "Favorite Movies"
- **Synchronization**: Favorites sync with TMDB account

##### 6. Pagination
- **Navigation**: Click page numbers or next/previous buttons
- **URL Parameters**: `?type=popular&page=2`
- **Maximum Pages**: Limited to 500 pages
- **Page Types**: popular, top-rated, upcoming

#### Responsive Behavior

- **Mobile**: Single column layout, stacked navigation
- **Tablet**: 2-3 columns for movie grid
- **Desktop**: 4-6 columns for movie grid, full navigation bar

---

### Code Explanation

#### 1. API Layer (`script/api.js`)

**Purpose**: Centralized API communication with TMDB

**Key Functions**:

```javascript
// Movie Data Fetching
getPopularMovies(page)      // Fetches popular movies with pagination
getTopRatedMovies(page)     // Fetches top-rated movies
getUpcomingMovies(page)     // Fetches upcoming movies
getMovieDetail(id)          // Fetches detailed movie info with credits
searchMovies(query, page)   // Searches movies by title

// Authentication
createRequestToken()        // Initiates authentication flow
createSession(requestToken) // Exchanges token for session ID
getAccountDetails(sessionId) // Retrieves user account information

// Favorites Management
markAsFavorite(accountId, sessionId, movieId, favorite) // Toggles favorite
getFavorites(accountId, sessionId, page)                // Retrieves user favorites
```

**Error Handling**: All functions include try-catch blocks and return `null` or throw errors appropriately.

**API Configuration**:
- Base URL: `https://api.themoviedb.org/3`
- API Key: Stored in `api.js` (should be moved to environment variables in production)
- Image Base URL: `https://image.tmdb.org/t/p/`

#### 2. Application Logic (`script/app.js`)

**Purpose**: Manages application state, routing, and business logic

**State Object**:
```javascript
const state = {
    movies: [],              // Popular movies
    topRatedMovies: [],      // Top-rated movies
    upcomingMovies: [],      // Upcoming movies
    currentMovie: null,      // Currently viewed movie
    isSearchMode: false,     // Search state flag
    searchQuery: '',         // Current search query
    auth: {                  // Authentication state
        sessionId: null,
        accountId: null,
        isAuthenticated: false,
        username: null,
        avatarUrl: null,
    },
    favoriteMovies: [],      // Array of favorite movie objects
    favorites: new Set(),    // Set of favorite movie IDs
}
```

**Key Functions**:

**Authentication Flow**:
```javascript
handleAuthCallback()        // Processes TMDB redirect after login
handleLogin()              // Initiates login by redirecting to TMDB
handleLogout()             // Clears session and redirects to home
loadAuthFromStorage()      // Restores session from localStorage
saveAuthToStorage()        // Persists session to localStorage
```

**Favorites Management**:
```javascript
loadFavoritesFromTMDB()    // Fetches all favorites from TMDB
toggleFavorite(movieId)    // Adds/removes favorite via API
loadFavoritesFromStorage() // Loads favorites from localStorage
saveFavoritesToStorage()   // Saves favorites to localStorage
```

**Page Loading**:
```javascript
loadHomePage()             // Loads hero carousel and movie sections
loadMovieDetailPage(id)    // Loads movie detail and cast
loadMoviesPage()           // Loads paginated movie list
loadFavoritesPage()        // Loads user's favorite movies
```

**Pagination**:
```javascript
renderPagination(container, currentPage, totalPages, type)
// Generates pagination controls with:
// - First/Last page buttons
// - Previous/Next buttons
// - Page number range (max 500 pages)
// - Active state styling
```

**UI Updates**:
```javascript
updateAuthUI()             // Dynamically renders profile area
setupProfileDropdown()     // Manages dropdown menu behavior
```

**Event Listeners**:
- Search form submission
- Search input debouncing
- Scroll events for header hide/show
- Click events for navigation
- Window load and DOM ready events

#### 3. UI Rendering (`script/ui.js`)

**Purpose**: Handles all DOM manipulation and visual rendering

**Key Functions**:

**Movie Display**:
```javascript
displayMovies(movies, targetId, options)
// Renders horizontal scrolling movie list
// Options: { favorites, isAuthenticated }
// Features: Placeholder images, rating formatting (1 decimal)

displayMoviesGrid(movies, targetId, options)
// Renders responsive grid layout for movies.html
// Responsive columns: col-6 col-md-4 col-lg-3 col-xl-2

displayMovieDetail(movie, options)
// Renders complete movie detail page
// Includes: backdrop, poster, info, favorite button, cast
```

**Hero Carousel**:
```javascript
displayHeroCarousel(movies)
// Creates Swiper carousel with:
// - Fade transitions
// - Auto-play (3s delay)
// - Navigation arrows
// - Pagination dots
// - Placeholder images for missing backdrops
```

**Search Results**:
```javascript
displaySearchResults(movies, targetId, showAllLink)
// Renders search dropdown with:
// - Up to 5 results
// - "Show all results" link
// - Placeholder images
```

**UI Utilities**:
```javascript
setupTopBarScroll()        // Hides/shows header on scroll
setUpMovieScrollButton()   // Horizontal scroll buttons for movie lists
initializeSwiper()         // Initializes Swiper carousel
```

**Image Placeholder Logic**:
All image rendering functions check for image paths and use placeholders:
```javascript
const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";
// Plus onerror fallback: onerror="this.src='...'"
```

#### 4. Styling (`style/style.css`)

**Design System**:

**Color Scheme**:
- Primary: Dark theme with gradient backgrounds
- Accents: Gold/yellow for ratings and highlights
- Red: Logout button and error states
- White/Transparent: Overlays and cards

**Typography**:
- Font Family: Inter (Google Fonts)
- Headings: Bold (700 weight)
- Body: Regular (400 weight)

**Components**:

**Header/Navigation**:
```css
.top-bar                    // Fixed header with scroll behavior
.scrolled                   // Header background on scroll
.hidden                     // Header hidden when scrolling down
```

**Movie Cards**:
```css
.movie-card-grid            // Grid layout cards
.movie-poster-grid          // Responsive poster images
.movie-title-grid           // Truncated titles (2 lines)
.movie-rating-grid          // Star rating display
```

**Profile Components**:
```css
.profile-chip               // Logged-in user profile
.profile-chip-default       // Default profile icon
.profile-dropdown-menu      // Dropdown menu styling
.profile-dropdown-logout    // Red logout button
```

**Pagination**:
```css
.pagination                 // Bootstrap pagination customization
.page-link                  // Page number buttons
.active                     // Current page highlight
```

**Responsive Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 992px
- Desktop: > 992px

**Animations**:
- Smooth transitions on hover
- Fade effects for carousel
- Scale transforms on card hover
- Smooth scrolling

---

## Conclusion

The **Z Movie** project successfully demonstrates a complete web application with modern features including API integration, user authentication, state management, and responsive design. The modular architecture ensures maintainability and scalability, while the user-friendly interface provides an enjoyable movie browsing experience.

### Key Achievements

1. **Complete TMDB Integration**: Successfully integrated all necessary TMDB API endpoints for movies, authentication, and favorites
2. **User Authentication**: Implemented secure OAuth-like flow with session management
3. **State Persistence**: Maintained user sessions and favorites across browser sessions
4. **Responsive Design**: Created a fully responsive interface that works on all device sizes
5. **Error Handling**: Implemented comprehensive error handling and user feedback
6. **Code Organization**: Maintained clean separation of concerns across modules
7. **User Experience**: Created intuitive navigation and interactive elements

### Technical Skills Demonstrated

- **Frontend Development**: HTML5, CSS3, JavaScript (ES6+)
- **API Integration**: RESTful API consumption, error handling
- **State Management**: Local storage, global state objects
- **Authentication**: OAuth-like flow implementation
- **Responsive Design**: Mobile-first approach, CSS Grid, Flexbox
- **Code Architecture**: Modular design, separation of concerns
- **User Interface**: Modern UI/UX design principles

---

### Future Improvements

#### 1. Performance Enhancements
- **Image Lazy Loading**: Implement lazy loading for movie posters to improve initial page load time
- **Code Splitting**: Split JavaScript into smaller chunks for better caching
- **Service Worker**: Add PWA capabilities with offline support
- **Image Optimization**: Use WebP format with fallbacks for better compression

#### 2. Feature Additions
- **Movie Reviews**: Display and allow users to write reviews
- **Watchlist**: Separate watchlist functionality from favorites
- **Movie Recommendations**: Implement recommendation algorithm based on user favorites
- **Advanced Search**: Add filters for genre, year, rating range
- **Movie Trailers**: Embed YouTube trailers on detail pages
- **Social Features**: Share movies on social media
- **Dark/Light Theme**: User preference for theme switching

#### 3. User Experience
- **Infinite Scroll**: Alternative to pagination for smoother browsing
- **Skeleton Loaders**: Better loading states with skeleton screens
- **Toast Notifications**: Replace alerts with elegant toast messages
- **Keyboard Navigation**: Full keyboard accessibility support
- **Screen Reader Support**: ARIA labels and semantic HTML improvements

#### 4. Technical Improvements
- **Environment Variables**: Move API key to environment configuration
- **Error Logging**: Implement error tracking service (e.g., Sentry)
- **API Rate Limiting**: Handle TMDB rate limits gracefully
- **Caching Strategy**: Implement intelligent caching for API responses
- **TypeScript Migration**: Add type safety with TypeScript
- **Testing**: Unit tests and integration tests

#### 5. Backend Integration (Optional)
- **Custom Backend**: Create Node.js/Express backend for:
  - User preferences storage
  - Custom movie lists
  - Comment system
  - Analytics tracking

#### 6. Mobile App
- **Progressive Web App (PWA)**: Convert to installable PWA
- **Native App**: React Native or Flutter mobile application

#### 7. Advanced Features
- **Movie Comparison**: Compare two movies side-by-side
- **Genre Filtering**: Filter movies by genre on list pages
- **Sorting Options**: Sort by rating, release date, popularity
- **Export Favorites**: Export favorite list as CSV/JSON
- **Movie Calendar**: Calendar view for upcoming releases

---

## Appendix

### Project Files Structure
```
webproject/
├── index.html          # Home page
├── detail.html         # Movie detail page
├── favorites.html      # Favorites page
├── movies.html         # Paginated movie list
├── script/
│   ├── api.js         # API functions (209 lines)
│   ├── app.js         # App logic (985 lines)
│   └── ui.js          # UI rendering (502 lines)
└── style/
    └── style.css      # Styles (1108 lines)
```

### API Endpoints Used
- `GET /movie/popular`
- `GET /movie/top_rated`
- `GET /movie/upcoming`
- `GET /movie/{id}`
- `GET /search/movie`
- `POST /authentication/token/new`
- `POST /authentication/session/new`
- `GET /account`
- `POST /account/{account_id}/favorite`
- `GET /account/{account_id}/favorite/movies`

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

---

**End of Report**

