var Item = require("./item");
// script with all the different weapons.

function Weapon(targetLvl) {
  this.name = "unnamed";
  this.type = "weapon";
  this.itemId;
  this.maxLvl = 5;
  var targetLvlWiggleRoom = Math.floor(Math.random()*targetLvl-targetLvl/2);
  this.lvl = targetLvl + targetLvlWiggleRoom;
  if (this.lvl <= 0) {
    this.lvl = 1;
  }
  if (this.lvl > this.maxLvl) {
    this.lvl = this.maxLvl;
  }
  this.dmg = Math.ceil((Math.random()*5+5)*this.lvl*5)*0.25;
  this.actions = [
    {
      // name of the action/attack
      name: "example",
      // multiplies this number with the dmg of the object in the attack
      dmg_multiplier: 1,
      // how many times you can use this in battle
      usage: 2,
      // how many times it has been used in battle
      used: 0
    }
  ];
}
// inherit Item stuff
this.prototype = Object.create(Item.prototype);

Weapon.prototype.attackDmg = function(actionIndex) {
  if (this.actions[actionIndex].used < this.actions[actionIndex].usage) {
    this.actions[actionIndex].used++;
    return this.actions[actionIndex].dmg_multiplier * this.dmg
  } else {
    return 0 // it can't be used any more in this battle
  }
}
Weapon.prototype.resetActions = function() {
  for (var i = 0; i < this.actions.length; i++) {
    this.actions[i].used = 0;
  }
}

function Hand(targetLvl) {
  this.itemId = 0;
  this.name = "hand";
  this.type = "weapon";
  this.maxLvl = 5;
  var targetLvlWiggleRoom = Math.floor(Math.random()*targetLvl-targetLvl/2);
  this.lvl = targetLvl + targetLvlWiggleRoom;
  if (this.lvl <= 0) {
    this.lvl = 1;
  }
  if (this.lvl > this.maxLvl) {
    this.lvl = this.maxLvl;
  }
  this.dmg = Math.ceil((Math.random()*5+5)*this.lvl*5*0.25);
  this.actions = [
    {
      name: "punch",
      dmg_multiplier: 1,
      usage: 10,
      used: 0
    },
    {
      name: "hook",
      dmg_multiplier: 1.1,
      usage: 5,
      used: 0
    },
    {
      name: "upper cut",
      dmg_multiplier: 1.5,
      usage: 3,
      used: 0
    }
  ];
}

function Bat(targetLvl) {
  this.itemId = 2;
  this.name = "Bat";
  this.type = "weapon";
  this.maxLvl = 10;
  var targetLvlWiggleRoom = Math.floor(Math.random()*targetLvl-targetLvl/2);
  this.lvl = targetLvl + targetLvlWiggleRoom;
  if (this.lvl <= 0) {
    this.lvl = 1;
  }
  if (this.lvl > this.maxLvl) {
    this.lvl = this.maxLvl;
  }
  this.dmg = Math.ceil((Math.random()*5+5)*this.lvl*5*0.25);
  this.actions = [
    {
      name: "swing",
      dmg_multiplier: 1.3,
      usage: 7,
      used: 0
    },
    {
      name: "stab",
      dmg_multiplier: 0.8,
      usage: 10,
      used: 0
    },
    {
      name: "slam",
      dmg_multiplier: 1.5,
      usage: 3,
      used: 0
    }
  ];
}
Bat.prototype = Object.create(Weapon.prototype);


function HockeyStick(targetLvl) {
  this.itemId = 3;
  this.name = "Hockey stick";
  this.type = "weapon";
  this.maxLvl = 10;
  var targetLvlWiggleRoom = Math.floor(Math.random()*targetLvl-targetLvl/2);
  this.lvl = targetLvl + targetLvlWiggleRoom;
  if (this.lvl <= 0) {
    this.lvl = 1;
  }
  if (this.lvl > this.maxLvl) {
    this.lvl = this.maxLvl;
  }
  this.dmg = Math.ceil((Math.random()*5+5)*this.lvl*5*0.25);
  this.actions = [
    {
      name: "swing",
      dmg_multiplier: 1.2,
      usage: 7,
      used: 0
    },
    {
      name: "stab",
      dmg_multiplier: 0.6,
      usage: 10,
      used: 0
    },
    {
      name: "slam",
      dmg_multiplier: 1.3,
      usage: 3,
      used: 0
    }
  ];
}
HockeyStick.prototype = Object.create(Weapon.prototype);

// inherit Weapon stuff
Hand.prototype = Object.create(Weapon.prototype);

// export
module.exports = {
  Weapon: Weapon,
  Hand: Hand,
  Bat: Bat,
  HockeyStick: HockeyStick
};
