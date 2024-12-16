const express = require("express");
const app = express();
const connectDB = require("../config/connectdb");
const User = require("../models/userschema");
const { validateSignUpData } = require("../utlis/validation");
const bcrypt = require("bcrypt");
const cookieparser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const hostname = "127.0.0.1";
const port = 7777;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieparser());
// app.post("/signup", async (req, res) => {
//   // const user = new User({
//   //   firstname: "rakesh",
//   //   lastname: "verma",
//   //   email: "rakesh.verma@email.com",
//   //   phone: "9928383499",
//   //   password: "rakeshSecure@123",
//   // });

//   console.log(req.body);
//   const user = new User(req.body);
//   try {
//     await user.save();
//     res.send("user created successfully");
//   } catch (e) {
//     console.error(e);
//     res.status(500).send("Server Error");
//     return;
//   }
// });

app.post("/signup", async (req, res) => {
  //   Creating a new instance of the User model
  const user = new User(req.body);
  try {
    // Validation of data
    validateSignUpData(req);
    const { firstName, lastName, emailId, password } = req.body;
    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);
    // console.log(passwordHash);
    //   Creating a new instance of the User model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.send("User Added successfully!");
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
    res.status(400).send("ERROR : " + err.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const token = jwt.sign(
        { email: user.email, _id: user._id },
        "DEV@Tinder$790",
        {
          expiresIn: "1h",
        }
      );
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      // res.cookie("token", "sjdfsdfsdfjsdfsdjfsdkfsdjfsdjfsfw32423423");
      // res.send("Login Successful!!!");
      console.log(`User ${user._id} logged in successfully.`);
      res.status(200).json({
        message: "Login Successful!!!",
        token: token,
        userId: user._id,
        success: true,
        email: user.email,
        name: user.firstName,
      });
      console.log("Response data:", { token, name: user.firstName });
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

app.get("/profile", async (req, res) => {
  const cookies = req.cookies;
  // console.log(cookies);
  // res.send("Reading cookies...");
  try {
    const { token } = cookies;
    if (!token) {
      throw new Error("Invalid Token");
    }
    const decodedMessage = await jwt.verify(token, "DEV@Tinder$790");
    const { _id } = decodedMessage;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User does not exist");
    }
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});
app.get("/user", async (req, res) => {
  const useremail = req.body.emailId;
  // console.log(useremail);
  try {
    const user = await User.find({ emailId: useremail });
    if (user.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("something went wrong");
    return;
  }
});

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("something went wrong");
    return;
  }
});

// Detele a user from the database
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete({ _id: userId });
    //const user = await User.findByIdAndDelete(userId);
    res.send("User deleted successfully");
  } catch (err) {
    res.status(400).send("Something went wrong ");
  }
});
// Update data of the user with params
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  console.log(userId);
  const data = req.body;
  try {
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }
    if (data?.skills.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }

    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after",
      runValidators: true,
    });
    console.log(user);
    res.send("User updated successfully");
  } catch (err) {
    res.status(400).send("Something went wrong " + err.message);
  }
});

//! Update data of the user with body
// app.patch("/user", async (req, res) => {
//   const userId = req.body.userId;
//   const data = req.body;
//   try {
//     const user = await User.findByIdAndUpdate({ _id: userId }, data, {
//       returnDocument: "after",
//       runValidators: true,
//     });
//     console.log(user);
//     res.send("User updated successfully");
//   } catch (err) {
//     res.status(400).send("Something went wrong ");
//   }
// });

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB");
  });
