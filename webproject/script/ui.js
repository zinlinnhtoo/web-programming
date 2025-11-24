export function displayMovies(movies, targetId) {
  const movieList = document.getElementById(targetId);

  if (!movieList) {
    console.error(`Error: Element with ID "${targetId}" not found.`);
    return;
  }

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