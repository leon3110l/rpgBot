// var Game = require("./game");

// main game component.
function Item() {
  this.itemId;
  this.name;
  this.type = "item";
  this.description = ""; // give an item an description so that the user can read it
}

module.exports = Item;
