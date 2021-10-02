"use strict";

/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");
const { BadRequestError } = require("../expressError");

/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    // this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
    this.guestCount = numGuests;
  }

  /** formatter for startAt */

  get startAt() {
    // return this._startAt;
    return moment(new Date(this._startAt)).format("MMMM Do YYYY, h:mm a");
  }

  set startAt(val) {

    const date = new Date(val);
    console.log(date, "date")

    if (!date.getDate()) {
      throw new BadRequestError("You must pass in a valid date");
    }
    // const formatted = moment(val).format("MMMM Do YYYY, h:mm a");
    // console.log(formatted, "formatted")
    this._startAt = val;
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id,
                  customer_id AS "customerId",
                  num_guests AS "numGuests",
                  start_at AS "startAt",
                  notes AS "notes"
           FROM reservations
           WHERE customer_id = $1`,
      [customerId],
    );

    return results.rows.map(row => new Reservation(row));

  }

  /** save this reservation */

  async save() {
    console.log("this.startAt", this.startAt)
    const result = await db.query(
      `INSERT INTO reservations (customer_id, 
                        start_at, 
                        num_guests, 
                        notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
      [this.customerId, this.startAt, this.numGuests, this.notes],
    );
    this.id = result.rows[0].id;
  }

  get guestCount() {
    return this.numGuests;
  }

  set guestCount(numGuests) {
    if (numGuests < 2) {
      throw new BadRequestError("Reservation must be for at least 2 people");
    }
    this.numGuests = numGuests;
  }


}


module.exports = Reservation;
