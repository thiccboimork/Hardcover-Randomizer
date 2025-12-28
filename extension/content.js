
const BACKEND_URL = 'https://hardcover-randomizer.onrender.com';

// Add the randomizer button to the page
function addRandomizerButton() {
  // Check if button already exists
  if (document.getElementById('hardcover-randomizer-btn')) {
    return;
  }

  // Create the button container
  const container = document.createElement('div');
  container.id = 'hardcover-randomizer-container';
  
  // Create the button
  const button = document.createElement('button');
  button.id = 'hardcover-randomizer-btn';
  button.innerHTML = '🎲 Pick Random Book';
  button.className = 'randomizer-button';
  
  // Create result display
  const resultDiv = document.createElement('div');
  resultDiv.id = 'hardcover-randomizer-result';
  resultDiv.className = 'randomizer-result hidden';
  
  container.appendChild(button);
  container.appendChild(resultDiv);
  
  // Try to add to the page header or main content area
  document.body.appendChild(container);
  
  // Add click handler
  button.addEventListener('click', getRandomBook);
}

// Fetch and display a random book
async function getRandomBook() {
  const button = document.getElementById('hardcover-randomizer-btn');
  const resultDiv = document.getElementById('hardcover-randomizer-result');
  
  if (!button || !resultDiv) return;
  
  // Show loading state
  button.disabled = true;
  button.innerHTML = '🎲 Loading...';
  resultDiv.classList.add('hidden');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/random-book`);
    const data = await response.json();
    
    console.log('Raw response from backend:', data);
    if (data.success && data.book) {
      displayBook(data.book, data.totalBooks);
    } else {
      showError('No books found in your Want to Read shelf!');
    }
  } catch (error) {
    console.error('Error fetching random book:', error);
    showError('Failed to connect to randomizer service. Make sure the backend is running!');
  } finally {
    button.disabled = false;
    button.innerHTML = '🎲 Pick Random Book';
  }
}

// Display the selected book
function displayBook(book, totalBooks) {
  console.log('Displaying book:', book);
  console.log('Total books:', totalBooks);
  const resultDiv = document.getElementById('hardcover-randomizer-result');
  if (!resultDiv) return;
  
  const authors = book.contributions?.map(c => c.author.name).join(', ') || 'Unknown Author';
  
  resultDiv.innerHTML = `
    <div class="random-book-card">
      <button class="close-btn" onclick="this.closest('.randomizer-result').classList.add('hidden')">×</button>
      <h3>📚 Your Random Pick!</h3>
      <p class="book-count">From ${totalBooks} books in your Want to Read shelf</p>
      ${book.image ? `<img src="${book.image}" alt="${book.title}" class="book-cover">` : ''}
      <h4>${book.title}</h4>
      <p class="book-author">by ${authors}</p>
      ${book.pages ? `<p class="book-pages">${book.pages} pages</p>` : ''}
      ${book.release_year ? `<p class="book-year">${book.release_year}</p>` : ''}
      ${book.description ? `<p class="book-description">${book.description.substring(0, 200)}${book.description.length > 200 ? '...' : ''}</p>` : ''}
      <a href="https://hardcover.app/books/${book.id}" class="view-book-btn" target="_blank">View Book →</a>
    </div>
  `;
  
  resultDiv.classList.remove('hidden');
}

// Show error message
function showError(message) {
  const resultDiv = document.getElementById('hardcover-randomizer-result');
  if (!resultDiv) return;
  
  resultDiv.innerHTML = `
    <div class="random-book-card error">
      <button class="close-btn" onclick="this.closest('.randomizer-result').classList.add('hidden')">×</button>
      <p>⚠️ ${message}</p>
    </div>
  `;
  
  resultDiv.classList.remove('hidden');
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addRandomizerButton);
} else {
  addRandomizerButton();
}

// Re-add button if page content changes (for SPAs)
const observer = new MutationObserver((mutations) => {
  if (!document.getElementById('hardcover-randomizer-btn')) {
    addRandomizerButton();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
