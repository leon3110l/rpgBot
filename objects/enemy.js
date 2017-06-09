var Game = require("./game"); // used to generate armor and weapons
var Player = require("./player");
// basic enemy
// give it a lvl you want it to have
function Enemy(name, targetLvl) {
  // make it a bit more random
  var targetLvlWiggleRoom = Math.floor(Math.random()*targetLvl-targetLvl/2);
  this.lvl = targetLvl + targetLvlWiggleRoom;
  if (this.lvl <= 0) {
    this.lvl = 1;
  }
  this.name = name || "unnamed";
  this.type = "enemy";
  this.equipedArmor = {
    boots: this.getRandomArmor("boots"),
    pants: this.getRandomArmor("pants"),
    harness: this.getRandomArmor("harness"),
    helmet: this.getRandomArmor("helmet"),
    glove: this.getRandomArmor("glove")
  };
  this.equipedWeapon = this.getRandomWeapon();
  this.maxDropItems = 5;
  // the items it is going to drop if the user wins
  this.items = this.getDropItems();
  this.dropItems = this.items;
  // hp multiplier for easier enemy creation with more hp, make it harder, for something like bosses
  this.hpMultiplier = 5;
  // max hp for the enemy it self, hp when full
  this.maxHp = Math.ceil((Math.random()*this.hpMultiplier+this.hpMultiplier)*this.lvl*this.hpMultiplier);
  // current hp from the enemy it self
  this.hp = this.maxHp;
  // totalHp of the enemy including armor and buffs... when I add buffs
  this.totalHp = this.hp;
  // defense points
  this.defense = Math.round((Math.random() + 5) * this.lvl);
  // attackPower
  this.attackPower = Math.round((Math.random() + 10) * this.lvl);
  for (var armorPiece in this.equipedArmor) {
    // check if there is armor in the slot
    if (this.equipedArmor.hasOwnProperty(armorPiece) && this.equipedArmor[armorPiece]) {
      this.totalHp += this.equipedArmor[armorPiece].hp;
    }
  }
}
Enemy.prototype = Object.create(Player.prototype);

// gets a random weapon
Enemy.prototype.getRandomWeapon = function() {
  if (Game.items.weapon.length === 0) {
    return null
  }
  var weapon = new Game.items.weapon[Math.floor(Math.random()*Game.items.weapon.length)].item(this.lvl);
  if (Math.random() >= 0.5) {
    return weapon
  } else {
    return null
  }
}
// get a random piece of armor, same as getRandomWeapon but for armor, left(0) or right(1) in type
Enemy.prototype.getRandomArmor = function(type) {
  switch (type) {
    case 0:
      type = "boots";
      break;
    case 1:
      type = "pants";
      break;
    case 2:
      type = "harness";
      break;
    case 3:
      type = "helmet";
      break;
    case 4:
      type = "glove";
      break;
  }
  if (Game.items.armor[type].length === 0) {
    return null
  }
  var armor = new Game.items.armor[type][Math.floor(Math.random()*Game.items.armor[type].length)].item(this.lvl);
  if (Math.random() >= 0.5) {
    return armor
  } else {
    return null
  }
}

Enemy.prototype.getDropItems = function() {
  var dropItems = [];
  for (var item in Game.items) {
    if (Game.items.hasOwnProperty(item)) {
      if (item === "food") {
        if (Game.items[item].length > 0) {
          var selectedItem = Game.items[item][Math.floor(Math.random()*Game.items[item].length)];
        }
      } else {
        for (var item1 in Game.items[item]) {
          if (Game.items[item].hasOwnProperty(item1)) {
            if (Game.items[item][item1].length > 0) {
              var selectedItem = Game.items[item][item1][Math.floor(Math.random()*Game.items[item][item1].length)];
            }
          }
        }
      }
      // console.log(selectedItem);
      if (selectedItem.dropChance > Math.random() && dropItems.length < this.maxDropItems) {
        dropItems.push(new selectedItem.item(this.lvl));
        // possibility for double drops
        if (selectedItem.dropChance > Math.random() && dropItems.length < this.maxDropItems) {
          dropItems.push(new selectedItem.item(this.lvl));
        }
      }
    }
  }
  return dropItems;
}

// enemy ai, its mostly random
Enemy.prototype.doMove = function(opponent) {
  // if low health eat
  if (this.hp < (this.maxHp*0.4)) {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].type == "food") {
        this.eat(this.items[i]);
        break;
      }
    }
  } else { //else attack
    // check if there is a weapon
    if (this.equipedWeapon) {
      // get actions for the weapon
      var actions = this.getWeaponActions();
      // attack with a random action
      this.attack(opponent, Math.floor(Math.random()*actions.length));
    }
  }
}

module.exports = Enemy;
