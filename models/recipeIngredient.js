module.exports = (sequelize, DataTypes) => {
  const RecipeIngredient = sequelize.define("RecipeIngredient", {
    ingredientQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    ingredQuantUnit: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
  return RecipeIngredient;
};
