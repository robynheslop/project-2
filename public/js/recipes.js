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
  let deleting = false;
  let updating = false;
  const updatesToRecipe = {};

  // taking target file and storing in saved variable
  const saveImageFileToVariable = event => {
    selectedFile = event.target.files[0];
  };

  // parameter of data
  // creates a new form data object
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

  // parameter = recipe data. creates new FormData object with it
  // posts this to /api/recipe
  // success/failure triggers modals
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

  // clear form fields following successful submission of recipe
  const resetFormAfterSubmission = () => {
    $("#recipe-title").val("");
    $("#recipe-instructions").val("");
    $("#recipe-servings").val("");
    $("#recipe-preparation-time").val("");
    $("#recipe-notes").val("");
    $("#recipe-ingredients").val("");
    $("#recipe-image-upload").val("");
  };

  // activated after modal closes. If the previous action was delete, it reloads location
  // if the previous action was to update a recipe, location is changed to /recipes/:id
  // which renders a detailed view of the recipe just updated (and clears all data in updatedRecipe)
  const ifChangeDoneReloadPage = () => {
    if (deleting) {
      deleting = false;
      location.reload();
    } else if (updating) {
      updating = false;
      location.assign(`/recipes/${updatesToRecipe.id}`);
    }
  };

  // receives ID of recipe to delete
  // Sucess/failure of request triggers modal
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

  // makes updatesToRecipes into a FormData object
  // then makes a put request with it
  // succes/failure triggers modal message
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

  // receives the variable updatesToRecipe, a collection of changes to form when editing recipe
  // it checks that each key found in this object is not null
  // with the exception of notes, which is not a mandatory field.
  // if null fields are found, it returns false
  // otherwise, it returns true
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

  // Generic loading modal: no header
  const loadingModal = () => {
    $("#modal-body").html(
      "<img src='/images/e-logo.gif' alt='e-logo gif' style='height: 52px; width: 216px; display: block; margin: auto;'>"
    );
    $("#recipeModal").modal("toggle");
  };

  // add event listener to add recipe button
  // on click, send users to location /add-recipe
  $("#addNewRecipeButton").on("click", event => {
    event.preventDefault();
    loadingModal();
    updating = false;
    window.location.assign("/add-recipe");
  });

  // registering event listener to button
  // on click, send users to location /my-recipes
  $("#viewAllRecipesButton").on("click", event => {
    event.preventDefault();
    loadingModal();
    window.location.assign("/my-recipes");
  });

  // accepts form data
  // if any forms are null or empty, return false else returns true
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

  // add event listener to send recipe button
  // when clicked, data is collected from form.
  // if the mandatory field chckec on form data is true
  // button disabled, loading modal activated
  // and submitNewRecipe is called on form data
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
      submitNewRecipe(formData);
    }
  });

  // add event listener to update recipe button
  // on click checks for null fields on updatesToRecipe
  // if null check is true, button is disabled, id added and updating set to true
  // modal activated and submitUpdatedRecipe is called on updatesToRecipe
  $("#updateRecipeButton").on("click", async event => {
    if (checkForNullFieldsUpdating(updatesToRecipe)) {
      event.preventDefault();
      $("#updateRecipeButton").prop("disabled", true);
      // add ID
      updatesToRecipe.id = $(event.target).attr("recipeId");
      updating = true;
      submitUpdatedRecipe(updatesToRecipe);
    }
  });

  // listen to clicks of search for recipe button
  // saves search term, and conditions for search (in own or all recipes)
  // if search term is null, activate error modal
  // if not, change location utilising search terms
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
      location.assign(
        `/recipe/search?onlyUserRecipes=${formData.onlyUserRecipes}&searchText=${formData.searchText}`
      );
      $("#modal-header").text("Searching. Please Wait...");
      $("#modal-body").html(`<img src="/images/e-logo.gif" alt="e-logo gif"
          style="height: 52px; width: 216px; display: block; margin: auto;">`);
      $("#recipeModal").modal("toggle");
    }
  });

  // request details of particular recipe from database
  $(".viewRecipeButton").click(event => {
    event.preventDefault();
    loadingModal();
    window.location.assign(`/recipes/${$(event.target).attr("viewid")}`);
  });

  // add event listener to clicks of edit recipe buttons
  // on click, send users to location /edit-recipe/:recipe-id
  $(".editRecipeButton").click(event => {
    event.preventDefault();
    loadingModal();
    location.assign(`/edit-recipe/${$(event.target).attr("editId")}`);
  });

  // sending a delete request for a recipe id
  // sets deleting to true
  $(".deleteRecipeButton").click(event => {
    event.preventDefault();
    deleting = true;
    removeRecipe($(event.target).attr("deleteId"));
  });

  // listens for changes to image upload and called saveImageFileToVariable
  $("#recipe-image-upload").on("change", saveImageFileToVariable);

  // when modal is hidden, calls ifChangeDoneReloadPage
  $("#recipeModal").on("hide.bs.modal", ifChangeDoneReloadPage);

  // when changes are made to form field
  // changes are saved to variable updatesToRecipe
  $("form :input").change(() => {
    updatesToRecipe[event.target.name] = event.target.value
      ? event.target.value
      : "";
    if (event.target.name === "ingredients") {
      updatesToRecipe.servings = $("#recipe-servings").val();
    }
  });
});
