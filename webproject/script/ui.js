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
  
} // This is the final brace