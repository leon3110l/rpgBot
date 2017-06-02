// script with all the different types of food.
var Item = require("./item");

function Food(targetLvl, hp, exact) {
  this.type = "food";
  this.name = "foodName";
  this.maxLvl = 5;
  if (exact) {
    this.lvl = targetLvl;
  } else {
    var targetLvlWiggleRoom = Math.floor(Math.random()*targetLvl-targetLvl/2);
    this.lvl = targetLvl + targetLvlWiggleRoom;
  }
  if (this.lvl <= 0) {
    this.lvl = 1;
  }
  if (this.lvl > this.maxLvl) {
    this.lvl = this.maxLvl;
  }
  // hp multiplier if its raw or something it would give less hp back
  this.hpMultiplier = 1.25;
  // hp that the food gives back to the player who eats it
  this.hp = hp || Math.ceil((Math.random()*this.hpMultiplier+this.hpMultiplier)*this.lvl*this.hpMultiplier);
}
// inherit from item
Food.prototype = Object.create(Item.prototype);

// donut :)
function Donut(targetLvl, hp, exact) {
  this.type = "food";
  this.name = "donut";
  this.maxLvl = 30;
  if (exact) {
    this.lvl = targetLvl;
  } else {
    var targetLvlWiggleRoom = Math.floor(Math.random()*targetLvl-targetLvl/2);
    this.lvl = targetLvl + targetLvlWiggleRoom;
  }
  if (this.lvl <= 0) {
    this.lvl = 1;
  }
  if (this.lvl > this.maxLvl) {
    this.lvl = this.maxLvl;
  }
  // hp multiplier if its raw or something it would give less hp back
  this.hpMultiplier = 1.25;
  // hp that the food gives back to the player who eats it
  this.hp = hp || Math.ceil((Math.random()*this.hpMultiplier+this.hpMultiplier)*this.lvl*this.hpMultiplier);
}
// inherit from Food
Donut.prototype = Object.create(Food.prototype);

// pizza :)
function Pizza(targetLvl, hp, exact) {
  this.type = "food";
  this.name = "pizza";
  this.maxLvl = 50;
  if (exact) {
    this.lvl = targetLvl;
  } else {
    var targetLvlWiggleRoom = Math.floor(Math.random()*targetLvl-targetLvl/2);
    this.lvl = targetLvl + targetLvlWiggleRoom;
  }
  if (this.lvl <= 0) {
    this.lvl = 1;
  }
  if (this.lvl > this.maxLvl) {
    this.lvl = this.maxLvl;
  }
  // hp multiplier if its raw or something it would give less hp back
  this.hpMultiplier = 1.5;
  // hp that the food gives back to the player who eats it
  this.hp = hp || Math.ceil((Math.random()*this.hpMultiplier+this.hpMultiplier)*this.lvl*this.hpMultiplier);
}
// inherit from Food
Pizza.prototype = Object.create(Food.prototype);

module.exports = {
  Donut: Donut,
  Pizza: Pizza
};
