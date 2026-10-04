const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// =========================
// INDEX
// =========================
module.exports.index = async (req, res) => {
  const { q, category } = req.query;
  let filter = {};
  let searchQuery = "";

  // =========================
  // SEARCH FILTER
  // =========================
  if (q && q.trim() !== "") {
    searchQuery = q.trim();
    filter.$or = [
      { title: { $regex: searchQuery, $options: "i" } },
      { location: { $regex: searchQuery, $options: "i" } },
      { country: { $regex: searchQuery, $options: "i" } },
    ];
  }

  // =========================
  // CATEGORY FILTER
  // =========================
  if (category) {
    filter.category = category;
  }

  // =========================
  // GET LISTINGS
  // =========================
  const allListings = await Listing.find(filter);

  // =========================
  // RENDER LISTINGS PAGE
  // =========================
  res.render("listings/index.ejs", {
    allListings,
    searchQuery,
    category,
  });
};

// =========================
// NEW LISTING FORM
// =========================
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// =========================
// SHOW LISTING
// =========================
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", {
    listing,
  });
};

// =========================
// CREATE LISTING
// =========================
module.exports.createListing = async (req, res, next) => {
  try {
    // =========================
    // MAPBOX GEOCODING
    // =========================
    const response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    // =========================
    // CHECK LOCATION
    // =========================
    if (!response.body.features.length) {
      req.flash(
        "error",
        "Location could not be found. Please enter a valid location.",
      );
      return res.redirect("/listings/new");
    }

    // =========================
    // CREATE LISTING
    // =========================
    const newListing = new Listing(req.body.listing);

    // =========================
    // OWNER
    // =========================
    newListing.owner = req.user._id;

    // =========================
    // IMAGE
    // =========================
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };

    // =========================
    // GEOMETRY
    // =========================
    newListing.geometry = response.body.features[0].geometry;

    // =========================
    // SAVE
    // =========================
    await newListing.save();
    req.flash("success", "New Listing Created!!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};

// =========================
// EDIT FORM
// =========================
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", {
    listing,
    originalImageUrl,
  });
};

// =========================
// UPDATE LISTING
// =========================
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(
    id,
    {
      ...req.body.listing,
    },
    {
      new: true,
    },
  );

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!!");
  res.redirect(`/listings/${id}`);
};

// =========================
// DELETE LISTING
// =========================
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!!");
  res.redirect("/listings");
};
