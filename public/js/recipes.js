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

const submitNewRecipe = formData => {
  console.log(formData);
  $.post("/api/recipe", formData).then(resetFormAfterSubmission());
};

const resetFormAfterSubmission = () => {
  updating = false;
  recipeID = "";
  $("#sendRecipeButton").prop("disabled", false);
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

const loadNewRecipeForm = () => {
  window.location.replace("/add-recipe");
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
  $.put("/api/recipe/" + formData.id, formData).then(
    resetFormAfterSubmission()
  );
};

$(document).ready(() => {
  // display user email in header
  $(".member-name").text(localStorage.getItem("userEmail"));
  let updating = false;
  let recipeID;
  initiaizeFirebase();

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

  $("#sendRecipeButton").on("click", async event => {
    event.preventDefault();
    // disable submit button
    $("#sendRecipeButton").prop("disabled", true);
    const ingredientResponse = await parseRecipesWithSpoonacular();
    const separatedIngredients = await ingredientResponse.map(item => {
      return {
        title: item.originalName,
        quantity: item.amount,
        units: item.unitShort
      };
    });
    console.log(separatedIngredients);
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
    console.log($(event.target).attr("view-id"));
    viewRecipeInDetail($(event.target).attr("view-id"));
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
