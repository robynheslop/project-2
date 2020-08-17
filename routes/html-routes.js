/* eslint-disable indent */
/* eslint-disable prettier/prettier */
// Requiring path to so we can use relative routes to our HTML files
// const path = require("path");

// Requiring our custom middleware for checking if a user is logged in
const isAuthenticated = require("../config/middleware/isAuthenticated");
// require to create/get/update recipes
const ru = require("./routesUtil");

module.exports = function(app) {
    app.get("/", (req, res) => {
        // If the user already has an account send them to the members page
        if (req.user) {
            // res.redirect("/members");
            res.render("recipes");
        }
        // res.sendFile(path.join(__dirname, "../public/signup.html"));
        res.render("signup-login");
    });

    app.get("/signup-login", (req, res) => {
        // If the user already has an account send them to the members page
        if (req.user) {
            // res.redirect("/members");
            res.render("recipes");
        }
        // res.sendFile(path.join(__dirname, "../public/login.html"));
        res.render("signup-login");
    });


  app.get("/recipes-home-page", isAuthenticated, (request, response) => {
    response.render("recipes");
  });

  // Here we've add our isAuthenticated middleware to this route.
  // If a user who is not logged in tries to access this route they will be redirected to the signup page
  app.get("/my-recipes", isAuthenticated, async (request, response) => {
    const recipeData = await ru.getAllRecipesForCurrentUser(request);
    response.render("recipes", { recipe: recipeData });
  });

  app.get("/recipes/:id", isAuthenticated, async (request, response) => {
    const recipeDetails = await ru.getRecipeDetails(request);
    console.log(recipeDetails);
    response.render("recipes", { recipeDetails: recipeDetails });
  });
};

