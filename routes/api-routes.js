// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");
// Requiring our custom middleware for checking if a user is logged in
const isAuthenticated = require("../config/middleware/isAuthenticated");
// require to create/get/update recipes
const ru = require("./routesUtil");
const multer = require("multer");
const axios = require("axios");
const upload = multer({ dest: "./temp/uploads/" });
require("dotenv").config();
module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Sending back a password, even a hashed password, isn't a good idea
    res.json({
      email: req.user.email,
      id: req.user.id
    });
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", (req, res) => {
    db.User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })
      .then(() => {
        res.redirect(307, "/api/login");
      })
      .catch(err => {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", (req, res) => {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        username: req.user.username,
        email: req.user.email,
        id: req.user.id
      });
    }
  });

  // route to create new recipe
  app.post(
    "/api/recipe",
    isAuthenticated,
    upload.single("recipeImage"),
    async (request, response) => {
      const statusCode = await ru.createRecipe(request);
      response.status(statusCode).end();
    }
  );
  // route to update existing recipe
  app.put(
    "/api/recipe/:id",
    isAuthenticated,
    upload.single("recipeImage"),
    async (request, response) => {
      const statusCode = await ru.updateRecipe(request);
      response.status(statusCode).end();
    }
  );
  // delete route
  app.delete("/api/recipes/:id", isAuthenticated, async (request, response) => {
    const statusCode = await ru.deleteRecipe(request);
    response.status(statusCode).end();
  });
  // wrapper get route around spoonacular API to get food fact
  app.get("/food-fact", async (request, response) => {
    const apiKeyFoodFact = process.env.API_KEY_TRIVA_JOKE;
    axios
      .get(
        `https://api.spoonacular.com/food/trivia/random?apiKey=${apiKeyFoodFact}`
      )
      .then(res => {
        response.json(res.data.text);
      })
      .catch(error => console.log("Error", error));
  });

  // wrapper get route around spoonacular API to get food joke
  app.get("/food-joke", async (request, response) => {
    const apiKeyFoodJoke = process.env.API_KEY_TRIVA_JOKE;
    axios
      .get(
        `https://api.spoonacular.com/food/jokes/random?apiKey=${apiKeyFoodJoke}`
      )
      .then(res => {
        response.json(res.data.text);
      })
      .catch(error => console.log("Error", error));
  });

  // get route to randomly pick one of the recipe with image as recipe of the day
  app.get("/recipe-of-the-day", async (request, response) => {
    const recipeDetail = await ru.getRecipeOfTheDay();
    recipeDetail ? response.json(recipeDetail) : response.status(500).end();
  });
};
