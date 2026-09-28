import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { url } from '../metadata.js';
import Swal from 'sweetalert2';

function Library() {
  const [books, setBooks] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [imageFile, setImageFile] = useState(null); 
  const [pdfFile, setPdfFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedBook, setSelectedBook] = useState(null);

  const getBooks = async () => {
    try {
      const res = await fetch(`${url}/books.json`);
      const data = await res.json();
      setBooks(data || {});
    } catch (err) {
      console.error("Failed to fetch books", err);
    }
  };

  useEffect(() => {
    getBooks();
  }, []);

  const resetForm = () => {
    setTitle(''); setAuthor(''); setPrice('');
    setImageURL(''); setImageFile(null); setPdfFile(null);
    setEditingId(null);
  };

  const openEditModal = (book) => {
    setEditingId(book.id);
    setTitle(book.title || '');
    setAuthor(book.author || '');
    setPrice(book.price || '');
    setImageURL(book.coverImageURL || '');
    setImageFile(null);
    setPdfFile(null);
    setSelectedBook(null);
    setIsAddModalOpen(true);
  };

  const handleAddBook = async () => {
    if (!title || !author || !price) {
      Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Please fill in title, author, and price.' });
      return;
    }

    setIsUploading(true);
    let finalPdfUrl = editingId && books[editingId] ? books[editingId].pdfURL : '';
    let finalImageUrl = imageURL; 

    if (imageFile) {
      const imgFormData = new FormData();
      imgFormData.append("file", imageFile);
      imgFormData.append("upload_preset", "library");
      try {
        const imgUploadRes = await fetch("https://api.cloudinary.com/v1_1/drk7y30iv/auto/upload", { method: "POST", body: imgFormData });
        const imgUploadData = await imgUploadRes.json();
        if (imgUploadData.secure_url) finalImageUrl = imgUploadData.secure_url;
      } catch (err) { console.error(err); }
    }

    if (pdfFile) {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("upload_preset", "library"); 
      try {
        const uploadRes = await fetch("https://api.cloudinary.com/v1_1/drk7y30iv/auto/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.secure_url) {
          finalPdfUrl = uploadData.secure_url;
          if (!finalImageUrl) finalImageUrl = finalPdfUrl.replace(/\.pdf$/i, '.jpg');
        }
      } catch (err) { console.error(err); }
    }

    const bookData = { title, author, price, coverImageURL: finalImageUrl, pdfURL: finalPdfUrl };

    try {
      const fetchUrl = editingId ? `${url}/books/${editingId}.json` : `${url}/books.json`;
      const fetchMethod = editingId ? "PATCH" : "POST";
      
      const res = await fetch(fetchUrl, {
        method: fetchMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData)
      });
      
      if (res.ok) {
        Swal.fire({ icon: 'success', title: editingId ? 'Updated!' : 'Added!', showConfirmButton: false, timer: 1500 });
        getBooks();
        resetForm();
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteBook = async (id) => {
    const result = await Swal.fire({
      title: 'Delete this book?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626'
    });
    if (result.isConfirmed) {
      await fetch(`${url}/books/${id}.json`, { method: "DELETE" });
      getBooks();
    }
  };

  const filteredBookIds = Object.keys(books).filter(id => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return books[id].title.toLowerCase().includes(q) || books[id].author.toLowerCase().includes(q);
  });

  const userName = localStorage.getItem('userName') || 'Reader';

  return (
    <div className="dashboard-layout">
      {/* Top Bar */}
      <div className="dashboard-topbar">
        <Link to="/" className="logo">Mia Librería</Link>
        <div className="topbar-icons" style={{ alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '10px', fontSize: '1rem', color: '#a39c96', pointerEvents: 'none' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search library..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                padding: '8px 15px 8px 35px', 
                borderRadius: '20px', 
                border: '1px solid rgba(255,255,255,0.2)', 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                color: '#fff', 
                outline: 'none',
                fontFamily: 'Manrope',
                width: '200px'
              }}
            />
          </div>
          <a href="#wishlist">❤️ Wishlist</a>
          <span 
            onClick={() => { 
              localStorage.removeItem('isAuthenticated'); 
              localStorage.removeItem('userName'); 
              window.location.href = '/'; 
            }}
            style={{ fontSize: '0.9rem', color: '#a39c96' }}
          >
            Log Out
          </span>
        </div>
      </div>

      <div className="dashboard-body">
        {/* Main Content */}
        <div className="dashboard-main">
          <div className="dashboard-main-content">
          
          <div className="dashboard-header">
            <h1>Welcome back, {userName} 📚</h1>
            <p>Here's an overview of your library.</p>
          </div>

          <div className="collection-section" id="collection">
            <div className="collection-header">
              <h3 className="serif" style={{ margin: 0, fontSize: '1.4rem' }}>{searchQuery ? 'Search Results:' : 'My Book Collection:'}</h3>
              <button className="btn-secondary" onClick={() => { resetForm(); setIsAddModalOpen(true); }}>Add New</button>
            </div>
            
            <div className="horizontal-scroll">
              {filteredBookIds.length === 0 && <p className="empty-state">{searchQuery ? 'No books match your search.' : 'No books yet. Click "Add New"!'}</p>}
              {filteredBookIds.map(id => {
                const book = books[id];
                return (
                  <div key={id} className="dashboard-book-card" onClick={() => setSelectedBook({id, ...book})}>
                    <div className="cover-wrapper">
                      <div className="status-tag">Read</div>
                      <button 
                        className="heart-btn" 
                        onClick={async (e) => {
                          e.stopPropagation();
                          const updatedBook = { ...book, isWishlist: !book.isWishlist };
                          setBooks(prev => ({ ...prev, [id]: updatedBook }));
                          try {
                            await fetch(`${url}/books/${id}.json`, {
                              method: 'PATCH',
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ isWishlist: !book.isWishlist })
                            });
                          } catch (err) { console.error(err); }
                        }}
                      >
                        {book.isWishlist ? '❤️' : '🤍'}
                      </button>
                      {book.coverImageURL ? (
                        <img src={book.coverImageURL} alt={book.title} />
                      ) : (
                        <div className="placeholder-cover">{book.title}</div>
                      )}
                    </div>
                    <h4>{book.title}</h4>
                    <p>{book.author}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel" id="wishlist" style={{ maxWidth: '600px', marginBottom: '40px' }}>
            <h3 className="serif">Wishlist</h3>
            {Object.keys(books).filter(id => books[id].isWishlist).length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Click the heart icon on any book to add it to your wishlist!</p>
            ) : (
              Object.keys(books).filter(id => books[id].isWishlist).map(id => {
                const book = books[id];
                return (
                  <div key={id} className="wishlist-item" onClick={() => setSelectedBook({id, ...book})} style={{ cursor: 'pointer' }}>
                    {book.coverImageURL ? (
                      <div className="wishlist-cover" style={{ backgroundImage: `url(${book.coverImageURL})` }}></div>
                    ) : (
                      <div className="wishlist-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', textAlign: 'center', padding: '5px' }}>No Cover</div>
                    )}
                    <div className="wishlist-info">
                      <h4>{book.title}</h4>
                      <p>{book.author}</p>
                    </div>
                    <button 
                      className="btn-secondary btn-small" 
                      onClick={async (e) => {
                        e.stopPropagation();
                        const updatedBook = { ...book, isWishlist: false };
                        setBooks(prev => ({ ...prev, [id]: updatedBook }));
                        try {
                          await fetch(`${url}/books/${id}.json`, {
                            method: 'PATCH',
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ isWishlist: false })
                          });
                        } catch (err) { console.error(err); }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            )}
          </div>
          
          <div style={{ marginTop: '40px', padding: '20px 0', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <div>&copy; 2026 Mia Librería. All rights reserved.</div>
          </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setIsAddModalOpen(false); }}>
          <div className="modal-content modern-modal" style={{ maxWidth: '400px', textAlign: 'left', padding: '30px' }}>
            <span className="close-btn" style={{position:'absolute', top:'15px', right:'15px', fontSize:'1.5rem', cursor:'pointer'}} onClick={() => setIsAddModalOpen(false)}>&times;</span>
            <h2 className="serif" style={{ margin: '0 0 20px 0' }}>{editingId ? 'Edit Book' : 'Add New Book'}</h2>
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <div className="input-group" style={{ flex: 1 }}><label>Title</label><input value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div className="input-group" style={{ flex: 1 }}><label>Author</label><input value={author} onChange={e => setAuthor(e.target.value)} /></div>
            </div>
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <div className="input-group" style={{ flex: 1 }}><label>Price</label><input value={price} onChange={e => setPrice(e.target.value)} /></div>
              <div className="input-group" style={{ flex: 1 }}><label>Cover URL</label><input value={imageURL} onChange={e => setImageURL(e.target.value)} /></div>
            </div>
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <div className="input-group file-input-group" style={{ flex: 1, padding: '12px' }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Or Upload Cover:</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ fontSize: '0.8rem', width: '100%' }} />
              </div>
              <div className="input-group file-input-group" style={{ flex: 1, padding: '12px' }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>{editingId ? 'Upload New PDF:' : 'Upload PDF (Optional):'}</label>
                <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files[0])} style={{ fontSize: '0.8rem', width: '100%' }} />
              </div>
            </div>
            
            <button className="btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={handleAddBook} disabled={isUploading}>
              {isUploading ? (editingId ? 'Updating...' : 'Uploading & Adding...') : (editingId ? 'Save Changes' : 'Add Book to Library')}
            </button>
          </div>
        </div>
      )}

      {/* View Book Details Modal */}
      {selectedBook && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setSelectedBook(null); }}>
          <div className="modal-content modern-modal" style={{ padding: '40px', textAlign: 'center' }}>
            <span className="close-btn" style={{position:'absolute', top:'15px', right:'15px', fontSize:'1.5rem', cursor:'pointer'}} onClick={() => setSelectedBook(null)}>&times;</span>
            {selectedBook.coverImageURL ? (
              <img src={selectedBook.coverImageURL} style={{ width: '150px', height: '220px', objectFit: 'cover', borderRadius: '4px', marginBottom: '15px', boxShadow: 'var(--shadow-editorial)' }} />
            ) : (
              <div className="placeholder-cover" style={{ width: '150px', height: '220px', margin: '0 auto 15px auto', borderRadius: '4px', boxShadow: 'var(--shadow-editorial)' }}>{selectedBook.title}</div>
            )}
            <h2 className="serif" style={{margin: '0 0 10px 0'}}>{selectedBook.title}</h2>
            <p style={{margin: '0 0 5px 0'}}><b>Author:</b> {selectedBook.author}</p>
            <p style={{margin: '0 0 20px 0', color: 'var(--text-secondary)'}}><b>Price:</b> ${selectedBook.price}</p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => openEditModal(selectedBook)}>Edit</button>
              <button className="btn-secondary" style={{ flex: 1, borderColor: '#e5e5e5', color: '#dc2626' }} onClick={() => { deleteBook(selectedBook.id); setSelectedBook(null); }}>Delete</button>
            </div>
            {selectedBook.pdfURL && (
              <div style={{ marginTop: '10px' }}>
                <a href={selectedBook.pdfURL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ width: '100%' }}>Read PDF</button>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Library;
