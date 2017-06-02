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
      // put armor classes here
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
    gloves: [

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
  weapons: [
    {
      name: "hand",
      item: Weapon.Hand,
      dropChance: 0
    },
    {
      name: "hockey stick"
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
// export so that the main file can require it all at once
module.exports = {
  // Food: Food,
  // Armor: Armor,
  // Weapon: Weapon,
  // Player: Player,
  items: items
};
