document.addEventListener("DOMContentLoaded", function () {
  const gamesContainer = document.querySelector(".games-container");
  const searchInput = document.getElementById("searchInput");
  gamesContainer.innerHTML = ""; // Clear the loading message

  // Pagination configuration
  const GAMES_PER_PAGE = 48;
  let currentPage = 1;
  let currentGames = [];

  // A subset of games for demonstration
  const games = GAMES;

  // Function to create pagination controls
  function createPaginationControls(totalGames, currentPage, gamesPerPage) {
    const totalPages = Math.ceil(totalGames / gamesPerPage);

    if (totalPages <= 1) return null;

    const paginationContainer = document.createElement("div");
    paginationContainer.className = "pagination-wrapper";

    let paginationHTML = '<div class="pagination-container">';

    // Previous button
    if (currentPage > 1) {
      paginationHTML += `<button class="pagination-btn" onclick="goToPage(${
        currentPage - 1
      })">← Previous</button>`;
    }

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      paginationHTML += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
      if (startPage > 2) {
        paginationHTML += `<span class="pagination-ellipsis">...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const activeClass = i === currentPage ? "active" : "";
      paginationHTML += `<button class="pagination-btn ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span class="pagination-ellipsis">...</span>`;
      }
      paginationHTML += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    if (currentPage < totalPages) {
      paginationHTML += `<button class="pagination-btn" onclick="goToPage(${
        currentPage + 1
      })">Next →</button>`;
    }

    paginationHTML += "</div>";

    // Add page info
    const startItem = (currentPage - 1) * gamesPerPage + 1;
    const endItem = Math.min(currentPage * gamesPerPage, totalGames);
    paginationHTML += `<div class="pagination-info">Showing ${startItem}-${endItem} of ${totalGames} games</div>`;

    paginationContainer.innerHTML = paginationHTML;
    return paginationContainer;
  }

  // Function to get games for current page
  function getGamesForPage(gameList, page, gamesPerPage) {
    const startIndex = (page - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    return gameList.slice(startIndex, endIndex);
  }

  // Function to render game cards with pagination
  function renderGames(gameList, page = 1) {
    const currentGamesContainer = document.querySelector(".games-container");
    if (!currentGamesContainer) {
      console.error("Games container not found");
      return;
    }

    // Update current games and page
    currentGames = gameList;
    currentPage = page;

    // Clear existing content
    currentGamesContainer.innerHTML = "";

    // Get games for current page - THIS IS THE KEY FIX
    const paginatedGames = getGamesForPage(gameList, page, GAMES_PER_PAGE);

    console.log(
      `Showing page ${page} of ${Math.ceil(gameList.length / GAMES_PER_PAGE)}`
    );
    console.log(
      `Total games: ${gameList.length}, Games on this page: ${paginatedGames.length}`
    );

    // Render only the paginated games
    paginatedGames.forEach((game) => {
      const gameCard = document.createElement("div");
      gameCard.classList.add("game-card");
      gameCard.innerHTML = `
        <img src="${game.image}" alt="${game.title}" onclick="navigateToGame('${game.url}', '${game.title}');" style="cursor: pointer;">
        <h3 onclick="navigateToGame('${game.url}', '${game.title}');" style="cursor: pointer;">${game.title}</h3>
      `;
      currentGamesContainer.appendChild(gameCard);
    });

    // Add pagination controls after the games
    const paginationElement = createPaginationControls(
      gameList.length,
      page,
      GAMES_PER_PAGE
    );
    if (paginationElement) {
      // Create a wrapper to break out of the grid layout for pagination
      const paginationWrapper = document.createElement("div");
      paginationWrapper.style.gridColumn = "1 / -1"; // Span all columns
      paginationWrapper.appendChild(paginationElement);
      currentGamesContainer.appendChild(paginationWrapper);
    }

    // Scroll to top of games container
    currentGamesContainer.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // Global function to handle page navigation
  window.goToPage = function (page) {
    console.log(`Navigating to page ${page}`);
    renderGames(currentGames, page);
  };

  // Function to filter games based on search input
  function filterGames() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const filteredGames = games.filter((game) =>
      game.title.toLowerCase().includes(searchTerm)
    );
    console.log(
      `Search term: "${searchTerm}", Found ${filteredGames.length} games`
    );
    // Reset to page 1 when searching
    renderGames(filteredGames, 1);
  }

  // Add event listener for search input with debouncing
  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(filterGames, 300); // 300ms delay
    });
  }

  // Function to navigate to a new route and display game in iframe
  window.navigateToGame = function (url, title) {
    // Check if the page is loaded from a file:// URL to avoid SecurityError with pushState
    if (window.location.protocol !== "file:") {
      // Update the URL using history API to simulate a new route only if not on file://
      history.pushState(
        { url, title },
        title,
        `/game/${encodeURIComponent(title)}`
      );
    }

    // Update the main content to show iframe
    const mainContent = document.querySelector("main");
    mainContent.innerHTML = `
      <div class="game-iframe-container">
        <h2>${title}</h2>
        <iframe src="${url}" title="${title}" class="game-iframe"></iframe>
        <a href="/" onclick="navigateBackToHome(); return false;">Back to Games</a>
      </div>
    `;
  };

  // Function to navigate back to home
  window.navigateBackToHome = function () {
    // Check if the page is loaded from a file:// URL to avoid SecurityError with pushState
    if (window.location.protocol !== "file:") {
      history.pushState({}, "Online Browser Games", "/");
    }

    const mainContent = document.querySelector("main");
    // Restore the original games container
    mainContent.innerHTML = `
      <section class="games-container">
        <p>Loading games...</p>
      </section>
    `;

    // Reset search input
    const headerSearchInput = document.getElementById("searchInput");
    if (headerSearchInput) {
      headerSearchInput.value = "";
    }

    // Reset pagination state and render games
    currentPage = 1;
    setTimeout(() => {
      renderGames(games, 1);
    }, 100);
  };

  // Handle popstate event for browser back/forward navigation only if not on file://
  if (window.location.protocol !== "file:") {
    window.addEventListener("popstate", function (event) {
      if (event.state && event.state.url && event.state.title) {
        navigateToGame(event.state.url, event.state.title);
      } else {
        navigateBackToHome();
      }
    });
  }

  // Initial render - make sure we start with page 1
  console.log(`Initial render: ${games.length} total games`);
  renderGames(games, 1);
});
