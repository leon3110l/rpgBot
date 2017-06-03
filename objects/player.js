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
  // beginners Weapon
  this.equipedWeapon = equipedWeapon || new Game.items.weapon[0].item(this.lvl);
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
  equipArmor: function(armor) {

    // equip armor, boots, pants, harness, helmet or gloves
    this.equipedArmor[armor.armorType] = armor;
    // remove armor from items array/inventory
    this.items.splice(this.items.indexOf(armor), 1);
    // TODO: add to the defense points of the player
  },
  // equips weapon in a slot(left(0) or right(1))
  equipWeapon: function(weapon) {
    // if there is an item equiped at that slot return the item to the items
    if (this.equipedWeapon) {
      // push it to the items
      this.items.push(this.equipedWeapons);
    }
    // equip weapon
    this.equipedWeapon = weapon;
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
