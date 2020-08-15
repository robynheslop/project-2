module.exports = (sequelize, DataTypes) => {
  const RecipeIngredient = sequelize.define("RecipeIngredient", {
    ingredientQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ingredQuantUnit: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
  return RecipeIngredient;
};
