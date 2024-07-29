const Coupon = require("../Models/couponModel");
const {ValidateMongodbID} = require("../utils/ValidateMongodbId");
const asyncHandler = require("express-async-handler");

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const newCoupon = await Coupon.create(req.body);
    res.json(newCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getAllCoupons = asyncHandler(async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  ValidateMongodbID(id)
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  ValidateMongodbID(id);
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(id);
    res.json(deletedCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  ValidateMongodbID(id);
  try {
    const coupon = await Coupon.findById(id);
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  getCoupon,
};
