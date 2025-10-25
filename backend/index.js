const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrtpt = require("bcryptjs");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const app = express();
app.use(express.json());

const allowedOrigin = "https://authentication-frontend-one.vercel.app";

const corsOptions = {
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  Credentials: true,
};

app.use(cors(corsOptions));

const PORT = process.env.PORT;
const url = process.env.MONGO_ATLAS_URL;
const secret_key = process.env.SECRET_KEY;

mongoose
  .connect(url)
  .then(() => console.log("Connected to Database Successfully...."))
  .catch((error) => console.log("Error in Connection", error));

// console.log(require("crypto").randomBytes(32).toString("hex"));

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    task: { type: String, required: true },
    description: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

const validateRegister = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
    // password: passwordComplexity().required(),
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

app.post("/api/auth/register", async (req, res) => {
  try {
    const { error } = validateRegister(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser)
      return res.status(400).json({ msg: "Email already exist" });

    const hashedPassword = await bcrtpt.hash(req.body.password, 10);

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    await newUser.save();
    res.json({ msg: "User registered sucessfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ msg: "Email does not exist" });

    const validPassword = await bcrtpt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).json({ msg: "Invalid password" });

    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      "secret_key",
      { expiresIn: "7d" }
    );
    res.json({
      msg: "Login Successfull",
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

const verifyToken = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header) return res.status(400).json({ msg: "Access denied" });
  const token = header.split(" ")[1];
  if (!token) return res.status(400).json({ msg: "token missing" });
  try {
    const verified = jwt.verify(token, "secret_key");
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ msg: "Invalid token" });
  }
};

app.get("/", (req, res) => {
  res.send("API is running Successfully..");
});

app.get("/api/tasks", verifyToken, async (req, res) => {
  try {
    const allTasks = await Task.find({ userId: req.user._id });
    res.json(allTasks);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

app.post("/api/tasks", verifyToken, async (req, res) => {
  try {
    const task = new Task({
      userId: req.user._id,
      task: req.body.task,
      description: req.body.description,
    });
    await task.save();
    res.json({ msg: "Task added Successfully.", task });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

app.put("/api/tasks/:id", verifyToken, async (req, res) => {
  try {
    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        task: req.body.task,
        description: req.body.description,
      },
      { new: true }
    );
    if (!updated) return res.status(400).json({ msg: "Task not found" });
    res.json({ msg: "Task updated successfully", updated });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

app.put("/api/tasks/:id/complete", verifyToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!task) return res.status(404).json({ msg: "Task not found" });

    task.done = !task.done;
    await task.save();

    res.json({ msg: "Task completed", task });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

app.delete("/api/tasks/:id", verifyToken, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ msg: "Task deleted Successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} `);
});
