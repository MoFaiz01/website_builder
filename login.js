document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error");
  
    // Allow any username and password, as long as they are not empty
    if (username && password) {
      // Optional: store username
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("user", username); // Save username if needed
      window.location.href = "builder.html";
    } else {
      errorMsg.textContent = "Please enter both username and password.";
    }
  });
  