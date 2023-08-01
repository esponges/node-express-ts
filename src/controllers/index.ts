/*  This folder would contain your controller code. 
Controllers are responsible for handling requests from the client and returning responses. */

/* Here lies the logic from the routes */

// import express from "express";

// should be in a Users controller file
export class UsersController {
  private static instance: UsersController | undefined;

  private constructor() {}

  static getInstance() {
    if (!UsersController.instance) {
      UsersController.instance = new UsersController();
    }
    return UsersController.instance;
  }

  async getUsers() {
    // Get all users from the database.
  }
}
