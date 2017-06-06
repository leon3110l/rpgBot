var Item = require("./item");
// script with all the different weapons.

function Weapon(targetLvl, attackPower, exact) {
  this.name = "unnamed";
  this.type = "weapon";
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
  this.attackPower = attackPower || Math.ceil((Math.random()*5+5)*this.lvl*5)*0.25;
  this.actions = [
    {
      // name of the action/attack
      name: "example",
      // multiplies this number with the attackPower of the object in the attack
      attackPowerMultiplier: 1,
      // how many times you can use this in battle
      usage: 2,
      // how many times it has been used in battle
      used: 0,
      // how accurate the attack is from 0 to 1
      accuracy: 0.9,
      // chance to get a critical strike
      critChance: 0.2
    }
  ];
}
// inherit Item stuff
this.prototype = Object.create(Item.prototype);

// Weapon.prototype.attackDmg = function(actionIndex) {
//   if (this.actions[actionIndex].used < this.actions[actionIndex].usage) {
//     this.actions[actionIndex].used++;
//     return this.actions[actionIndex].power_multiplier * this.power
//   } else {
//     return 0 // it can't be used any more in this battle
//   }
// }
Weapon.prototype.resetActions = function() {
  for (var i = 0; i < this.actions.length; i++) {
    this.actions[i].used = 0;
  }
}

function Hand(targetLvl, attackPower, exact) {
  this.name = "hand";
  this.type = "weapon";
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
  this.attackPower = attackPower || Math.ceil((Math.random()*5+5)*this.lvl*5)*0.25;
  this.actions = [
    {
      name: "punch",
      attackPowerMultiplier: 1,
      usage: 10,
      used: 0,
      accuracy: 0.9,
      critChance: 0.2
    },
    {
      name: "hook",
      attackPowerMultiplier: 1.1,
      usage: 5,
      used: 0,
      accuracy: 0.85,
      critChance: 0.2
    },
    {
      name: "upper cut",
      attackPowerMultiplier: 1.5,
      usage: 3,
      used: 0,
      accuracy: 0.8,
      critChance: 0.2
    }
  ];
}
// inherit Weapon stuff
Hand.prototype = Object.create(Weapon.prototype);

function Bat(targetLvl, attackPower, exact) {
  this.name = "bat";
  this.type = "weapon";
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
  this.attackPower = attackPower || Math.ceil((Math.random()*5+5)*this.lvl*5)*0.25;
  this.actions = [
    {
      name: "swing",
      attackPowerMultiplier: 1.3,
      usage: 7,
      used: 0,
      accuracy: 0.9,
      critChance: 0.2
    },
    {
      name: "stab",
      attackPowerMultiplier: 0.8,
      usage: 10,
      used: 0,
      accuracy: 0.9,
      critChance: 0.2
    },
    {
      name: "slam",
      attackPowerMultiplier: 1.5,
      usage: 3,
      used: 0,
      accuracy: 0.9,
      critChance: 0.2
    }
  ];
}
Bat.prototype = Object.create(Weapon.prototype);


function HockeyStick(targetLvl, attackPower, exact) {
  this.name = "hockey stick";
  this.type = "weapon";
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
  this.attackPower = attackPower || Math.ceil((Math.random()*5+5)*this.lvl*5)*0.25;
  this.actions = [
    {
      name: "swing",
      attackPowerMultiplier: 1.2,
      usage: 7,
      used: 0,
      accuracy: 0.9,
      critChance: 0.2
    },
    {
      name: "stab",
      attackPowerMultiplier: 0.6,
      usage: 10,
      used: 0,
      accuracy: 0.9,
      critChance: 0.2
    },
    {
      name: "slam",
      attackPowerMultiplier: 1.3,
      usage: 3,
      used: 0,
      accuracy: 0.9,
      critChance: 0.2
    }
  ];
}
HockeyStick.prototype = Object.create(Weapon.prototype);

// export
module.exports = {
  Weapon: Weapon,
  Hand: Hand,
  Bat: Bat,
  HockeyStick: HockeyStick
};
