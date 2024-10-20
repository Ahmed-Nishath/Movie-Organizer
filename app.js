const apiKey = '2388d83c5310e9d91ca1291bde91f2e4'; // Replace with your actual TMDB API key

document.addEventListener("DOMContentLoaded", () => {
    loadMoviesFromLocalStorage();

    document.getElementById('search-input').addEventListener('input', searchMovies);
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('toggle-dark-mode').addEventListener('click', toggleDarkMode);
    document.getElementById('download-btn').addEventListener('click', downloadMovieList);
    
    // Add event listener for file input change
    document.getElementById('file-input').addEventListener('change', loadMovieListFromFile);
});

let selectedMovies = [];

const searchMovies = async () => {
    const query = document.getElementById('search-input').value;
    if (!query) {
        document.getElementById('suggestions').innerHTML = ''; // Clear suggestions if input is empty
        return;
    }

    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`);
    const data = await response.json();
    displaySuggestions(data.results);
};

const displaySuggestions = (movies) => {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';

    movies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.className = 'suggestion-item';
        movieItem.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <span>${movie.title} (${new Date(movie.release_date).getFullYear()})</span>
        `;
        movieItem.onclick = () => addMovie(movie);
        suggestionsDiv.appendChild(movieItem);
    });
};

const addMovie = (movie) => {
    if (!selectedMovies.some(m => m.id === movie.id)) {
        selectedMovies.push(movie);
        selectedMovies.sort((a, b) => b.vote_average - a.vote_average); // Sort by rating
        updateSelectedMovies();
        saveMoviesToLocalStorage();
    }
    document.getElementById('search-input').value = '';
    document.getElementById('suggestions').innerHTML = '';
};

const updateSelectedMovies = () => {
    const selectedMoviesDiv = document.getElementById('selected-movies');
    selectedMoviesDiv.innerHTML = '';

    selectedMovies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.className = 'movie';
        movieDiv.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h2>${movie.title} (${new Date(movie.release_date).getFullYear()})</h2>
            <p>Rating: ${movie.vote_average}</p>
        `;
        movieDiv.onclick = () => showMovieDetails(movie);
        selectedMoviesDiv.appendChild(movieDiv);
    });
};

const showMovieDetails = async (movie) => {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`);
    const details = await response.json();
    document.getElementById('movie-title').innerText = `${details.title} (${new Date(details.release_date).getFullYear()})`;
    document.getElementById('movie-overview').innerHTML = `<span class="italic">Overview:</span> ${details.overview}`;
    document.getElementById('movie-rating').innerHTML = `<span class="highlight">Rating:</span> ${details.vote_average}`;
    document.getElementById('movie-runtime').innerHTML = `<span class="subtle">Runtime:</span> ${details.runtime} minutes`;
    document.getElementById('movie-genres').innerHTML = `<span class="subtle">Genres:</span> ${details.genres.map(genre => genre.name).join(', ')}`;
    document.getElementById('movie-budget').innerHTML = `<span class="subtle">Budget:</span> $${details.budget.toLocaleString()}`;
    document.getElementById('movie-revenue').innerHTML = `<span class="subtle">Revenue:</span> $${details.revenue.toLocaleString()}`;
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('mark-watched').onclick = () => markAsWatched(movie);
};

const closeModal = () => {
    document.getElementById('modal').style.display = 'none';
};

const markAsWatched = (movie) => {
    selectedMovies = selectedMovies.filter(m => m.id !== movie.id);
    updateSelectedMovies();
    saveMoviesToLocalStorage();
    closeModal();
};

const saveMoviesToLocalStorage = () => {
    localStorage.setItem('selectedMovies', JSON.stringify(selectedMovies));
};

const loadMoviesFromLocalStorage = () => {
    const storedMovies = localStorage.getItem('selectedMovies');
    if (storedMovies) {
        selectedMovies = JSON.parse(storedMovies);
        selectedMovies.sort((a, b) => b.vote_average - a.vote_average); // Sort by rating
        updateSelectedMovies();
    }
};

const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
};

const loadMovieListFromFile = () => {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a JSON file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const movies = JSON.parse(event.target.result);
            if (Array.isArray(movies)) {
                selectedMovies = movies;
                selectedMovies.sort((a, b) => b.vote_average - a.vote_average); // Sort by rating
                updateSelectedMovies();
                saveMoviesToLocalStorage(); // Save to local storage after loading
            } else {
                alert("Invalid JSON format.");
            }
        } catch (error) {
            alert("Error reading file: " + error.message);
        }
    };

    reader.readAsText(file);
};

const downloadMovieList = () => {
    if (selectedMovies.length === 0) {
        alert("No movies to download.");
        return;
    }

    const blob = new Blob([JSON.stringify(selectedMovies, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'movie-list.json'; // Name of the file to download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
