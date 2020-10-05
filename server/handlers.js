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

  const { seatId, creditCard, expiration, fullName, email } = req.body;

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

    res.status(202).json({ status: 202, message: "Data ingested." });

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: 500, message: "Alas! Alack-a-day, error 500." });
  }

};

const deleteBooking = async (req, res) => {

  const { _id } = req.body;

  try {
    await dbConnect();

    const db = client.db("m6-2");

    await db.collection("seatdata").updateOne({ "_id": _id }, [
      { $set: { "isBooked": false } },
      { $unset: ["fullName", "email"] }
    ])

    dbDisco();

    res.status(204).json({ status: 202, message: "Target eliminated." });

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: 500, message: "Fie! I bite my thumb at thee. Error 500." })
  }

};

const updateClientName = async (req, res) => {

  const { _id, fullName, email } = req.body;

  // specs call for fullName OR email, or presumably both

  let handler = {};

  if (!fullName && !email) {
    res.status(500).json({ status: 500, message: "Mine cup is empty. Add data. Error 500." });
  }

  if (fullName) {
    handler.fullName = fullName;
  };

  if (email) {
    handler.email = email;
  };


  try {
    await dbConnect();

    const db = client.db("m6-2");

    await db.collection("seatdata").updateOne({ "_id": _id }, { $set: handler });

    dbDisco();

    res.status(204).json({ status: 204, message: "Update complete." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: 500, message: "Methink’st thou art a general offence and every man should beat thee. Error 500." })
  }

}

module.exports = { getSeats, bookSeats, deleteBooking, updateClientName };
