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
      perparationTime: $("#recipe-preparation-time").val(),
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
      // add this array to formData
      formData.ingredients = separatedIngredients;
      // post formData
      $.post("/api/addRecipe", {
        body: formData
      }).then(result => console.log(result));
      // clear form fields
      $("#newRecipeForm").reset();
    });
  });
});
