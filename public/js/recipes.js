let selectedFile;
let storageRef;

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

const initiaizeFirebase = () => {
  firebase.initializeApp(firebaseConfig);
  const storageService = firebase.storage();
  storageRef = storageService.ref();
  firebase.analytics();
};

const saveImageFileToVariable = event => {
  selectedFile = event.target.files[0];
};

const handleFileUploadSubmit = async () => {
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

const filterIngredientListFromSpoonacular = ingredientResponse => {
  ingredientResponse.map(item => {
    return {
      title: item.originalName,
      quantity: item.amount,
      units: item.unitShort
    };
  });
};

const submitNewRecipe = formData => {
  $.post("/api/recipe", formData).then(response => console.log(response));
};

const clearRecipeDataFieldsAfterSubmission = () => {
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
  window.location.replace("/my-recipes");
};

const viewRecipeInDetail = id => {
  window.location.replace(`/recipes/${id}`);
};

// search by criteria
const findRecipesUsingCriteria = formData => {
  location.assign(
    `/recipe/search/?onlyUserRecipes=${formData.onlyUserRecipes}&searchText=${formData.searchText}`
  );
};

// delete recipe
const removeRecipe = id => {
  $.delete(`/api/recipes/${id}`).then(response => console.log(response));
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
  $.put("/api/recipe/" + formData.id, formData).then(console.log("submitted"));
};

$(document).ready(() => {
  // display user email in header
  $(".member-name").text(localStorage.getItem("userEmail"));
  let updating = false;
  let recipeID;
  initiaizeFirebase();

  // get food fact for homepage
  // $.get(
  //   "https://api.spoonacular.com/food/trivia/random?apiKey=bdfbfd72f72a4581a44198a9ce8cf3f5"
  // ).then(response => console.log(response));

  // get food joke for homepage
  // $.get(
  //   "https://api.spoonacular.com/food/jokes/random?apiKey=bdfbfd72f72a4581a44198a9ce8cf3f5"
  // ).then(response => console.log(response));

  // check for information in local storange regarding divs to show when page loads
  const idToShow = localStorage.getItem("show");
  if (idToShow) {
    $(`${idToShow}`).show();
    localStorage.removeItem("show");
  }

  // display form to add a new recipe
  $("#addNewRecipeButton").on("click", event => {
    event.preventDefault();
    updating = false;
    $("#newRecipeForm").show();
    $("#searchForRecipeForm").hide();
    $(".vertical").hide();
    $("#dishOftheDay").hide();
    $("#addNewRecipe").hide();
  });

  $("#viewAllRecipesButton").on("click", event => {
    event.preventDefault();
    getAllMyRecipes();
    $("appendSearchItemsHere").show();
    $("#searchForRecipeForm").hide();
    $(".vertical").hide();
    $("#dishOftheDay").hide();
    $("#addNewRecipe").hide();
  });

  $("#searchForRecipeButton").on("click", event => {
    event.preventDefault();
    $("#newRecipeForm").hide();
    $("#appendSearchItemsHere").hide();
    $("#searchForRecipeForm").show();
    $("#detailedRecipeViewHere").show();
  });

  $(".close").on("click", event => {
    event.preventDefault();
    $("#newRecipeForm").hide();
    $("#appendSearchItemsHere").hide();
    $("#searchForRecipeForm").hide();
    $("#detailedRecipeViewHere").hide();
  });

  $("#sendRecipeButton").on("click", async event => {
    event.preventDefault();
    const ingredientResponse = await parseRecipesWithSpoonacular();
    const separatedIngredients = filterIngredientListFromSpoonacular(
      ingredientResponse
    );
    const recipeURL = await handleFileUploadSubmit();
    const formData = {
      title: $("#recipe-title").val(),
      instructions: $("#recipe-instructions").val(),
      ingredients: separatedIngredients,
      servings: $("#recipe-servings").val(),
      preparationTime: $("#recipe-preparation-time").val(),
      notes: $("#recipe-notes").val(),
      imageUrl: recipeURL
    };
    if (updating) {
      formData.id = recipeID;
      submitUpdatedRecipe(formData);
    } else {
      submitNewRecipe(formData);
    }
    clearRecipeDataFieldsAfterSubmission();
  });

  $("#searchRecipeButton").on("click", event => {
    event.preventDefault();
    const formData = {
      onlyUserRecipes:
        $("input[name='recipesToSearch']:checked").val() === "my-recipes"
          ? true
          : false,
      searchText: $("#searchTerm").val()
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

  $("#recipe-image-upload").on("change", saveImageFileToVariable);
});
