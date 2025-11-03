document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const messageDiv = document.getElementById("registerMessage");

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = form.fullName.value.trim();
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const confirmPassword = form.confirmPassword.value.trim();
    const role = document.querySelector('input[name="role"]:checked')?.value;

    messageDiv.textContent = "";
    messageDiv.style.color = "";

    if (!fullName || !username || !email || !password || !confirmPassword || !role) {
      messageDiv.style.color = "red";
      messageDiv.textContent = "❌ Please fill in all fields.";
      return;
    }

    if (password !== confirmPassword) {
      messageDiv.style.color = "red";
      messageDiv.textContent = "❌ Passwords do not match.";
      return;
    }

    if (password.length < 6) {
      messageDiv.style.color = "red";
      messageDiv.textContent = "❌ Password must be at least 6 characters long.";
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, username, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        messageDiv.style.color = "green";
        
        // Different messages based on role
        if (role === "manager") {
          messageDiv.innerHTML = `
            <strong>Registration Successful!</strong><br>
            <span style="font-size: 0.9em;">
              Your organizer account has been created and is pending admin approval. 
              You'll be able to login and create events once an administrator approves your account.
              Redirecting to login...
            </span>
          `;
        } else {
          messageDiv.textContent = data.message || "Registration successful! Redirecting to login...";
        }

        setTimeout(() => {
          window.location.href = "login.html";
        }, 3000); // Longer delay for organizers to read the message
      } else {
        messageDiv.style.color = "red";
        messageDiv.textContent = `❌ ${data.error || "Registration failed."}`;
      }
    } catch (err) {
      messageDiv.style.color = "red";
      messageDiv.textContent = "❌ Network error. Please try again.";
    }
  });
});
