const Category = require("../models/Category")

// create tag ka handeler function

exports.createCategory = async (req, res) => {
    try {
        // fetch data 
        const { name, description } = req.body;
        // validation 
        if (!name || !description) {
            return res.status(500).json({
                success: false,
                message: "All fields are required",
            });
        }
        // create entry in DB ~~
        const tagDetails = await Category.create({ name: name, description: description });

        return res.status(200).json({
            success: true,
            message: " Category created Successfully",
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: e.message,
        });
    }
}

// get All tags

exports.showAllCategory = async (req, res) => {
    try {

        const allCategorys = await Category.find({}, { name: true, description: true });

        return res.status(200).json({
            success: true,
            message: "all Category returned  Successfully",
            data: allCategorys,

        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: e.message,
        });
    }
}


// categoryPageDetails tobe
exports.categoryPageDetails = async (req, res) => {
    try {
        // Check for categoryId in the request body
        const { categoryId } = req.body;
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category ID is required",
            });
        }

        // Get the specified category
        const selectedCategory = await Category.findById(categoryId)
            .populate('Items')
            .exec();

        // Check if the specified category exists
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // Get other categories excluding the selected one
        const categoriesExpectSelected = await Category.find({ _id: { $ne: categoryId } })
            .populate("Items")
            .exec();

        let differentCategories = null;

        // Only select a random category if there are other categories available
        if (categoriesExpectSelected.length > 0) {
            const getRandomInt = (max) => Math.floor(Math.random() * max);
            const randomCategory = categoriesExpectSelected[getRandomInt(categoriesExpectSelected.length)];

            // Fetch details of the randomly selected category
            differentCategories = await Category.findById(randomCategory._id)
                .populate('Items')
                .exec();
        }

        // Get all categories with published items
        const allCategories = await Category.find().populate({
            path: "Items",
            match: { ItemStatus: "Published" },
        }).exec();

        // Flatten the items from all categories
        const allCourses = allCategories.flatMap((category) => category.Items || []);

        // Get top 10 most sold items
        const mostSellingItems = allCourses.sort((a, b) => b.sold - a.sold).slice(0, 10);

        // Send the response
        res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
                mostSellingItems,
            },
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: e.message,
        });
    }
};
