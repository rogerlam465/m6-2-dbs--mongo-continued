const { MongoClient } = require('mongodb');

require("dotenv").config();
const { MONGO_URI } = process.env

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const NUM_OF_ROWS = 8;
const SEATS_PER_ROW = 12;

// Code that is generating the seats.
// ----------------------------------
const seats = [];
const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
for (let r = 0; r < row.length; r++) {
  for (let s = 1; s < 13; s++) {

    Math.random() <= 0.45 ? isBookedHolder = true : isBookedHolder = false;

    seats.push({
      "_id": `${row[r]}-${s}`,
      price: 225,
      "row": `${row[r]}`,
      "seat": s,
      isBooked: isBookedHolder,
    });
  }
}

const addCollection = async (seatData) => {
  try {
    const client = MongoClient(MONGO_URI, options);

    await client.connect();

    const db = client.db("m6-2");
    console.log("connected!");

    await db.collection("seatdata").insertMany(seatData);

    client.close();
    console.log("disco fever");
  } catch (err) {
    console.log(err.stack);
  }
};

addCollection(seats);