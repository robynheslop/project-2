const db = require("../models");
const { Op } = require("sequelize");
/**
 * creates a recipe entry in recipes table
 * and returns same
 * @param {request received from client} request
 */
const createRecipe = async request => {
  const recipeObject = {
    title: request.body.title,
    instructions: request.body.instructions,
    servings: request.body.servings,
    preparationTime: request.body.preparationTime,
    notes: request.body.notes,
    imageUrl: request.body.imageUrl,
    UserId: request.user.id
  };
  try {
    const recipe = await db.Recipe.create(recipeObject);
    return recipe;
  } catch (error) {
    console.log(
      `Error ocurred while creating recipe. detailed error is following: ${error}`
    );
  }
};

/**
 * it checks what new ingredient are provided by user
 * then only persist those ingredients in ingredients table
 * @param {request received from client} request
 */
const persistAndFetchIngredients = async request => {
  let persistedIngredients;
  try {
    persistedIngredients = await db.Ingredient.findAll();
  } catch (error) {
    console.log(
      `Failed to retreive saved ingredients due to following error: ${error}`
    );
    return;
  }
  let ingredientToSave;
  if (persistedIngredients.length) {
    const currentIngredients = persistedIngredients.map(element => {
      return element.title.toLowerCase();
    });
    ingredientToSave = request.body.ingredients
      .filter(
        element => currentIngredients.indexOf(element.title.toLowerCase()) < 0
      )
      .map(element => {
        return {
          title: element.title.toLowerCase()
        };
      });
  } else {
    ingredientToSave = request.body.ingredients.map(element => {
      return {
        title: element.title.toLowerCase()
      };
    });
  }
  try {
    const newlyCreatedIngredient = await db.Ingredient.bulkCreate(
      ingredientToSave
    );
    persistedIngredients = persistedIngredients.concat(newlyCreatedIngredient);
  } catch (error) {
    console.log(
      `failed to persist new ingredients due to following error: ${error}`
    );
    return;
  }
  return persistedIngredients;
};

/**
 * it persists recipe and ingredient relations
 * in recipeIngredients table i.e. what quantity
 * of what ingredient is needed for which recipe.
 * @param {request as received from client} request
 * @param {all ingredients currently saved} persistedIngredients
 * @param {recipe being saved currently} recipe
 */
const persistRecipeIngredients = async (
  request,
  persistedIngredients,
  recipe
) => {
  const recipeIngredientsToSave = request.body.ingredients.map(element => {
    return {
      ingredientQuantity: element.quantity,
      ingredQuantUnit: element.units,
      RecipeId: recipe.id,
      IngredientId: persistedIngredients
        .filter(ingredient => {
          return ingredient.title.toLowerCase() === element.title.toLowerCase();
        })
        .map(ingredient => ingredient.id)[0]
    };
  });
  try {
    await db.RecipeIngredient.bulkCreate(recipeIngredientsToSave);
    return true;
  } catch (error) {
    console.log(
      `failed to persist recipe ingredients due to following error: ${error}`
    );
    return false;
  }
};
/**
 * it fetches all recipes which belongs to current user
 * and returns an array of recipe title, id and preparationTime
 * for each user recipe
 * @param {request from client} request
 */
const getAllRecipesForCurrentUser = async request => {
  const userId = request.user.id;
  try {
    const recipes = await db.Recipe.findAll({
      where: {
        UserId: userId
      },
      attributes: ["id", "title", "preparationTime"]
    });
    return recipes.map(recipe => {
      return {
        title: recipe.title,
        preparationTime: recipe.preparationTime,
        id: recipe.id
      };
    });
  } catch (error) {
    console.log(`Failed to retrieve recipes due to following error: ${error}`);
  }
};

/**
 * fetches recipe details for a given recipe id
 * and returns an object having all recipe details
 * @param {request sent by client} request
 */
const getRecipeDetails = async request => {
  const recipeId = request.params.id;
  try {
    const recipe = await db.Recipe.findOne({
      where: {
        id: recipeId
      }
    });
    let ingredientDetails = [];
    const recipeIngredients = await recipe.getRecipeIngredients();
    if (recipeIngredients && recipeIngredients.length) {
      const ingredientIds = recipeIngredients.map(
        element => element.IngredientId
      );
      const ingredients = await db.Ingredient.findAll({
        where: {
          id: {
            [Op.or]: ingredientIds
          }
        }
      });
      ingredientDetails = recipeIngredients.map(element => {
        const ingredientName = ingredients
          .filter(ingredient => ingredient.id === element.IngredientId)
          .map(ingredient => ingredient.title);
        return {
          title: ingredientName[0],
          quantity: element.ingredientQuantity,
          unit: element.ingredQuantUnit
        };
      });
    }
    console.log(recipe);
    const recipeDetails = {
      title: recipe.title,
      instructions: recipe.instructions,
      preparationTime: recipe.preparationTime,
      servings: recipe.servings,
      notes: recipe.notes,
      imageUrl: recipe.imageUrl,
      ingredients: ingredientDetails,
      id: request.params.id
    };
    return recipeDetails;
  } catch (error) {
    console.log(
      `Failed to retrieve recipe details due to following error: ${error}`
    );
  }
};

module.exports = {
  createRecipe,
  persistAndFetchIngredients,
  persistRecipeIngredients,
  getAllRecipesForCurrentUser,
  getRecipeDetails
};
