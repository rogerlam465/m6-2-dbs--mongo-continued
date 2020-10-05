'use strict';

const { MongoClient } = require('mongodb');

require("dotenv").config();
const { MONGO_URI } = process.env

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let client;

const dbConnect = async () => {
  try {
    client = MongoClient(MONGO_URI, options);
    await client.connect();

    console.log("connected!");
  } catch (err) {
    console.log(err);
  }
};

const dbDisco = () => {
  client.close();
  console.log("db disco very");
};

const getSeats = async (req, res) => {
  try {

    await dbConnect();

    const db = client.db("m6-2");

    let r = await db.collection("seatdata").find().toArray();

    let bookedSeats = [];
    let seats = {};

    // making data of the expected shape for FE

    r.forEach(element => {
      if (element["isBooked"] === true) {
        bookedSeats.push(element["_id"]);
      }
      seats[`${element.row}-${element.seat}`] = {
        price: 225,
        isBooked: element.isBooked,
      };
    });

    dbDisco();

    res.status(200).json({
      status: 200,
      seats: seats,
      bookedSeats: bookedSeats,
      numOfRows: 8,
      seatsPerRow: 12
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: 500, message: "Gadzooks! Server error!" });
  }

};

const bookSeats = async (req, res) => {
  console.log(req.body);
  const { seatId, creditCard, expiration, fullName, email } = req.body

  if (!creditCard || !expiration) {
    return res.status(400).json({
      status: 400,
      message: "Please provide credit card information!",
    });
  }

  try {
    await dbConnect();

    const db = client.db("m6-2");

    // ok. what we need to try is to to verify if the seat is already booked
    // if so, return a 400.
    // if not, send a change to the DB.

    let r = await db.collection("seatdata").findOne({ "_id": seatId });

    // this shouldn't even be possible. Booked seats are greyed out.

    if (r.isBooked) {
      return res.status(400).json({
        message: "This seat has already been booked!",
      });
    }

    // $set replaces a single field value with the specified value. nice.
    // can change multiple values by using an array, neat.

    await db.collection("seatdata").updateOne({ "_id": seatId }, [
      { $set: { "isBooked": true } },
      { $addFields: { "fullName": fullName, "email": email } }
    ]);

    dbDisco();

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: 500, message: "Alas! Alack-a-day, error 500." });
  }

};

module.exports = { getSeats, bookSeats };
