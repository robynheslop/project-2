module.exports = (sequelize, DataTypes) => {
  const Ingredient = sequelize.define("Ingredient", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  });
  return Ingredient;
};
