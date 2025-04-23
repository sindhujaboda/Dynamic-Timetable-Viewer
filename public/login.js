document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Mock authentication (replace with backend API)
    if (username === "admin" && password === "admin123") {
        alert("Admin login successful!");
        window.location.href = "admin.html";
    } else {
        alert("Invalid username or password.");
    }
});
