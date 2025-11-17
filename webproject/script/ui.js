export function displayMovies(movies) {
  const movieList = document.getElementById("movie-list");

  movieList.innerHTML = "";

  movies.forEach((movie, index) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-3 col-lg-2 movie";

    const gutterSize = 4;
    if(index === 0)
      col.classList.add(`ms-${gutterSize}`);
    if(index === movies.length - 1)
      col.classList.add(`me-${gutterSize}`);

    col.innerHTML = `
    <a href="detail.html?id=${movie.id}" style="text-decoration: none; color: inherit;">
      <div>
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
             class="card-img-top movie-poster" 
             alt="${movie.title}">
        <div class="pt-2">
          <h6 class="card-title movie-title text-truncate">${movie.title}</h6>
          <p class="card-text movie-rating">⭐ Rating: ${movie.vote_average}</p>
        </div> 
      </div>
    </a>
  `;

    movieList.appendChild(col);
  });
}



export function displayHeroCarousel(movies) {
  const swiperWrapper = document.querySelector('.hero-carousel .swiper-wrapper');
  if (!swiperWrapper) return; 

  // Get only the top 10 movies for the carousel
  const top10Movies = movies.slice(0, 10);

  let allSlidesHTML = '';
  top10Movies.forEach(movie => {
    if (!movie.backdrop_path) return;

    const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

    // HTML structure for one slide
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

//initializer for swiper
export function initializeSwiper() {
  if (typeof Swiper === 'undefined') { 
    console.error('Swiper.js library is not loaded.');
    return;
  }

  new Swiper('.hero-carousel .swiper', {
    direction: 'horizontal',
    loop: true,
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    autoplay: {
      delay: 3000,
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

// top-bar hide/show
export function setupTopBarScroll() {
  const header = document.querySelector(".top-bar");
  if (!header) return;
  let lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

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

// left-right buttton on movie list 
export function setUpMovieScrollButton() {
  const listContainer = document.getElementById("movie-list");
  const scrollLeftBtn = document.querySelector(".scroll-btn-left");
  const scrollRightBtn = document.querySelector(".scroll-btn-right");

  if(listContainer) {
    listContainer.addEventListener("wheel", (event) => {
      event.preventDefault();
      listContainer.scrollLeft += event.deltaY;
    });
  }

  if(listContainer && scrollLeftBtn && scrollRightBtn) {
    const checkScroll = () => {
      if(listContainer.scrollLeft === 0) {
        scrollLeftBtn.style.display = 'none';
      } else {
        scrollLeftBtn.style.display = 'block';
      }
      const maxScrollLeft = listContainer.scrollWidth - listContainer.clientWidth;
      if (listContainer.scrollLeft >= maxScrollLeft - 1) {
        scrollRightBtn.style.display = 'none';
      } else {
        scrollRightBtn.style.display = 'block';
      }
    };

    scrollRightBtn.addEventListener("click", () => {
      const scrollAmount = listContainer.clientWidth * 0.75;
      listContainer.scrollBy({
        left: scrollAmount,
        behavior: "smooth"
      });
    });

    scrollLeftBtn.addEventListener("click", () => {
      const scrollAmount = listContainer.clientWidth * 0.75;
      listContainer.scrollBy({
        left: -scrollAmount,
        behavior: "smooth"
      });
    });

    listContainer.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    requestAnimationFrame(checkScroll);
  }
}

export function displayMovieDetail(movie) {
  const detailContainer = document.getElementById("movie-detail");
  if (!detailContainer) return;

  // Check if poster exists
  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  // Render movie details
  detailContainer.innerHTML = `
    <div class="row">
      <div class="col-md-4">
        <img src="${poster}" class="img-fluid rounded shadow-sm" alt="${movie.title}">
      </div>
      <div class="col-md-8">
        <h2>${movie.title}</h2>
        <p><strong>Release Date:</strong> ${movie.release_date}</p>
        <p><strong>Rating:</strong> ⭐ ${movie.vote_average}</p>
        <p><strong>Genres:</strong> ${movie.genres.map((g) => g.name).join(", ")}</p>
        <p><strong>Overview:</strong> ${movie.overview}</p>
        <a href="index.html" class="btn btn-secondary mt-3">⬅ Back to Home</a>
      </div>
    </div>
  `;
}