const loader = document.getElementById("loader");
const main = document.getElementById("main");
const formTitle = document.getElementById("form-title");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const actionBtn = document.getElementById("action-btn");
const switchLink = document.getElementById("switch-link");
const errorMsg = document.getElementById("error-msg");
const messageMsg = document.getElementById("message-msg");
const forgotPassword = document.getElementById("forgot-password");

let isSignUp = false;

// Always show loader on page visit
window.addEventListener("load", () => {
  loader.classList.remove("hidden");
  main.classList.add("hidden");

  setTimeout(() => {
    const user = auth.currentUser;
    if (user) {
      // Logged in → redirect to home page
      window.location.href = "../main.html"; 
    } else {
      // Not logged in → show login form
      loader.classList.add("hidden");
      main.classList.remove("hidden");
    }
  }, 1500); // loader duration
});

// Toggle Sign In / Sign Up
switchLink.addEventListener("click", () => {
  isSignUp = !isSignUp;
  if (isSignUp) {
    formTitle.textContent = "Sign Up";
    nameInput.classList.remove("hidden");
    actionBtn.textContent = "Sign Up";
    switchLink.textContent = "Sign In";
    switchLink.parentElement.firstChild.textContent = "Already have an account? ";
  } else {
    formTitle.textContent = "Sign In";
    nameInput.classList.add("hidden");
    actionBtn.textContent = "Sign In";
    switchLink.textContent = "Sign Up";
    switchLink.parentElement.firstChild.textContent = "Don't have an account? ";
  }
  errorMsg.textContent = "";
  messageMsg.textContent = "";
});

// Sign Up / Sign In
actionBtn.addEventListener("click", async () => {
  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  errorMsg.textContent = "";
  messageMsg.textContent = "";

  try {
    if (isSignUp) {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      await user.updateProfile({ displayName: name });
      await db.collection("users").doc(user.uid).set({ name, email });
      showLoaderThenRedirect();
    } else {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      showLoaderThenRedirect();
    }
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});

// Show loader then redirect to home page
function showLoaderThenRedirect() {
  main.classList.add("hidden");
  loader.classList.remove("hidden");
  setTimeout(() => {
    window.location.href = "home.html"; // Replace with your home page
  }, 2000);
}

// Forgot Password functionality
forgotPassword.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  errorMsg.textContent = "";
  messageMsg.textContent = "";

  if (!email) {
    errorMsg.textContent = "Please enter your email to reset password.";
    return;
  }

  try {
    loader.classList.remove("hidden");
    main.classList.add("hidden");

    await auth.sendPasswordResetEmail(email);

    setTimeout(() => {
      loader.classList.add("hidden");
      main.classList.remove("hidden");
      messageMsg.textContent = "Password reset email sent! Check your inbox.";
    }, 1500);
  } catch (err) {
    loader.classList.add("hidden");
    main.classList.remove("hidden");
    errorMsg.textContent = err.message;
  }
});
