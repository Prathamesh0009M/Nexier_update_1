const express = require("express");
const router = express.Router();

// Item exchange fields 

const { createCategory, showAllCategory,categoryPageDetails } = require("../controllers/Category")

const { createProduct, getAllProduct, getProductDetails, ownersAllProduct, deleteProduct, views
    , bids, finalBidsResult,editItemDetails,StatusChange,advanceSearch
} = require("../controllers/Items")


const { auth, isAdmin, isStudent } = require("../middelwares/auth");

router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategory",  showAllCategory);
router.post("/advanceSearch",  advanceSearch);
router.post("/getCategoryPageDetails",  categoryPageDetails);

router.post("/createProduct", auth,createProduct);

router.get("/getAllProduct", getAllProduct);
router.get("/ownersAllProduct", auth, ownersAllProduct);

router.post("/getProductDetails", getProductDetails);
router.post("/deleteItem", deleteProduct);
router.post("/editItemDetails", auth,editItemDetails);
router.post("/StatusChange", auth, StatusChange);

router.post("/views", views);

router.post("/bids", auth, bids);
router.post("/finalBidsResult", auth, finalBidsResult);








module.exports = router;
