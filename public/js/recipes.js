$(document).ready(() => {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page
  $.get("/api/user_data").then(data => {
    $(".member-name").text(data.email);
  });

  // display form to add a new recipe
  $("#addNewRecipeButton").on("click", event => {
    event.preventDefault();
    $("#newRecipeForm").show();
    $("#appendSearchItemsHere").hide();
    $("#searchForRecipeForm").hide();
  });

  $("#viewAllRecipesButton").on("click", event => {
    event.preventDefault();
    // display div where all recipes are rendered
    $("#appendSearchItemsHere").show();
    $("#newRecipeForm").hide();
    $("#searchForRecipeForm").hide();
    // ajax call to get all recipes
    $.get("/api/recipes").then(response => console.log(response));
  });

  // display form to search for a recipe
  $("#searchForRecipeButton").on("click", event => {
    event.preventDefault();
    $("#newRecipeForm").hide();
    $("#appendSearchItemsHere").hide();
    $("#searchForRecipeForm").show();
  });

  // hide all of the divs above
  $(".close").on("click", event => {
    event.preventDefault();
    $("#newRecipeForm").hide();
    $("#appendSearchItemsHere").hide();
    $("#searchForRecipeForm").hide();
  });

  $("#sendRecipeButton").on("click", event => {
    event.preventDefault();
    // hide form
    $("#newRecipeForm").hide();
    // pull values from form and save in object for post request
    const formData = {
      title: $("#recipe-title").val(),
      instructions: $("#recipe-instructions").val(),
      servings: $("#recipe-servings").val(),
      preparationTime: $("#recipe-preparation-time").val(),
      notes: $("#recipe-notes").val()
    };
    // ajax request to spoonacular
    $.ajax({
      url:
        "https://api.spoonacular.com/recipes/parseIngredients?apiKey=bdfbfd72f72a4581a44198a9ce8cf3f5",
      method: "POST",
      data: {
        ingredientList: $("#recipe-ingredients").val(),
        servings: $("#recipe-servings").val()
      }
    }).then(response => {
      // map over response and save the name, amount and serving in an object to the array separated ingredients
      const separatedIngredients = response.map(item => {
        return {
          title: item.originalName,
          quantity: item.amount,
          units: item.unitShort
        };
      });
      console.log(separatedIngredients);
      // add this array to formData
      formData.ingredients = separatedIngredients;
      // post formData
      $.post("/api/recipe", formData).then(result => console.log(result));
      // clear form fields
      $("#recipe-title").val("");
      $("#recipe-instructions").val("");
      $("#recipe-servings").val("");
      $("#recipe-preparation-time").val("");
      $("#recipe-notes").val("");
      $("#recipe-ingredients").val("");
    });
  });

  $("#searchRecipeButton").on("click", event => {
    event.preventDefault();
    const formData = {
      location: $("input[name='recipesToSearch']:checked").val(),
      content: $("#searchTerm").val()
    };
    $.get("/api/search", {
      body: formData
    }).then(response => console.log(response));
  });

  // request details of particular recipe from database
  $(".viewRecipeButton").click(event => {
    event.preventDefault();
    $.ajax({
      url: `/api/recipes/${event.target.id}`,
      type: "GET",
      success: function(result) {
        console.log(result);
      }
    });
  });

  // get details of recipe ready to render on form for editing
  $(".editRecipeButton").click(event => {
    event.preventDefault();
    $.ajax({
      url: `/api/recipes/${event.target.id}`,
      type: "GET",
      success: function(result) {
        console.log(result);
      }
    });
  });

  // sending a delete request for a recipe id
  $(".deleteRecipeButton").click(event => {
    event.preventDefault();
    $.ajax({
      url: `/api/recipes/${event.target.id}`,
      type: "DELETE",
      success: function(result) {
        console.log(result);
      }
    });
  });
});
