const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const User = require("./models/User");
const Train = require("./models/Train");
const Booking = require("./models/Booking");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb://127.0.0.1:27017/ticketDB")
.then(() => console.log("MongoDB Connected"));

/* HOME */
app.get("/", (req, res) => {
  res.render("index");
});

/* REGISTER */
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  await User.create(req.body);
  res.redirect("/login");
});

/* LOGIN */
app.get("/login", (req, res) => {
  res.render("login", { message: null });
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password
  });

  if (!user)
    return res.render("login", { message: "Invalid credentials" });

  if (!user.approved)
    return res.render("login", { message: "Waiting for admin approval" });

  res.redirect("/dashboard?userId=" + user._id);
});

/* DASHBOARD */
app.get("/dashboard", async (req, res) => {
  const trains = await Train.find();
  res.render("dashboard", {
    trains,
    userId: req.query.userId
  });
});

/* BOOK PAGE */
app.get("/book/:trainId/:userId", async (req, res) => {
  const train = await Train.findById(req.params.trainId);
  res.render("booking", {
    train,
    userId: req.params.userId
  });
});

/* CONFIRM BOOKING */
app.post("/book/:trainId/:userId", async (req, res) => {

  const train = await Train.findById(req.params.trainId);
  const totalPassengers = parseInt(req.body.totalPassengers);

  if (train.availableSeats < totalPassengers) {
    return res.send("Not enough seats available");
  }

  const names = req.body.name;
  const ages = req.body.age;

  const passengers = names.map((n, i) => ({
    name: n,
    age: ages[i]
  }));

  train.availableSeats -= totalPassengers;
  await train.save();

  await Booking.create({
    userId: req.params.userId,
    trainId: req.params.trainId,
    passengers,
    totalPassengers
  });

  res.redirect("/myBookings/" + req.params.userId);
});

/* MY BOOKINGS */
app.get("/myBookings/:userId", async (req, res) => {

  const bookings = await Booking
    .find({ userId: req.params.userId })
    .populate("trainId");

  res.render("myBookings", {
    bookings,
    userId: req.params.userId
  });
});

/* ADMIN */
app.get("/admin", async (req, res) => {
  const users = await User.find({ approved: false });
  res.render("admin", { users });
});

/* APPROVE USER */
app.post("/approve/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { approved: true });
  res.redirect("/admin");
});

/* ADD TRAIN */
app.post("/addTrain", async (req, res) => {
  await Train.create(req.body);
  res.redirect("/admin");
});

app.listen(3000, () => console.log("Server running on port 3000"));