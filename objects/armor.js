var Item = require("./item");
// script with all the armor pieces

// if exact is true it will take the targetlvl and makes it the lvl
function Armor(targetLvl, defense, exact) {
  this.maxLvl = 5;
  this.name = "unnamed";
  this.type = "armor";
  this.armorType = "boots"; // boots, harness, helmet, glove or pants
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
  this.defense = defense || Math.ceil((Math.random()*5+5)*this.lvl*5*0.25);
}
// inherit from item
Armor.prototype = Object.create(Item.prototype);

function Shirt(targetLvl, defense, exact) {
  this.maxLvl = 10;
  this.name = "shirt";
  this.type = "armor";
  this.armorType = "harness"; // boots, harness, helmet, glove or pants
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
  this.defense = defense || Math.ceil((Math.random()*5+5)*this.lvl*5*0.25);
}
Shirt.prototype = Object.create(Armor.prototype);

module.exports = {
  Shirt: Shirt
};
