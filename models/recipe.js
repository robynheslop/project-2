module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define("Recipe", {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    servings: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    preparationTime: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT
    },
    image: {
      type: DataTypes.TEXT
    }
  });
  return Recipe;
};
