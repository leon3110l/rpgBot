// a javascript file for all the game components
var Food = require("./food");
var Armor = require("./armor");
var Weapon = require("./weapon");
// var Player = require("./player");
// var Enemy = require("./enemy");

// index of all the items, used for enemy creation and enemy drops
var items =
{
  // all the armor pieces
  armor: {
    boots: [

    ],
    pants: [

    ],
    harness: [
      {
        name: "shirt",
        item: Armor.Shirt,
        dropChance: 0.05
      }
    ],
    helmet: [

    ],
    glove: [

    ]
    // ring: [
    //   left: [
    //
    //   ],
    //   right: [
    //
    //   ]
    // ]
    // amulet: [
    //
    // ]
  },
  // all the weapons
  weapon: [
    {
      name: "hand",
      item: Weapon.Hand,
      dropChance: 0
    },
    {
      name: "hockey stick",
      item: Weapon.HockeyStick,
      dropChance: 0.45
    },
    {
      name: "bat",
      item: Weapon.Bat,
      dropChance: 0.3
    }
  ],
  // shield
  // shield: [
  //
  // ],
  // all the different foods
  food: [
    {
      name: "donut",
      item: Food.Donut,
      dropChance: 0.3
    },
    {
      name: "pizza",
      item: Food.Pizza,
      dropChance: 0.5
    }
  ]
};


// returns the object, you need to initialize it when you get it
// example
// var item = create("armor", "shirt", "harness");
// console.log(new item(5));
function create(itemType, itemName, armorType, properties) {
  var output;
  if (itemType === "armor") {
    if (armorType === "boots") {
      output = items.armor.boots.find(armor => armor.name === itemName).item;
    } else if (armorType === "pants") {
      output = items.armor.pants.find(armor => armor.name === itemName).item;
    } else if (armorType === "harness") {
      output = items.armor.harness.find(armor => armor.name === itemName).item;
    } else if (armorType === "helmet") {
      output = items.armor.helmet.find(armor => armor.name === itemName).item;
    } else if (armorType === "glove") {
      output = items.armor.glove.find(armor => armor.name === itemName).item;
    }
  } else if (itemType === "weapon" || itemType === "weapons") {
    output = items.weapon.find(weapon => weapon.name === itemName).item;
  } else if (itemType === "food") {
    output = items.food.find(food => food.name === itemName).item;
  }
  if (typeof properties == "object") {
    if (itemType === "armor") {
      output = new output(properties.targetLvl, properties.defense, true);
    } else if (itemType === "weapon") {
      output = new output(properties.targetLvl, properties.attackPower, true);
    } else if (itemType === "food") {
      output = new output(properties.targetLvl, properties.hp, true);
    }
  }
  return output;
}

// export so that the main file can require it all at once
module.exports = {
  // Food: Food,
  // Armor: Armor,
  // Weapon: Weapon,
  // Player: Player,
  items: items,
  create: create
};
