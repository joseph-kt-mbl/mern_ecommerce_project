const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const { ValidateMongodbID } = require("../utils/ValidateMongodbId");

// Create a new brand
const createBrand = asyncHandler(async (req, res) => {
  try {
    const newBrand = await Brand.create(req.body);
    res.json(newBrand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an existing brand
const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  ValidateMongodbID(id);
  try {
    const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedBrand) {
      res.status(404).json({ message: 'Brand not found' });
      return;
    }
    res.json(updatedBrand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a brand
const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  ValidateMongodbID(id);
  try {
    const deletedBrand = await Brand.findByIdAndDelete(id);
    if (!deletedBrand) {
      res.status(404).json({ message: 'Brand not found' });
      return;
    }
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single brand by ID
const getBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  ValidateMongodbID(id);
  try {
    const getaBrand = await Brand.findById(id);
    if (!getaBrand) {
      res.status(404).json({ message: 'Brand not found' });
      return;
    }
    res.json(getaBrand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all brands
const getallBrand = asyncHandler(async (req, res) => {
  try {
    const getallBrand = await Brand.find();
    res.json(getallBrand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getallBrand,
};
