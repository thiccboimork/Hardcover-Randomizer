import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const HARDCOVER_API_TOKEN = process.env.HARDCOVER_API_TOKEN;
const HARDCOVER_API_URL = process.env.HARDCOVER_API_URL || 'https://api.hardcover.app/v1/graphql';

const WANT_TO_READ_QUERY = `
  query GetWantToRead {
    me {
      user_books(where: { status_id: { _eq: 1 } }) {
        book {
          id
          title
          description
          pages
          release_year
          image {
            url
          }
          contributions {
            author {
              name
            }
          }
        }
      }
    }
  }
`;



app.get('/api/random-book', async (req, res) => {
  try {
    
    const response = await fetch(HARDCOVER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HARDCOVER_API_TOKEN}`
      },
      body: JSON.stringify({
        query: WANT_TO_READ_QUERY
      })
    });

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL Errors:', data.errors);
      return res.status(400).json({ error: data.errors });
    }

    const meArray = data.data?.me || [];

    const userBooks = meArray.flatMap(user => user.user_books);

    // Filter only books with status_id === 1 (Want to Read)
    const wantToReadBooks = userBooks.map(entry => entry.book);

    if (wantToReadBooks.length === 0) {
      return res.status(404).json({ error: 'No books found in Want to Read shelf' });
    }

    // Pick a random book
    const randomBook = wantToReadBooks[Math.floor(Math.random() * wantToReadBooks.length)];
    if (randomBook.image && randomBook.image.url) {
      randomBook.image = randomBook.image.url;
    }
    
    res.json({
      success: true,
      book: randomBook,
      totalBooks: wantToReadBooks.length
    });

  } catch (error) {
    console.error('Error fetching random book:', error);
    res.status(500).json({ error: 'Failed to fetch random book' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}}`);
});
