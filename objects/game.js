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
  weapons: {
    left: [
      {
        item: Weapon.Hand,
        dropChance: 0
      },
      {
        item: Weapon.HockeyStick,
        dropChance: 0.45
      }
    ],
    right: [
      {
        item: Weapon.Hand,
        dropChance: 0
      },
      {
        item: Weapon.Bat,
        dropChance: 0.35
      }
    ]
  },
  // shield
  // shield: [
  //
  // ],
  // all the different foods
  food: [
    {
      item: Food.Donut,
      dropChance: 0.1
    },
    {
      item: Food.Pizza,
      dropChance: 0.2
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
