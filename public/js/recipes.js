$(document).ready(() => {
  let selectedFile;
  // display user name in header
  $(".member-name").text(localStorage.getItem("userName"));
  $(".food-fact").text(localStorage.getItem("trivia"));
  $(".food-joke").text(localStorage.getItem("joke"));
  const recipeOfTheDay = JSON.parse(localStorage.getItem("recipe-of-the-day"));
  $("#recipeOfTheDayPrepTime").text(`${recipeOfTheDay.preparationTime} mins`);
  $("#recipeOfTheDayTitle").text(recipeOfTheDay.title);
  $("#recipeOfTheDayPicture").attr("src", recipeOfTheDay.imageUrl);
  $("#recipeOfTheDayViewButton").attr("viewId", recipeOfTheDay.id);
  let recipeID;
  let deleting = false;
  let updating = false;
  const updatesToRecipe = {};

  const saveImageFileToVariable = event => {
    selectedFile = event.target.files[0];
  };

  const prepareFormData = data => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("instructions", data.instructions);
    formData.append("ingredients", data.ingredients);
    formData.append("servings", data.servings);
    formData.append("preparationTime", data.preparationTime);
    formData.append("notes", data.notes);
    if (selectedFile) {
      formData.append("recipeImage", selectedFile, selectedFile.name);
    }
    return formData;
  };

  const submitNewRecipe = data => {
    const formData = prepareFormData(data);
    $.post({
      url: "/api/recipe",
      data: formData,
      contentType: false,
      cache: false,
      processData: false,
      success: function() {
        $("#sendRecipeButton").prop("disabled", false);
        $("#modal-header").text("Success!");
        $("#modal-body").text("You have added a new recipe to your profile");
        $("#recipeModal").modal("toggle");
        resetFormAfterSubmission();
      },
      error: function(errorThrown) {
        $("#sendRecipeButton").prop("disabled", false);
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

  const ifChangeDoneReloadPage = () => {
    if (deleting) {
      deleting = false;
      location.reload();
    } else if (updating) {
      location.assign(`/recipes/${updatesToRecipe.id}`);
    }
  };

  // delete recipe
  const removeRecipe = id => {
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
    location.assign(`/edit-recipe/${id}`);
  };

  // update recipe
  const submitUpdatedRecipe = updatesToRecipe => {
    const formData = prepareFormData(updatesToRecipe);
    $.ajax({
      url: `/api/recipe/${updatesToRecipe.id}`,
      type: "PUT",
      data: formData,
      contentType: false,
      cache: false,
      processData: false,
      success: function() {
        $("#updateRecipeButton").prop("disabled", false);
        $("#modal-header").text("Success!");
        $("#modal-body").text("You have successfully updated your recipe");
        $("#recipeModal").modal("toggle");
      },
      error: function(errorThrown) {
        $("#updateRecipeButton").prop("disabled", false);
        $("#modal-header").text("Update Failed");
        $("#modal-body").text(errorThrown.statusText);
        $("#recipeModal").modal("toggle");
      }
    });
  };

  const checkForNullFieldsUpdating = updatesToRecipe => {
    const result = Object.keys(updatesToRecipe).every(key => {
      switch (key) {
        case "notes":
          return true;
        default:
          if (updatesToRecipe[key] === "") {
            return false;
          }
          return true;
      }
    });
    return result;
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

  $("#sendRecipeButton").on("click", event => {
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
      $("#modal-header").text("Adding Your Recipe...");
      $("#modal-body").text(`<img src="/images/e-logo.gif" alt="e-logo gif"
          style="height: 52px; width: 216px; display: block; margin: auto;">`);
      $("#recipeModal").modal("toggle");
      submitNewRecipe(formData);
    }
  });

  $("#updateRecipeButton").on("click", async event => {
    if (checkForNullFieldsUpdating(updatesToRecipe)) {
      event.preventDefault();
      $("#updateRecipeButton").prop("disabled", true);
      // add ID
      updatesToRecipe.id = $(event.target).attr("recipeId");
      updating = true;
      $("#modal-header").text("Updating Your Recipe...");
      $("#modal-body").text(`<img src="/images/e-logo.gif" alt="e-logo gif"
          style="height: 52px; width: 216px; display: block; margin: auto;">`);
      $("#recipeModal").modal("toggle");
      submitUpdatedRecipe(updatesToRecipe);
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
  $("#recipeModal").on("hide.bs.modal", ifChangeDoneReloadPage);
  $("form :input").change(() => {
    updatesToRecipe[event.target.name] = event.target.value
      ? event.target.value
      : "";
    if (event.target.name === "ingredients") {
      updatesToRecipe.servings = $("#recipe-servings").val();
    }
  });
});
