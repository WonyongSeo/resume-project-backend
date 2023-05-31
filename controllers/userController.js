const firebase = require("../db");
const User = require("../models/user");
const firestore = require("firebase/firestore");

const addUser = async (req, res, next) => {
    try {
        const data = req.body;
        const user = await firestore.collection("CRUD_TEST").doc.set(data);
        res.send("Record saved successfully");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const getAllUser = async (req, res, next) => {
    try {
      const snapshot = await firestore.collection("CRUD_TEST").get();
      const data = snapshot;
      const usersArray = [];
      if (data.empty) {
        res.status(404).send("No User Record found");
      } else {
        snapshot.forEach((doc) => {
          const user_data = new User(doc.data().name, doc.data().age);
          usersArray.push(user_data);
        });
      }
      res.send(usersArray);
    } catch (error) {
      res.status(400).send(error.message);
    }
  };

const updateUser = async (req, res, next) => {
try {
    const newUserData = req.body;
    const userID = req.params.id;
    const userSnapshot = await firestore.collection("CRUD_TEST").doc(userID);
    const userData = await userSnapshot.get();

    if (!userData.exists) {
    res.status(404).send("User with given ID not found");
    } else {
    userSnapshot.update(newUserData);
    res.send(`Update Successfully\n
    Updated User ID : ${userID}\n
    new User Data : {
        name : ${req.body.name},
        age : ${req.body.age}
    }
    `);
    }
} catch (error) {
    res.status(400).send(error.message);
}
};

const deleteUser = async (req, res, next) => {
try {
    const userID = req.params.id;
    const userSnapshot = await firestore.collection("CRUD_TEST").doc(userID);
    const userData = await userSnapshot.get();

    if (!userData.exists) {
    res.status(404).send("User with given ID not found");
    } else {
    res.send(`Delete Successfully!
    Deleted User ID : ${userID}
    Deleted User Data : {
        name : ${userData.data().name},
        age : ${userData.data().age}
    }
    `);
    userSnapshot.delete();
    }
} catch (error) {
    res.status(400).send(error.message);
}
};
  
module.exports = {
    addUser,
    getAllUser,
    updateUser,
    deleteUser,
}