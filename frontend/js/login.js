// document.addEventListener("DOMContentLoaded", function () {
//     const loginForm = document.getElementById("loginForm");

//     if (loginForm) {
//         loginForm.addEventListener("submit", function (event) {
//             event.preventDefault(); // Prevent form submission

//             const username = document.getElementById("username").value.trim();
//             const password = document.getElementById("password").value.trim();
//             const role = document.querySelector('input[name="role"]:checked')?.value;

//             if (!role) {
//                 alert("❌ Please select a role!");
//                 return;
//             }

//             let users = JSON.parse(localStorage.getItem("users")) || [];

//             let user = users.find(u => u.username === username && u.role === role);

//             if (user) {
//                 if (user.password === password) {
//                     alert(`✅ ${role === "user" ? "User" : "Event Manager"} login successful!`);

//                     // Store session
//                     localStorage.setItem("loggedInUser", JSON.stringify(user));

//                     // Redirect based on role
//                     window.location.assign(role === "manager" ? "event-management.html" : "index.html");
//                 } else {
//                     alert("❌ Incorrect password.");
//                 }
//             } else {
//                 // Register new user
//                 const newUser = { username, password, role };
//                 users.push(newUser);
//                 localStorage.setItem("users", JSON.stringify(users));

//                 alert("✅ New user registered! Logging in...");

//                 localStorage.setItem("loggedInUser", JSON.stringify(newUser));

//                 // Redirect based on role
//                 window.location.assign(role === "manager" ? "event-management.html" : "index.html");
//             }
//         });
//     } else {
//         console.error("❌ Login form not found!");
//     }
// });
// document.addEventListener("DOMContentLoaded", () => {
//   const loginForm = document.getElementById("loginForm");
//   const messageDiv = document.getElementById("loginMessage");

//   loginForm.addEventListener("submit", async (event) => {
//     event.preventDefault();

//     const username = document.getElementById("username").value.trim();
//     const password = document.getElementById("password").value.trim();

//     messageDiv.textContent = "";
//     messageDiv.style.color = "";

//     if (!username || !password) {
//       messageDiv.style.color = "red";
//       messageDiv.textContent = "❌ Enter username and password.";
//       return;
//     }

//     try {
//       const response = await fetch("/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // Store username and role
//         localStorage.setItem("loggedInUser", JSON.stringify({ username: data.username, role: data.role }));

//         messageDiv.style.color = "green";
//         messageDiv.textContent = `✅ ${data.role === "user" ? "User" : "Event Manager"} login successful! Redirecting...`;

//         // Redirect based on role
//         setTimeout(() => {
//           if (data.role === "manager") {
//             window.location.href = "event-management.html";
//           } else {
//             window.location.href = "index.html";
//           }
//         }, 1500);
//       } else {
//         messageDiv.style.color = "red";
//         messageDiv.textContent = `❌ ${data.error || "Login failed."}`;
//       }
//     } catch (error) {
//       messageDiv.style.color = "red";
//       messageDiv.textContent = "❌ Network error or server not responding.";
//     }
//   });
// });



document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const messageDiv = document.getElementById("loginMessage");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    messageDiv.textContent = "";
    messageDiv.style.color = "";

    if (!username || !password) {
      messageDiv.style.color = "red";
      messageDiv.textContent = "❌ Enter username and password.";
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login response data:", data);
        console.log("User role:", data.role);
        
        // Store username, role, AND profile fields
        localStorage.setItem("loggedInUser", JSON.stringify({ username: data.username, role: data.role }));
        localStorage.setItem("currentUser", JSON.stringify({ 
          username: data.username, 
          role: data.role,
          fullName: data.fullName,
          email: data.email,
          accountStatus: data.accountStatus
        }));
        localStorage.setItem("profileName", data.fullName);
        localStorage.setItem("profileEmail", data.email);
        localStorage.setItem("profileRole", data.role);

        messageDiv.style.color = "green";
        const roleDisplay = data.role === "user" ? "Attendee" : data.role === "admin" ? "Admin" : "Event Manager";
        messageDiv.textContent = `✅ Welcome back, ${data.fullName || username}! Logging in as ${roleDisplay}...`;

        setTimeout(() => {
          if (data.role === "admin") {
            window.location.href = "admin-dashboard.html";
          } else if (data.role === "manager") {
            window.location.href = "event-management.html";
          } else {
            window.location.href = "home.html";
          }
        }, 1500);
      } else if (response.status === 403) {
        // Handle pending or rejected accounts
        if (data.status === "pending") {
          messageDiv.style.color = "orange";
          messageDiv.innerHTML = `
            <i class="fas fa-clock"></i> <strong>Account Pending Approval</strong><br>
            <span style="font-size: 0.9em;">
              Your organizer account is awaiting admin approval. 
              You'll receive access once an administrator reviews your application.
              Please check back later.
            </span>
          `;
        } else if (data.status === "rejected") {
          messageDiv.style.color = "red";
          messageDiv.innerHTML = `
            ❌ <strong>Account Rejected</strong><br>
            <span style="font-size: 0.9em;">
              Your organizer account application has been rejected. 
              Please contact support if you believe this is an error.
            </span>
          `;
        } else {
          messageDiv.style.color = "red";
          messageDiv.textContent = `❌ ${data.error || data.message || "Access denied."}`;
        }
      } else {
        messageDiv.style.color = "red";
        messageDiv.textContent = `❌ ${data.error || "Login failed."}`;
      }
    } catch (error) {
      messageDiv.style.color = "red";
      messageDiv.textContent = "❌ Network error or server not responding.";
    }
  });
});
