const BCategory = require("../Models/blogCatModel");
const asyncHandler = require("express-async-handler");
const { ValidateMongodbID } = require("../utils/ValidateMongodbId");

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = await BCategory.create(req.body);
    res.json(newCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an existing category
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  ValidateMongodbID(id);
  try {
    const updatedCategory = await BCategory.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedCategory) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a category
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  ValidateMongodbID(id);
  try {
    const deletedCategory = await BCategory.findByIdAndDelete(id);
    if (!deletedCategory) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single category by ID
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  ValidateMongodbID(id);
  try {
    const category = await BCategory.findById(id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all categories
const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await BCategory.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
};
