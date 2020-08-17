$(document).ready(() => {
  let updating = false;
  let recipeID;

  // get food fact for homepage
  $.get(
    "https://api.spoonacular.com/food/trivia/random?apiKey=bdfbfd72f72a4581a44198a9ce8cf3f5"
  ).then(response => console.log(response));

  // get food joke for homepage
  $.get(
    "https://api.spoonacular.com/food/jokes/random?apiKey=bdfbfd72f72a4581a44198a9ce8cf3f5"
  ).then(response => console.log(response));

  // check for information in local storange regarding divs to show when page loads
  const idToShow = localStorage.getItem("show");
  if (idToShow) {
    $(`${idToShow}`).show();
    localStorage.removeItem("show");
  }

  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page
  $.get("/api/user_data").then(data => {
    $(".member-name").text(data.email);
  });

  // display form to add a new recipe
  $("#addNewRecipeButton").on("click", event => {
    event.preventDefault();
    updating = false;
    console.log("updating: " + updating);
    $("#newRecipeForm").show();
    $("#appendSearchItemsHere").hide();
    $("#searchForRecipeForm").hide();
    $("#detailedRecipeViewHere").hide();
  });

  $("#viewAllRecipesButton").on("click", event => {
    event.preventDefault();
    getAllMyRecipes();
  });

  // display form to search for a recipe
  $("#searchForRecipeButton").on("click", event => {
    event.preventDefault();
    $("#newRecipeForm").hide();
    $("#appendSearchItemsHere").hide();
    $("#searchForRecipeForm").show();
    $("#detailedRecipeViewHere").show();
  });

  // hide all of the divs above
  $(".close").on("click", event => {
    event.preventDefault();
    $("#newRecipeForm").hide();
    $("#appendSearchItemsHere").hide();
    $("#searchForRecipeForm").hide();
    $("#detailedRecipeViewHere").hide();
  });

  const clearFormFields = () => {
    $("#recipe-title").val("");
    $("#recipe-instructions").val("");
    $("#recipe-servings").val("");
    $("#recipe-preparation-time").val("");
    $("#recipe-notes").val("");
    $("#recipe-ingredients").val("");
  };

  const getAllMyRecipes = () => {
    $.get("/my-recipes").then(() => {
      localStorage.setItem("show", "#appendSearchItemsHere");
      window.location.replace("/my-recipes");
    });
  };

  const submitNewRecipe = formData => {
    $.post("/api/recipe", formData).then(response => console.log(response));
  };

  const submitUpdatedRecipe = formData => {
    $.put("/api/recipe/" + formData.id, formData).then(
      console.log("submitted")
    );
  };

  const findRecipesUsingCriteria = formData => {
    $.get("/recipe/search", formData).then(response => console.log(response));
  };

  const viewRecipeInDetail = id => {
    $.get(`/recipes/${id}`).then(() => {
      localStorage.setItem("show", "#detailedRecipeViewHere");
      window.location.replace(`/recipes/${id}`);
    });
  };

  const getRecipeDetailsToUpdate = id => {
    $.get(`/api/recipes/${id}`).then(response => {
      $("#recipe-title").val(response.title);
      $("#recipe-ingredients").val(response.ingredients);
      $("#recipe-instructions").val(response.instructions);
      $("#recipe-servings").val(response.servings);
      $("#recipe-preparation-time").val(response.preparationTime);
      $("#recipe-notes").val(response.notes);
    });
  };

  const removeRecipe = id => {
    $.delete(`/api/recipes/${id}`).then(response => console.log(response));
  };

  const parseRecipesWithSpoonacular = () => {
    return $.ajax({
      url:
        "https://api.spoonacular.com/recipes/parseIngredients?apiKey=bdfbfd72f72a4581a44198a9ce8cf3f5",
      method: "POST",
      data: {
        ingredientList: $("#recipe-ingredients").val(),
        servings: $("#recipe-servings").val()
      }
    });
  };

  $("#sendRecipeButton").on("click", async event => {
    event.preventDefault();
    $("#newRecipeForm").hide();
    // ajax request to spoonacular
    const ingredientResponse = await parseRecipesWithSpoonacular();
    const separatedIngredients = await ingredientResponse.map(item => {
      return {
        title: item.originalName,
        quantity: item.amount,
        units: item.unitShort
      };
    });
    const formData = {
      title: $("#recipe-title").val(),
      instructions: $("#recipe-instructions").val(),
      ingredients: separatedIngredients,
      servings: $("#recipe-servings").val(),
      preparationTime: $("#recipe-preparation-time").val(),
      notes: $("#recipe-notes").val()
    };
    if (updating) {
      formData.id = recipeID;
      submitUpdatedRecipe(formData);
    } else {
      submitNewRecipe(formData);
    }
    updating = false;
    recipeID = "";
    clearFormFields();
  });

  $("#searchRecipeButton").on("click", event => {
    event.preventDefault();
    const formData = {
      location: $("input[name='recipesToSearch']:checked").val(),
      content: $("#searchTerm").val()
    };
    findRecipesUsingCriteria(formData);
  });

  // request details of particular recipe from database
  $(".viewRecipeButton").click(event => {
    event.preventDefault();
    viewRecipeInDetail($(event.target).attr("viewId"));
  });

  // get details of recipe ready to render on form for editing
  $(".editRecipeButton").click(event => {
    event.preventDefault();
    updating = true;
    recipeID = $(event.target).attr("editId");
    getRecipeDetailsToUpdate(recipeID);
  });

  // sending a delete request for a recipe id
  $(".deleteRecipeButton").click(event => {
    event.preventDefault();
    removeRecipe($(event.target).attr("deleteId"));
  });
});
