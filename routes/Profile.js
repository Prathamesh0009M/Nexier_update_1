const express = require("express");
const router = express.Router();

const { auth, isAdmin, isStudent } = require("../middelwares/auth");
const { updateProfile, deleteAccount, getAllUserDetails, getBoughtItems, updateDP,
    following,
    followerList,
    getFriendAllData,
    getRandomUsersNotFollowing

} = require("../controllers/Profile");


const { addPyq,findPapers } = require("../controllers/Academics");

const { messageHistory } = require("../controllers/SKT")
const { bfsFindConnections } = require("../controllers/FriendConnection");

router.post("/updateProfile", auth, updateProfile);
router.post("/deleteAccount", auth, deleteAccount);
router.get("/getAllUserDetails", auth, getAllUserDetails);
router.post("/getBoughtItems", auth, getBoughtItems);
router.post("/updateDP", auth, updateDP);

router.post("/messageHistory", auth, messageHistory);

router.post("/following", auth, following);
router.get("/followerList", auth, followerList);
router.post("/getFriendAllData", auth, getFriendAllData);
router.post("/getRandomUser",  getRandomUsersNotFollowing);
    

// mutual friends 
router.post("/friendRecommended", bfsFindConnections);




// Academics 
router.post("/addPyq", auth,isAdmin,addPyq);
router.post("/findPapers", auth,findPapers);



module.exports = router;
