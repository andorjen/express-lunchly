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
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** methods for setting and getting the startAt date, 
   * when setting, set as original format, when getting, get formatted version */

  get startAt() {
    // console.log(this._startAt, "this.startAt");
    // console.log(moment(this._startAt).format("MMMM Do YYYY, h:mm a"), "date")
    return moment(this._startAt).format("MMMM Do YYYY, h:mm a");
  }

  set startAt(val) {
    const date = new Date(val);
    // console.log(val, "val")
    if (!date.getDate()) {
      throw new BadRequestError("You must pass in a valid date");
    }

    this._startAt = date.toISOString();
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
    const result = await db.query(
      `INSERT INTO reservations (customer_id, 
                        start_at, 
                        num_guests, 
                        notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
      [this.customerId, this._startAt, this.numGuests, this.notes],
    );
    this.id = result.rows[0].id;
  }

  /** methods for getting and setting the numGuests on a reservation, if lower than 2, throw error */

  get numGuests() {
    return this._numGuests;
  }

  set numGuests(val) {
    if (val < 2) {
      throw new BadRequestError("Reservation must be for at least 2 people");
    }
    this._numGuests = val;
  }


}


module.exports = Reservation;
