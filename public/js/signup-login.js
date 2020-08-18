$(document).ready(() => {
  // Getting references to our sign up form and input
  const signUpForm = $("form.signup");
  const signUpUsername = $("input#username-input");
  const signUpEmailInput = $("input#signup-email-input");
  const signUpPasswordInput = $("input#signup-password-input");

  // When the signup button is clicked, we validate the email and password are not blank
  signUpForm.on("submit", event => {
    event.preventDefault();
    const userData = {
      username: signUpUsername.val().trim(),
      email: signUpEmailInput.val().trim(),
      password: signUpPasswordInput.val().trim()
    };

    console.log(userData);

    if (!userData.username || !userData.email || !userData.password) {
      return;
    }
    // If we have an email and password, run the signUpUser function
    signUpUser(userData.username, userData.email, userData.password);
    signUpUsername.val("");
    signUpEmailInput.val("");
    signUpPasswordInput.val("");
  });

  // Does a post to the signup route. If successful, we are redirected to the recipe homepage page
  // Otherwise we log any errors
  function signUpUser(username, email, password) {
    $.post("/api/signup", {
      username: username,
      email: email,
      password: password
    })
      .then(() => {
        $.get("/api/user_data").then(data => {
          localStorage.setItem("userName", data.username);
          localStorage.setItem("userEmail", data.email);
          localStorage.setItem("userId", data.id);
        });
        window.location.replace("/recipes-home-page");
        // If there's an error, handle it by throwing up a bootstrap alert
      })
      .catch(handleLoginErr);
  }

  function handleLoginErr(err) {
    $("#alert .msg").text(err.responseJSON);
    $("#alert").fadeIn(500);
  }

  // Getting references to our log in form and input
  const loginForm = $("form.login");
  const loginEmailInput = $("input#login-email-input");
  const loginPasswordInput = $("input#login-password-input");

  // When the form is submitted, we validate there's an email and password entered
  loginForm.on("submit", event => {
    event.preventDefault();
    const userData = {
      email: loginEmailInput.val().trim(),
      password: loginPasswordInput.val().trim()
    };

    if (!userData.email || !userData.password) {
      return;
    }

    // If we have an email and password we run the loginUser function and clear the form
    loginUser(userData.email, userData.password);
    loginEmailInput.val("");
    loginPasswordInput.val("");
  });

  // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
  function loginUser(email, password) {
    $.post("/api/login", {
      email: email,
      password: password
    })
      .then(() => {
        $.get("/api/user_data").then(data => {
          localStorage.setItem("userName", data.username);
          localStorage.setItem("userEmail", data.email);
          localStorage.setItem("userId", data.id);
        });
        window.location.replace("/recipes-home-page");
        // If there's an error, log the error
      })
      .catch(err => {
        console.log(err);
      });
  }
});
