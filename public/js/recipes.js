$(document).ready(() => {
  let selectedFile;
  let storageRef;
  // display user email in header
  $(".member-name").text(localStorage.getItem("userName"));
  $(".food-fact").text(localStorage.getItem("trivia"));
  $(".food-joke").text(localStorage.getItem("joke"));
  let updating = false;
  let recipeID;
  let deleting = false;

  const firebaseConfig = {
    apiKey: "AIzaSyByL1PUuaMDhkAltQxfcyB_9JRlTjHDrvc",
    authDomain: "timeless-recipes.firebaseapp.com",
    databaseURL: "https://timeless-recipes.firebaseio.com",
    projectId: "timeless-recipes",
    storageBucket: "timeless-recipes.appspot.com",
    messagingSenderId: "458595131064",
    appId: "1:458595131064:web:23b7367678f93563595e4d",
    measurementId: "G-N0LYPZJNZS"
  };

  function initiaizeFirebase() {
    firebase.initializeApp(firebaseConfig);
    const storageService = firebase.storage();
    storageRef = storageService.ref();
    firebase.analytics();
  }

  initiaizeFirebase();

  const saveImageFileToVariable = event => {
    selectedFile = event.target.files[0];
  };

  const handleFileUploadSubmit = async () => {
    if (selectedFile) {
      const userId = localStorage.getItem("userId");
      try {
        await storageRef
          .child(`images/${userId}/${selectedFile.name}`)
          .put(selectedFile);
        const url = await storageRef
          .child(`images/${userId}/${selectedFile.name}`)
          .getDownloadURL();
        return url;
      } catch (error) {
        console.log(error);
      }
    }
  };

  const parseRecipesWithSpoonacular = () => {
    return $.ajax({
      url:
        "https://api.spoonacular.com/recipes/parseIngredients?apiKey=4ef67de632354c9c93ca78cbb90d74c2",
      method: "POST",
      data: {
        ingredientList: $("#recipe-ingredients").val(),
        servings: $("#recipe-servings").val()
      }
    });
  };

  const submitNewRecipe = formData => {
    $.post({
      url: "/api/recipe",
      data: formData,
      success: function() {
        $("#sendRecipeButton").prop("disabled", true);
        $("#modal-header").text("Success!");
        $("#modal-body").text("You have added a new recipe to your profile");
        $("#recipeModal").modal("toggle");
        resetFormAfterSubmission();
      },
      error: function(errorThrown) {
        $("#sendRecipeButton").prop("disabled", true);
        $("#modal-header").text("Submission Failed");
        $("#modal-body").text(errorThrown.statusText);
        $("#recipeModal").modal("toggle");
      }
    });
  };

  const resetFormAfterSubmission = () => {
    updating = false;
    recipeID = "";
    $("#recipe-title").val("");
    $("#recipe-instructions").val("");
    $("#recipe-servings").val("");
    $("#recipe-preparation-time").val("");
    $("#recipe-notes").val("");
    $("#recipe-ingredients").val("");
    $("#recipe-image-upload").val("");
  };

  const getAllMyRecipes = () => {
    window.location.assign("/my-recipes");
  };

  const loadNewRecipeForm = () => {
    window.location.assign("/add-recipe");
  };

  const viewRecipeInDetail = id => {
    window.location.assign(`/recipes/${id}`);
  };

  // search by criteria
  const findRecipesUsingCriteria = formData => {
    location.assign(
      `/recipe/search?onlyUserRecipes=${formData.onlyUserRecipes}&searchText=${formData.searchText}`
    );
  };

  const ifDeletingNavigateHome = () => {
    if (deleting) {
      $.get("/recipes-home-page");
    }
  };

  // delete recipe
  const removeRecipe = id => {
    console.log(id);
    $.ajax({
      url: `/api/recipes/${id}`,
      type: "DELETE",
      success: function() {
        $("#modal-header").text("Success!");
        $("#modal-body").text("This recipe has been deleted");
        $("#recipeModal").modal("toggle");
      },
      error: function(errorThrown) {
        $("#modal-header").text("Deletion Failed");
        $("#modal-body").text(errorThrown.statusText);
        $("#recipeModal").modal("toggle");
      }
    });
  };

  // get detalils to update recipe
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

  // update recipe
  const submitUpdatedRecipe = formData => {
    $.put("/api/recipe/" + formData.id, formData).then(
      resetFormAfterSubmission()
    );
  };

  // display form to add a new recipe
  $("#addNewRecipeButton").on("click", event => {
    event.preventDefault();
    updating = false;
    loadNewRecipeForm();
  });

  $("#viewAllRecipesButton").on("click", event => {
    event.preventDefault();
    getAllMyRecipes();
  });

  const mandatoryFieldsPopulated = formData => {
    if (
      formData.title &&
      formData.title.trim().length &&
      formData.instructions &&
      formData.instructions.trim().length &&
      formData.ingredients &&
      formData.ingredients.trim().length &&
      formData.servings &&
      formData.servings >= $("#recipe-servings").attr("min") &&
      formData.preparationTime &&
      formData.preparationTime >= $("#recipe-preparation-time").attr("min")
    ) {
      return true;
    }
    return false;
  };

  $("#sendRecipeButton").on("click", async event => {
    const formData = {
      title: $("#recipe-title").val(),
      instructions: $("#recipe-instructions").val(),
      ingredients: $("#recipe-ingredients").val(),
      servings: $("#recipe-servings").val(),
      preparationTime: $("#recipe-preparation-time").val(),
      notes: $("#recipe-notes").val()
    };
    if (mandatoryFieldsPopulated(formData)) {
      event.preventDefault();
      $("#sendRecipeButton").prop("disabled", true);
      const ingredientResponse = await parseRecipesWithSpoonacular();
      const separatedIngredients = await ingredientResponse.map(item => {
        return {
          title: item.originalName,
          quantity: item.amount,
          units: item.unitShort
        };
      });
      formData.ingredients = separatedIngredients;
      const recipeURL = await handleFileUploadSubmit();
      if (recipeURL) {
        formData.imageUrl = recipeURL;
      } else {
        formData.imageUrl = "/images/e-logo-placeholder.png";
      }
      if (updating) {
        formData.id = recipeID;
        submitUpdatedRecipe(formData);
      } else {
        submitNewRecipe(formData);
      }
    }
  });

  $("#searchForRecipeButton").on("click", event => {
    event.preventDefault();
    const formData = {
      onlyUserRecipes:
        $("input[name='recipesToSearch']:checked").val() === "my-recipes"
          ? true
          : false,
      searchText: $("#searchTerm").val()
    };
    if (!formData.searchText) {
      $("#modal-header").text("Error: ");
      $("#modal-body").text("You must enter a title or ingredient to search");
      $("#recipeModal").modal("toggle");
    } else {
      findRecipesUsingCriteria(formData);
    }
  });

  // request details of particular recipe from database
  $(".viewRecipeButton").click(event => {
    event.preventDefault();
    viewRecipeInDetail($(event.target).attr("viewid"));
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
    deleting = true;
    removeRecipe($(event.target).attr("deleteId"));
  });

  $("#recipe-image-upload").on("change", saveImageFileToVariable);
  $("#recipeModal").on("hide.bs.modal", ifDeletingNavigateHome);
});
