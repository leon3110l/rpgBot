var Item = require("./item");
// script with all the armor pieces

function Armor(targetLvl) {
  this.maxLvl = 5;
  this.name = "unnamed";
  this.type = "armor";
  var targetLvlWiggleRoom = Math.floor(Math.random()*targetLvl-targetLvl/2);
  this.lvl = targetLvl + targetLvlWiggleRoom;
  if (this.lvl <= 0) {
    this.lvl = 1;
  }
  if (this.lvl > this.maxLvl) {
    this.lvl = this.maxLvl;
  }
  this.hp = Math.ceil((Math.random()*5+5)*this.lvl*5*0.25);
  this.itemId;
  this.type = "boots"; // boots, harness, helmet, gloves or pants
}
// inherit from item
Armor.prototype = Object.create(Item.prototype);

// removes hp from armor
Armor.prototype.dmg = function(dmg) {
  this.hp -= dmg;
  if (this.hp < 0) {
    // TODO: remove armor from existence
  }
}

function Shirt(targetLvl) {
  this.maxLvl = 10;
  this.name = "shirt";
  var targetLvlWiggleRoom = Math.floor(Math.random()*targetLvl-targetLvl/2);
  this.lvl = targetLvl + targetLvlWiggleRoom;
  if (this.lvl <= 0) {
    this.lvl = 1;
  }
  if (this.lvl > this.maxLvl) {
    this.lvl = this.maxLvl;
  }
  this.hp = Math.ceil((Math.random()*5+5)*this.lvl*5*0.05);
  this.itemId;
  this.type = "harness"; // boots, harness, helmet, gloves or pants
}
Shirt.prototype = Object.create(Armor.prototype);

module.exports = {
  Shirt: Shirt
};
