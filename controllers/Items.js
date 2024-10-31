const Item = require("../models/Items");
const User = require("../models/User");
const Bids = require("../models/bids");
const Rentals = require("../models/Rentals");
const mongoose = require("mongoose");
const Category = require("../models/Category");
const { uploadImageToCloudinary } = require('../utils/imageUploader');

// Create your Product
exports.createProduct = async (req, res) => {
    try {
        const { title, description, price, category, condition, rentalAvailable, rentalPrice, rentalDuration, status } = req.body;

        const thumbnail = req.files?.thumbnailI;

        // if (!thumbnail) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Image is missing"
        //     });
        // }

        const categoryId = category.trim();
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Category ID"
            });
        }
        const CategoryData = await Category.findById(categoryId);
        if (!CategoryData) {
            return res.status(404).json({
                success: false,
                message: "Category Not Found"
            });
        }

        // if (!title || !description || !price || !category || rentalAvailable === undefined) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "All fields are required"
        //     });
        // }


        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        const newProduct = await Item.create({
            title,
            description,
            price,
            condition,
            status,
            owner: req.user.id,
            thumbnail: thumbnailImage.secure_url,
            category: categoryId,
            rentalAvailable,
            rentalPrice,
            rentalDuration
        });



        
        let productData;

        if (rentalAvailable === "Available") {
            const rentalData = await Rentals.create({
                ownerId: req.user.id,
                itemId: newProduct._id,
                rentalPrice,
            });

            // Update rentalServices field in newProduct
            productData = await Item.findByIdAndUpdate(

                newProduct._id,
                { rentalServices: rentalData._id },
                { new: true } // Return the updated document
            ).populate().exec();
        }

        // Update the owner items list and category
        await User.findByIdAndUpdate(req.user.id, { $push: { itemsToSell: newProduct._id } });
        await Category.findByIdAndUpdate(categoryId, { $push: { Items: newProduct._id } });

        return res.status(200).json({
            success: true,
            message: "Product created successfully.",
            data: { newProduct, productData }
        });

    } catch (e) {
        console.error("Error creating Product:", e.message);
        return res.status(500).json({
            success: false,
            message: "Failed to create Product.",
            error: e.message // Include error message for debugging
        });
    }
}
exports.StatusChange = async (req, res) => {
    try {
        const { itemId } = req.body;

        const { itemStatus } = req.body;


        const product = await Item.findById(itemId);

        if (!product) {
            return res.status(404).json({
                error: "product Not Found"
            })
        }
        product.ItemStatus = itemStatus;


        await product.save();
        const upDatedproductDetails = await Item.findById(itemId)
            .populate({
                path: 'owner',
                populate: {
                    path: 'additionaldetail', // Profile reference
                },
            })
            .populate({
                path: 'owner',
                populate: {
                    path: 'itemsToSell', // Populate itemsToSell
                },
            })
            .populate('category')
            .populate('rentalServices')
            .populate('bids')
            .exec();

        return res.status(200).json({
            success: true,
            message: `Products details updated successfully`,
            data: upDatedproductDetails,
        });
    } catch (e) {
        console.log("at time of edit product")
        res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}
exports.editItemDetails = async (req, res) => {
    try {
        const { itemId } = req.body;

        const updates = req.body;

        
        const product = await Item.findById(itemId);

        if (!product) {
            return res.status(404).json({
                error: "product Not Found"
            })
        }
        console.log("fffffffff", req.files);
        if (req.files) {

            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME)

            product.thumbnail = thumbnailImage.secure_url;
        }


        for (const key in updates) {
            if (Object.prototype.hasOwnProperty.call(updates, key)) {
                product[key] = updates[key];
            }
        }
        
        await product.save();
        const upDatedproductDetails = await Item.findById(itemId)
            .populate({
                path: 'owner',
                populate: {
                    path: 'additionaldetail', // Profile reference
                },
            })
            .populate({
                path: 'owner',
                populate: {
                    path: 'itemsToSell', // Populate itemsToSell
                },
            })
            .populate('category')
            .populate('rentalServices')
            .populate('bids')
            .exec();

        return res.status(200).json({
            success: true,
            message: `Products details updated successfully`,
            data: upDatedproductDetails,
        });




    } catch (e) {
        console.log("at time of edit product")
        res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}


exports.getAllProduct = async (req, res) => {
    try {

        const allProduct = await Item.find({}).sort({ createdAt: -1 });

        if (!allProduct) {
            return res.status(404).json({
                success: true,
                message: "all courses NOT FOUND",
                data: allProduct,
            });
        }

        return res.status(200).json({
            success: true,
            message: "all products returned  Successfully",
            data: allProduct,
        });

    } catch (e) {
        console.log(e.message)
        return res.status(401).json({
            success: false,
            message: "can't fetch product data ",
            error: e.message,
        })
    }
}

// it will come from params

exports.getProductDetails = async (req, res) => {
    try {
        const { itemId } = req.body;


        // Fetch product data and populate related fields
        const productData = await Item.findById(itemId)
            .populate({
                path: 'owner',
                populate: {
                    path: 'additionaldetail', // Profile reference
                },
            })
            .populate({
                path: 'owner',
                populate: {
                    path: 'itemsToSell', // Populate itemsToSell
                },
            })
            .populate('category')
            .populate('rentalServices')
            .populate('bids')
            .exec();

        // Validation
        if (!productData) {
            return res.status(400).json({
                success: false,
                message: `Could not find the product with ID ${itemId}`,
            });
        }

        res.status(200).json({
            success: true,
            message: `Product details fetched successfully`,
            data: productData,
        });

    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message,
        });
    }
};


// edit product after then


// find the owner's all courses 

exports.ownersAllProduct = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const ownerAllProducts = await Item.find({ owner: ownerId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: ownerAllProducts
        });

    } catch (e) {
        console.error("Error fetching all products of owner:", e.message);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve owner products",
            error: e.message
        });
    }
}


exports.deleteProduct = async (req, res) => {
    try {
        const { itemId } = req.body;
        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(400).json({
                message: "Item Not Found"
            })
        }

        // unenrolled from category list 
        const categoryId = item.category;
        const deletedItemIncategory = await Category.findByIdAndUpdate(categoryId, { $pull: { Items: itemId } });
        const rentalId = item.rentalServices;

        // tobe delete bids 
        // const bidId = item.rentalServices;

        await Rentals.findByIdAndDelete(rentalId);

        const result = await Item.findByIdAndDelete(itemId);

        res.status(200).json({
            success: true,
            message: "product Deleted successfully",
            data: result,

        })



    } catch (e) {
        console.log("error at backend of delete product", e);
        res.status(500).json({
            success: false,
            message: "failed to delte product",
            error: e.message,
        })
    }
}



exports.views = async (req, res) => {
    try {
        // const { itemId } = req.params; // Use params instead of body
        const { itemId } = req.body; // Use params instead of body

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).send({ message: 'Item not found' });
        }

        // Increment the view count
        item.views += 1;
        await item.save();

        return res.status(200).json({ success: true, message: 'View recorded' });

    } catch (e) {
        console.error("Error updating views:", e.message);
        return res.status(500).send({
            success: false,
            message: 'Error updating views',
            error: e.message
        });
    }
}

// for customer only 
exports.bids = async (req, res) => {
    try {

        const { priceOnItem, itemId } = req.body;
        const userId = req.user.id;

        if (!userId || !priceOnItem || !itemId) {
            return res.status(400).send({ message: 'Missing required fields' });
        }

        const bidsData = await Bids.create({ userId, priceOnItem, itemId });

        return res.status(200).json({
            success: true,
            message: "Bid placed successfully",
            data: bidsData
        });

    } catch (e) {
        console.error("Error placing bid:", e.message);
        return res.status(500).send({
            success: false,
            message: 'Error updating bidding',
            error: e.message
        });
    }
}


// for owner and customer  fetch final result
exports.finalBidsResult = async (req, res) => {
    try {
        const { itemId } = req.body;

        // Ensure itemId is valid
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid item ID'
            });
        }

        // Find all bids for the item
        const allBids = await Bids.find({ itemId: itemId });
        if (allBids.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No bids found for this item'
            });
        }

        // Determine the highest bid
        const winner = allBids.reduce((maxUser, user) =>
            user.priceOnItem > maxUser.priceOnItem ? user : maxUser, allBids[0]);

        // Update item with the winner
        const winnerData = await Item.findByIdAndUpdate(
            itemId,
            { winnerOfbids: req.user.id },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Final bids result fetched successfully",
            data: { allBids, winnerData }
        });

    } catch (e) {
        console.error("Error finalizing bids:", e.message);
        return res.status(500).json({
            success: false,
            message: 'Error finalizing bidding',
            error: e.message
        });
    }
}



// rental services

// when customer want to request for rent
// this will be done when both party convenceid 

exports.renatReceiveByCust = async (req, res) => {
    try {
        const { rentalStartDate, rentalEndDate, itemId } = req.body;
        const userId = req.user.id;

        const itemData = await Item.findById(itemId);
        if (!itemData) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const rentalData = await Rentals.findByIdAndUpdate(itemData.rentalServices, {
            rentalStartDate,
            rentalEndDate,
            returnStatus: "Pending",
            rentalId: userId
        }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Rental request processed successfully",
            data: rentalData
        });

    } catch (e) {
        console.error("Error processing rental request:", e.message);
        return res.status(500).send({
            success: false,
            message: 'Error processing rental request',
            error: e.message
        });
    }
}
exports.advanceSearch = async (req, res) => {
    try {
        // Destructure only keyword from req.body
        const { keyword } = req.body;

        // Ensure keyword is a string, default to an empty string if not
        const searchKeyword = typeof keyword === 'string' ? keyword : '';

        // Build the search filter
        const filter = searchKeyword
            ? {
                $or: [
                    { title: { $regex: searchKeyword, $options: 'i' } },  // Search in title
                    { description: { $regex: searchKeyword, $options: 'i' } },  // Search in description
                    // RentalAvailable and category can't use regex as they are ObjectIds
                    // You will need to pass exact values for these fields in case of filtering
                ],
            }
            : {};  // If no keyword, return all items

        // You can add direct filters for ObjectId fields here
        const { category, rentalAvailable } = req.body;

        if (category) {
            filter.category = category;  // Direct filter by category ObjectId
        }

        if (rentalAvailable) {
            filter.rentalAvailable = rentalAvailable;  // Direct filter by rental availability
        }

        // Perform the search
        const items = await Item.find(filter)
            .populate({
                path: 'category',  // Populate the category field
                populate: {
                    path: 'Items',  // Populate the Items field within the Category
                    model: 'Item',  // Specify the model to use for populating
                },
            })
            .populate('owner');    // Populates the owner field

        if (!items.length) {
            return res.status(404).json({
                success: false,
                message: "No items found",
            });
        }
     
        

        // Send the response
        return res.status(200).json({
            success: true,
            data: items,
        });

    } catch (e) {
        console.error("Error at advance search:", e.message);
        return res.status(500).json({
            success: false,
            message: 'Error during Advance Search',
            error: e.message,
        });
    }
};
