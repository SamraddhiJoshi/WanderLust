const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const { id } = req.params;

  const newReview = new Review(req.body.review);

  newReview.author = req.user._id;

  await newReview.save();

  await Listing.findByIdAndUpdate(id, {
    $push: {
      reviews: newReview._id,
    },
  });

  req.flash("success", "New Review Created!");

  res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted!");

  res.redirect(`/listings/${id}`);
};
