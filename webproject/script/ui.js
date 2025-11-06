/** * @param {Array<object>} movies - A list of movie objects from the API.
 */
export function displayMovies(movies) {
  const movieList = document.getElementById("movie-list");

  movieList.innerHTML = "";

  movies.forEach(movie => {
    const col = document.createElement("div");
    col.className = "col-md-3";

    col.innerHTML = `
    <a href="detail.html?id=${movie.id}" style="text-decoration: none; color: inherit;">
      <div class="card movie-card shadow-sm">
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
             class="card-img-top" 
             alt="${movie.title}">
        <div class="card-body">
          <h5 class="card-title">${movie.title}</h5>
          <p class="card-text">⭐ Rating: ${movie.vote_average}</p>
        </div> 
      </div>
    </a>
  `;

    movieList.appendChild(col);
  });
}



export function displayHeroCarousel(movies) {
  const swiperWrapper = document.querySelector('.hero-carousel .swiper-wrapper');
  if (!swiperWrapper) return; // Guard clause

  // Get only the top 10 movies for the carousel
  const top10Movies = movies.slice(0, 10);

  let allSlidesHTML = '';
  top10Movies.forEach(movie => {
    // Use backdrop_path for the wide hero image
    if (!movie.backdrop_path) return;

    const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

    // This is the HTML structure for one slide
    allSlidesHTML += `
        <div class="swiper-slide" style="background-image: url('${backdropUrl}')">
            <div class="hero-text-content">
                <h1>${movie.title}</h1>
                <p>${movie.overview}</p>
            </div>
        </div>
      `;
  });

  swiperWrapper.innerHTML = allSlidesHTML;
}

/**
 * Initializes the Swiper.js carousel.
 * This should be called *after* displayHeroCarousel.
 */
export function initializeSwiper() {
  // Check if Swiper library is loaded
  if (typeof Swiper === 'undefined') {
    console.error('Swiper.js library is not loaded.');
    return;
  }

  new Swiper('.hero-carousel .swiper', {
    direction: 'horizontal',
    loop: true,

    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },

    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
}

/**
 * Sets up the scroll listener for the top bar (show/hide/solid).
 * This function should only be called ONCE.
 */
export function setupTopBarScroll() {
  const header = document.querySelector(".top-bar");
  if (!header) return; // Guard clause

  let lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    // Solid/Transparent logic
    if (currentScrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Show/Hide logic
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      header.classList.add("hidden"); // Scrolling DOWN
    } else {
      header.classList.remove("hidden"); // Scrolling UP
    }

    lastScrollY = currentScrollY;
  });
}