import { url } from '../JS/metadata.js'

const bookList = document.getElementById("bookList");

// 🔄 Fetch and display books
async function getBooks() {
  const res = await fetch(`${url}/books.json`);
  const data = await res.json();

  bookList.innerHTML = "";
  for (let id in data) {
    const book = data[id];
    bookList.innerHTML += `
      <div class="book-card">
        <img src="${book.coverImageURL}" alt="${book.title}">
        <h3>${book.title}</h3>
        <p><b>Author:</b> ${book.author}</p>
        <p><b>Price:</b> $${book.price}</p>
        <div class="book-card-actions">
          <button onclick="updateAuthor('${id}')">Update Author</button>
          <button onclick="deleteBook('${id}')">Delete</button>
          <button onclick="viewDetails('${book.title}', '${book.author}', '${book.price}', '${book.coverImageURL}')">View Details</button>
        </div>
      </div>
    `;
  }
}

// ➕ Add new book
window.addBook = async function () {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const price = document.getElementById("price").value;
  const imageURL = document.getElementById("imageURL").value;

  if (!title || !author || !price) {
      alert("Please fill in the title, author, and price!");
      return;
  }

  const book = { title, author, price, coverImageURL: imageURL };

  const res = await fetch(`${url}/books.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book)
  });

  if (res.ok) {
    console.log("Book added successfully!");
    getBooks(); // refresh list
  } else {
    console.error("Failed to add book", await res.text());
  }

  // Clear form
  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
  document.getElementById("price").value = "";
  document.getElementById("imageURL").value = "";
};

// ✏️ Update author
window.updateAuthor = async function (id) {
  const newAuthor = prompt("Enter new author name:");
  if (newAuthor) {
    await fetch(`${url}/books/${id}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: newAuthor })
    });
    getBooks();
  }
};

// 🗑️ Delete book
window.deleteBook = async function (id) {
  await fetch(`${url}/books/${id}.json`, {
    method: "DELETE"
  });
  getBooks();
};

// 🚀 Initial load
getBooks();

// 🔍 View Details Modal
window.viewDetails = function(title, author, price, imageURL) {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalAuthor").innerHTML = `<b>Author:</b> ${author}`;
  document.getElementById("modalPrice").innerHTML = `<b>Price:</b> $${price}`;
  
  const modalImg = document.getElementById("modalImage");
  if (imageURL && imageURL !== 'undefined') {
    modalImg.src = imageURL;
    modalImg.style.display = "block";
  } else {
    modalImg.style.display = "none";
  }

  const modal = document.getElementById("detailsModal");
  modal.style.display = "flex";
};

window.closeModal = function() {
  document.getElementById("detailsModal").style.display = "none";
};

// Close modal if clicked outside content
window.onclick = function(event) {
  const modal = document.getElementById("detailsModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};