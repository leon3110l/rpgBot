var Game = require("./game");
// player
function Player(id, name, xp, lvl, hp, defense, attackPower, maxHp, equipedArmor, equipedWeapon, maxItems, items) {
  // player id from discord user id
  this.id = id || "0";
  this.name = name || "unnamed";
  this.xp = xp || 0;
  this.lvl = lvl || 0;
  this.equipedArmor = equipedArmor || {
    boots: null,
    pants: null,
    harness: null,
    helmet: null,
    gloves: null
  };
  // beginners Weapons
  this.equipedWeapons = equipedWeapon || new Game.items.weapon[0].item(this.lvl);
  // the items of the player
  this.items = items || [];
  // the max amount of items a player can have (inventory)
  this.maxItems = maxItems || 50;
  // max hp for the player it self
  this.maxHp = maxHp || 50;
  // hp from the player it self
  this.hp = hp || this.maxHp;
  // the defense points
  this.defense = defense || 0;
  // the attack points
  this.attackPower = attackPower || 0;
}

Player.prototype = {
  // TODO: attack function, eat function
  dropItem: function(item) {
    // drop the item
    this.items.splice(this.items.indexOf(item), 1);
  },
  // equips armor in a slot(boots(0), pants(1), harness(2), helmet(3) or gloves(4))
  equipArmor: function(armor, slot) {
    switch (slot) {
      case 0:
        slot = "boots";
        break;
      case 1:
        slot = "pants";
        break;
      case 2:
        slot = "harness";
        break;
      case 3:
        slot = "helmet";
        break;
      case 4:
        slot = "gloves";
        break;
    }
    // equip armor, boots, pants, harness, helmet or gloves
    this.equipedArmor[slot] = armor;
    // TODO: add to the defense points
  },
  // equips weapon in a slot(left(0) or right(1))
  equipWeapon: function(weapon, slot) {
    if (slot === 0) {
      slot = "left";
    } else if (slot === 1) {
      slot = "right";
    }
    // if there is an item equiped at that slot return the item to the items
    if (this.equipedWeapons[slot]) {
      // push it to the items
      this.items.push(this.equipedWeapons[slot]);
    }
    // equip weapon
    this.equipedWeapons[slot] = weapon;
    // remove item from items/inventory
    this.items.splice(this.items.indexOf(weapon), 1);
    // TODO: add to the attackPower of the player
  },
  // take damage, returns new hp from this player
  dmg: function(dmg) {
    this.hp -= dmg;
    if (this.hp < 0) {
      this.hp = 0;
    }
    return this.hp // returns new hp of the player
    // TODO: account for defense points and attack points of the enemy/opponent
  },
  // returns the actions of the equiped weapon
  getWeaponActions: function() {
    return this.equipedWeapon.actions;
  },
  // adds xp and lvls up if needed from enemy or an int
  // returns an object with lvl if it lvled up and new xp
  addXp: function(enemy) {
    var output = {};
    var lvlThreshold = Math.floor((Math.pow((this.lvl * 2), 2)  + 100) * 2);
    if (typeof enemy == Object) {
      this.xp += Math.round(Math.max((enemy.lvl - this.lvl), 1)*(Math.random()*10+1));
    } else { //xp amount
      this.xp += enemy;
    }
    // check if the player lvled up
    if (this.xp >= lvlThreshold) {
      this.lvl++;
      this.xp -= lvlThreshold;
      output.lvl = this.lvl;
    }
    output.xp = this.xp;
    // return object with lvl if it lvled up and new xp
    return output;
  },
  // resets all the weapons actions
  resetWeaponActions: function() {
    this.equipedWeapon.resetActions();
  },
  // adds an item to the player in the inventory/items array
  addItem: function(item) {
    if (this.items.length < this.maxItems) {
      this.items.push(item);
      return true;
    } else {
      return false;
    }
  }
};

module.exports = Player;
