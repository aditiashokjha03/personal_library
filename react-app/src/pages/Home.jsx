import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { url } from '../metadata.js';

function Home() {
  const [recentBooks, setRecentBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch(`${url}/books.json`);
        const data = await res.json();
        if (data) {
          const booksArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).reverse().slice(0, 4);
          setRecentBooks(booksArray);
        }
      } catch (error) {
        console.error("Failed to fetch recent books", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="landing-page">
      <nav className="home-top-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">Mia Librería.</Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/library">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="hero-container">
        <div className="hero-editorial">
          <h1>Your books. <i>Your space.</i></h1>
          <p>A beautifully organized home for everything you love to read.</p>
          <div className="hero-buttons">
            <Link to="/library" className="btn-primary">Go to Dashboard</Link>
            <Link to="/library" className="btn-secondary">Add New Book</Link>
          </div>
        </div>
      </div>

      <div className="editorial-section">
        <div className="editorial-section-header">
          <h2>Recently Added</h2>
          <Link to="/library">View all books &rarr;</Link>
        </div>

        <div className="editorial-grid">
          {isLoading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading recent books...</p>
          ) : recentBooks.length > 0 ? (
            recentBooks.map(book => (
              <div key={book.id} className="editorial-book-card">
                <div className="cover-wrapper">
                  {book.coverImageURL ? (
                    <img src={book.coverImageURL} alt={book.title} />
                  ) : (
                    <div className="placeholder-cover">{book.title}</div>
                  )}
                </div>
                <h4>{book.title}</h4>
                <p>{book.author}</p>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No books added yet. Start your collection.</p>
          )}
        </div>
      </div>
      
      <footer className="home-footer">
        <div>© 2026 Mia Librería. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default Home;
