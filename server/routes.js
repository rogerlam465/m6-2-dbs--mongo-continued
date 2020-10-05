const router = require("express").Router();

const { getSeats, bookSeats, deleteBooking, updateClientName } = require('./handlers');

const NUM_OF_ROWS = 8;
const SEATS_PER_ROW = 12;

// Code that is generating the seats.
// ----------------------------------
const seats = {};
const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
for (let r = 0; r < row.length; r++) {
  for (let s = 1; s < 13; s++) {
    seats[`${row[r]}-${s}`] = {
      price: 225,
      isBooked: false,
    };
  }
}
// ----------------------------------
//////// HELPERS
const getRowName = (rowIndex) => {
  return String.fromCharCode(65 + rowIndex);
};

// the goal is to remove this entirely.

const randomlyBookSeats = (num) => {
  const bookedSeats = {};

  while (num > 0) {
    const row = Math.floor(Math.random() * NUM_OF_ROWS);
    const seat = Math.floor(Math.random() * SEATS_PER_ROW);

    const seatId = `${getRowName(row)}-${seat + 1}`;

    bookedSeats[seatId] = true;

    num--;
  }

  return bookedSeats;
};

// ok. This is it. This is what needs to be modified to be Mongo-friendly.
// we'll need to change the logic to match the new object schema.

router.get("/api/seat-availability", getSeats);

// ok. so this checks for if the seat is already booked.
// checks for if there's a CC and expiry, we can leave that.
// books the seat if all is well.
router.post("/api/book-seat", bookSeats);

router.delete("/api/book-seat", deleteBooking);

router.patch("/api/book-seat", updateClientName)

module.exports = router;
