/* REGISTER USER */
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = {
      username: document.getElementById("username").value,
      password: document.getElementById("password").value
    };

    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      window.location.href = "login.html";
    }
  });
}

/* LOGIN USER */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = {
      username: document.getElementById("username").value,
      password: document.getElementById("password").value
    };

    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "index.html";
    }
  });
}

/* FETCH BLOGS */
async function loadBlogs() {
  const res = await fetch("http://localhost:3000/blogs");
  const blogs = await res.json();

  const currentUser = Number(JSON.parse(localStorage.getItem("user"))?.id);
  const blogList = document.getElementById("blogList");
  if (!blogList) return;

  blogList.innerHTML = "";

  blogs.forEach(blog => {
    const likesArray = Array.isArray(blog.likes) ? blog.likes : JSON.parse(blog.likes || "[]");
    const liked = likesArray.includes(currentUser);

    blogList.innerHTML += `
      <div class="blog-card">
        <h2>${blog.title}</h2>
        <p>${blog.content}</p>

        <button class="like-btn" data-id="${blog.id}" onclick="likeBlog(${blog.id})">
          ${liked ? "❤️" : "🤍"} ${likesArray.length}
        </button>
      </div>
    `;
  });
}

/* LIKE / UNLIKE BLOG */
async function likeBlog(id) {
  const currentUser = Number(JSON.parse(localStorage.getItem("user"))?.id);

  const res = await fetch(`http://localhost:3000/blogs/${id}/like`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: currentUser })
  });

  const result = await res.json();

  const btn = document.querySelector(`button[data-id="${id}"]`);
  if (btn) btn.innerHTML = `${result.liked ? "❤️" : "🤍"} ${result.count}`;
}

/* LOGOUT */
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

/* CREATE BLOG */
document.getElementById("createBlogForm")?.addEventListener("submit", async function(e) {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const res = await fetch("http://localhost:3000/blogs/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      content,
      user_id: userId
    })
  });

  const message = await res.text();
  alert(message);

  window.location.href = "index.html";
});

/* HAMBURGER MENU */
document.addEventListener("DOMContentLoaded", () => {

  const hamburger = document.getElementById("hamburger");
  const dropdown = document.getElementById("dropdown");
  const createBtn = document.getElementById("createBtn");

  if (hamburger) {
    hamburger.onclick = () => {
      dropdown.classList.toggle("hidden");
    };
  }

  if (createBtn) {
    createBtn.onclick = () => {
      const user = localStorage.getItem("user");

      if (!user) {
        alert("You must login/register to post a blog");
        window.location.href = "login.html";
        return;
      }

      window.location.href = "create.html";
    };
  }
});

/* LOAD PROFILE */
async function loadProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const pUsername = document.getElementById("p_username");
  if (pUsername) pUsername.innerText = user.username;

  const res = await fetch(`http://localhost:3000/profile/${user.id}`);
  const data = await res.json();

  const pBlogs = document.getElementById("p_blogs");
  const pLikes = document.getElementById("p_likes");
  const userBlogsContainer = document.getElementById("userBlogs");

  if (pBlogs) pBlogs.innerText = data.totalBlogs ?? 0;
  if (pLikes) pLikes.innerText = data.totalLikes ?? 0;

  if (userBlogsContainer) {
    userBlogsContainer.innerHTML = "";
    (data.blogs || []).forEach(blog => {
      const likesArray = Array.isArray(blog.likes) ? blog.likes : JSON.parse(blog.likes || "[]");
      userBlogsContainer.innerHTML += `
        <div class="blog-card" data-id="${blog.id}">
          <h3>${blog.title}</h3>
          <p>${blog.content}</p>
          <p>❤️ ${likesArray.length}</p>
          <button class="edit-btn" onclick="editBlog(${blog.id})" style="color:white;">Edit</button>
          <button class="delete-btn" onclick="deleteBlog(${blog.id})" style="color:white;">Delete</button>
        </div>
      `;
    });
  }
}

/* EDIT BLOG */
function editBlog(id) {
  const card = document.querySelector(`.blog-card[data-id='${id}']`);
  if (!card) return;

  const titleEl = card.querySelector("h3");
  const contentEl = card.querySelector("p");

  const currentTitle = titleEl.innerText;
  const currentContent = contentEl.innerText;

  titleEl.innerHTML = `<input type="text" id="editTitle${id}" value="${currentTitle}" style="width:100%;">`;
  contentEl.innerHTML = `<textarea id="editContent${id}" style="width:100%;">${currentContent}</textarea>`;

  const editBtn = card.querySelector(".edit-btn");
  editBtn.innerText = "Save";
  editBtn.onclick = () => saveBlog(id);
}

/* SAVE BLOG */
function saveBlog(id) {
  const newTitle = document.getElementById(`editTitle${id}`).value;
  const newContent = document.getElementById(`editContent${id}`).value;

  if (!newTitle || !newContent) {
    alert("Title or content cannot be empty!");
    return;
  }

  fetch(`http://localhost:3000/blogs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newTitle, content: newContent })
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    loadProfile();
  });
}

/* DELETE BLOG */
function deleteBlog(id) {
  if (!confirm("Are you sure you want to delete this blog?")) return;

  fetch(`http://localhost:3000/blogs/${id}`, { method: "DELETE" })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      loadProfile();
    });
}

/* AUTO LOADS */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("blogList")) loadBlogs();
  if (document.getElementById("p_username")) loadProfile();
});
