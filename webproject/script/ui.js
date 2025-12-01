export function displayMoviesGrid(movies, targetId, options = {}) {
  const movieGrid = document.getElementById(targetId);

  if (!movieGrid) {
    console.error(`Error: Element with ID "${targetId}" not found.`);
    return;
  }

  movieGrid.innerHTML = "";

  const {
    favorites = new Set(),
    isAuthenticated = false,
  } = options;

  movies.forEach((movie) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-3 col-xl-2";

    const rating = typeof movie.vote_average === "number"
      ? movie.vote_average.toFixed(1)
      : "N/A";

    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://via.placeholder.com/500x750?text=No+Image";

    col.innerHTML = `
    <a href="detail.html?id=${movie.id}" style="text-decoration: none; color: inherit;">
      <div class="movie-card-grid">
        <img src="${poster}" 
             class="movie-poster-grid" 
             alt="${movie.title}"
             onerror="this.src='https://via.placeholder.com/500x750?text=No+Image'">
        <div class="movie-card-info">
          <h6 class="movie-title-grid">${movie.title}</h6>
          <p class="movie-rating-grid">${rating}</p>
        </div> 
      </div>
    </a>
  `;

    movieGrid.appendChild(col);
  });
}

export function displayMovies(movies, targetId, options = {}) {
  const movieList = document.getElementById(targetId);

  if (!movieList) {
    console.error(`Error: Element with ID "${targetId}" not found.`);
    return;
  }

  movieList.innerHTML = "";

  const {
    favorites = new Set(),
    isAuthenticated = false,
  } = options;

  movies.forEach((movie, index) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-3 col-lg-2 movie";

    const gutterSize = 4;
    if(index === 0)
      col.classList.add(`ms-${gutterSize}`);
    if(index === movies.length - 1)
      col.classList.add(`me-${gutterSize}`);

    const rating = typeof movie.vote_average === "number"
      ? movie.vote_average.toFixed(1)
      : "N/A";

    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://via.placeholder.com/500x750?text=No+Image";

    col.innerHTML = `
    <a href="detail.html?id=${movie.id}" style="text-decoration: none; color: inherit;">
      <div>
        <img src="${poster}" 
             class="card-img-top movie-poster" 
             alt="${movie.title}"
             onerror="this.src='https://via.placeholder.com/500x750?text=No+Image'">
        <div class="pt-2">
          <h6 class="card-title movie-title text-truncate">${movie.title}</h6>
          <p class="card-text movie-rating">⭐ Rating: ${rating}</p>
        </div> 
      </div>
    </a>
  `;

    movieList.appendChild(col);
  });
}

export function displaySearchResults(movies, targetId, showAllLink = false) {
  const resultsList = document.getElementById(targetId);

  if (!resultsList) {
    console.error(`Error: Element with ID "${targetId}" not found.`);
    return;
  }

  resultsList.innerHTML = "";

  // Show only first 5 results in dropdown, rest will be in "show all"
  const displayMovies = movies.slice(0, 5);

  displayMovies.forEach((movie) => {
    const resultItem = document.createElement("a");
    resultItem.href = `detail.html?id=${movie.id}`;
    resultItem.className = "search-result-item";
    
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
      : "https://via.placeholder.com/92x138?text=No+Image";
    
    const releaseYear = movie.release_date 
      ? new Date(movie.release_date).getFullYear() 
      : "N/A";

    resultItem.innerHTML = `
      <img src="${poster}" 
           class="search-result-poster" 
           alt="${movie.title}"
           onerror="this.src='https://via.placeholder.com/92x138?text=No+Image'">
      <div class="search-result-info">
        <h6 class="search-result-title">${movie.title}</h6>
        <div class="search-result-meta">
          <span class="search-result-type">Movie</span>
          <span class="search-result-year">${releaseYear}</span>
        </div>
      </div>
    `;

    resultsList.appendChild(resultItem);
  });

  // Show "Show all results" link if there are more than 5 results
  const footer = document.getElementById("search-results-footer");
  if (footer && movies.length > 5 && showAllLink) {
    footer.style.display = "block";
  } else if (footer) {
    footer.style.display = "none";
  }
}



export function displayHeroCarousel(movies) {
  const swiperWrapper = document.querySelector('.hero-carousel .swiper-wrapper');
  if (!swiperWrapper) return; 

  // Get only the top 10 movies for the carousel
  const top10Movies = movies.slice(0, 10);

  let allSlidesHTML = '';
  top10Movies.forEach(movie => {
    const backdropUrl = movie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : "https://via.placeholder.com/1920x1080?text=No+Image";

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
let swiperInstance = null;

export function initializeSwiper() {
  if (typeof Swiper === 'undefined') { 
    console.error('Swiper.js library is not loaded.');
    return;
  }

  const swiperWrapper = document.querySelector('.hero-carousel .swiper-wrapper');
  if (!swiperWrapper || swiperWrapper.children.length === 0) {
    console.warn('Swiper: No slides found, cannot initialize.');
    return;
  }

  // Destroy existing instance if any
  if (swiperInstance) {
    swiperInstance.destroy(true, true);
    swiperInstance = null;
  }

  swiperInstance = new Swiper('.hero-carousel .swiper', {
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
  // Wait a bit longer to ensure movies are fully rendered
  setTimeout(() => {
    // Find all movie list wrapper sections
    const movieListWrappers = document.querySelectorAll(".movie-list-wrapper");

    if (movieListWrappers.length === 0) {
      console.warn("No movie list wrappers found");
      return;
    }


    movieListWrappers.forEach((wrapper, index) => {
      // Find the list container - the row div with overflow-auto
      const listContainer = wrapper.querySelector(".row.overflow-auto");
      
      if (!listContainer) {
        console.warn(`List container not found in wrapper ${index}`);
        return;
      }

      const scrollLeftBtn = wrapper.querySelector(".scroll-btn-left");
      const scrollRightBtn = wrapper.querySelector(".scroll-btn-right");

      if (!scrollLeftBtn || !scrollRightBtn) {
        console.warn(`Scroll buttons not found in wrapper ${index}`);
        return;
      }


      // Ensure buttons are visible and clickable - set all styles explicitly
      scrollLeftBtn.style.cssText = 'display: flex !important; pointer-events: auto !important; z-index: 1000 !important; position: absolute !important; cursor: pointer !important;';
      scrollRightBtn.style.cssText = 'display: flex !important; pointer-events: auto !important; z-index: 1000 !important; position: absolute !important; cursor: pointer !important;';
      
      // Test if buttons are clickable
      scrollRightBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
      scrollLeftBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';

      // Add wheel scroll support - handle both vertical and horizontal scrolling (touchpad support)
      listContainer.addEventListener("wheel", (event) => {
        // Check if there's horizontal scroll (deltaX) - touchpad horizontal scrolling
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
          // Horizontal scroll - allow native behavior for horizontal scrolling
          return;
        } else {
          // Vertical scroll - convert to horizontal scroll
          event.preventDefault();
          listContainer.scrollLeft += event.deltaY;
        }
      }, { passive: false });

      // Function to check scroll position and show/hide buttons
      const updateButtonVisibility = () => {
        const maxScrollLeft = listContainer.scrollWidth - listContainer.clientWidth;
        const hasScrollableContent = maxScrollLeft > 10;
        
        // Only hide left button if at the start
        if (listContainer.scrollLeft <= 10 || !hasScrollableContent) {
          scrollLeftBtn.style.display = 'none';
        } else {
          scrollLeftBtn.style.display = 'flex';
        }
        
        // Only hide right button if at the end or no scrollable content
        if (!hasScrollableContent || listContainer.scrollLeft >= maxScrollLeft - 10) {
          scrollRightBtn.style.display = 'none';
        } else {
          scrollRightBtn.style.display = 'flex';
        }
      };

      // Right button click handler - use addEventListener with capture
      const rightHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Reduced scroll amount for smoother scrolling (about 40% of container width or 250px, whichever is smaller)
        const scrollAmount = Math.min(listContainer.clientWidth * 0.4, 250);
        listContainer.scrollBy({
          left: scrollAmount,
          behavior: "smooth"
        });
        
        // Update visibility after scroll
        setTimeout(updateButtonVisibility, 200);
        return false;
      };

      // Left button click handler - use addEventListener with capture
      const leftHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Reduced scroll amount for smoother scrolling (about 40% of container width or 250px, whichever is smaller)
        const scrollAmount = Math.min(listContainer.clientWidth * 0.4, 250);
        listContainer.scrollBy({
          left: -scrollAmount,
          behavior: "smooth"
        });
        
        // Update visibility after scroll
        setTimeout(updateButtonVisibility, 200);
        return false;
      };

      // Attach event listeners - use capture phase to catch early
      scrollRightBtn.addEventListener("click", rightHandler, true);
      scrollLeftBtn.addEventListener("click", leftHandler, true);
      
      // Also attach mouseup as backup
      scrollRightBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        rightHandler(e);
      });
      scrollLeftBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        leftHandler(e);
      });

      // Add scroll listener
      listContainer.addEventListener("scroll", updateButtonVisibility, { passive: true });

      // Add resize listener
      window.addEventListener("resize", updateButtonVisibility);
      
      // Initial check after content loads
      setTimeout(() => {
        updateButtonVisibility();
      }, 150);
    });
  }, 300);
}

export function displayMovieDetail(movie, options = {}) {
  const detailContainer = document.getElementById("movie-detail");
  const backdropContainer = document.getElementById("movie-backdrop");
  const castContainer = document.getElementById("cast");
  
  if (!detailContainer) return;
  const allCastMembers = movie?.credits?.cast || [];
  const castMembers = allCastMembers.slice(0, 10);
  const hasMoreCast = allCastMembers.length > 10;

  const {
    favorites = new Set(),
    isAuthenticated = false,
  } = options;

  // Set backdrop image if available
  if (backdropContainer) {
    if (movie.backdrop_path) {
      const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
      backdropContainer.style.backgroundImage = `url('${backdropUrl}')`;
    } else {
      // Fallback if no backdrop - use placeholder
      backdropContainer.style.backgroundImage = `url('https://via.placeholder.com/1920x1080?text=No+Image'), linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)`;
    }
  }

  // Check if poster exists
  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  // Prepare rating with 1 decimal place
  const rating = typeof movie.vote_average === "number"
    ? movie.vote_average.toFixed(1)
    : "N/A";

  const isFavorite = favorites.has(movie.id);

  // Render movie details
  detailContainer.innerHTML = `
    <div class="row">
      <div class="col-md-4">
        <img src="${poster}" class="img-fluid rounded shadow-sm" alt="${movie.title}">
      </div>
      <div class="col-md-8">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 class="mb-2">${movie.title}</h2>
            <p class="mb-1">${movie.release_date} &bull; ⭐ ${rating}</p>
            <p class="mb-0">${movie.genres.map((g) => g.name).join(", ")}</p>
          </div>
          ${isAuthenticated ? `
          <button
            type="button"
            class="favorite-btn-detail ${isFavorite ? "active" : ""}"
            data-favorite-btn="true"
            data-movie-id="${movie.id}"
            aria-label="${isFavorite ? "Remove from favorites" : "Add to favorites"}"
            title="${isFavorite ? "Remove from favorites" : "Add to favorites"}"
          >
            <i class="fa-solid fa-heart"></i>
            <span>${isFavorite ? "Favorited" : "Add to Favorites"}</span>
          </button>
          ` : ''}
        </div>
        <p>${movie.overview}</p>
      </div>
    </div>
  `;

  if (!castContainer) return;

  castContainer.innerHTML = "";

  if (!castMembers.length) {
    castContainer.innerHTML = `<p class="text-muted">Cast information is not available.</p>`;
    return;
  }

  castMembers.forEach((member, index) => {
    const col = document.createElement("div");
    col.className = "cast-card-item";

    const gutterSize = 2;
    if (index === 0) col.classList.add(`ms-${gutterSize}`);
    if (index === castMembers.length - 1 && !hasMoreCast) col.classList.add(`me-${gutterSize}`);

    const avatar = member.profile_path
      ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
      : "https://via.placeholder.com/185x278?text=No+Image";
    const character = member.character || "Unknown role";
    
    col.innerHTML = `
      <div class="cast-card-body">
        <img src="${avatar}" 
             class="cast-card-poster" 
             alt="${member.name}"
             onerror="this.src='https://via.placeholder.com/185x278?text=No+Image'">
        <div class="cast-card-info">
          <h6 class="cast-card-title">${member.name}</h6>
          <p class="cast-card-role">${character}</p>
        </div> 
      </div>
    `;

    castContainer.appendChild(col);
  });

  // Add "View More" link if there are more cast members
  if (hasMoreCast) {
    const viewMoreCol = document.createElement("div");
    viewMoreCol.className = "cast-card-item cast-view-more";
    viewMoreCol.innerHTML = `
      <div class="cast-card-body cast-view-more-body">
        <a href="#" class="cast-view-more-link">View More →</a>
      </div>
    `;
    castContainer.appendChild(viewMoreCol);
  }
}