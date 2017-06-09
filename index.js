require("console-stamp")(console); // display the date and time of the console.logs, for easier debugging
const Discord = require("discord.js");
const client = new Discord.Client();
const tokens = require("./tokens");
const prefix = tokens.prefix;
const mysql = require("mysql");

// game components
const game = require("./objects/game.js");
const Player = require("./objects/player.js");
const Enemy = require("./objects/enemy.js");
var battles = []; // an array with battle objects

// create mysql pool
var pool = mysql.createPool({
  connectionLimit: 50, // to be on the safe side
  host: tokens.DBhost || "localhost",
  user: tokens.DBusername || "rpgBot",
  password: tokens.DBpassword || "rpgBot",
  database: tokens.DBname || "rpgBot"
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`);
  syncDB(); // update all the members and guilds
});

client.on('message', msg => {
  // check if the prefix is used if not return(don't go further) and if it is a bot return
  if (msg.content.indexOf(prefix) != 0 || !client.user.bot) {
    return
  }
  msg.content = msg.content.substring(1, msg.content.length).trim(); // remove the prefix from the msg.content and trim it in case the user used a space
  // write code after this
  if (startsWith(msg.content, "battle")) {
    // find the battle
    var battle = battles.find(x => x.player.id === msg.author.id);
    // if there is no battle start a new one
    if (!battle) {
      // create a battle
      getPlayer(msg.author.id, player => {
        // create new battle
        battle = {
          player: player,
          enemy: new Enemy(null, player.lvl),
          startTime: new Date(),
          status: 0
        };
        battles.push(battle); // add the battle to the battles array
        msg.reply("battle started!");
        battleHandler(battle, msg);
      });
    } else {
      battleHandler(battle, msg);
    }
  }
  if (msg.content === "invite") {
    client.generateInvite()
      .then(link => {
        msg.channel.send("invite link: "+link);
      });
  }
});

client.login(tokens.discord);

function battleHandler(battle, msg) {
  var percentageBarOptions = {empty: ":broken_heart:", full: ":heart:"}; // the options all the percentageBar calls should have
  switch (battle.status) {
    case 0: // start
      start();
      break;
    case 1: //attack
      attack();
      break;
    case 2: //item
      item();
      break;
    case 3:
      stats();
      break;
    // 999 run/escape/stop
  }
  // the start menu
  function start() {
    if (msg.content === "battle") {
      var reply = "\n" + battle.player.name + ":\t\t";
      reply += battle.player.hp + "/" + battle.player.maxHp + " HP " + percentageBar((battle.player.hp/battle.player.maxHp), 14, percentageBarOptions)+"\t\t\t\t\t\t";
      reply += battle.enemy.name + ":\t\t";
      reply += battle.enemy.hp + "/" + battle.enemy.maxHp + " HP " + percentageBar((battle.enemy.hp/battle.enemy.maxHp), 14, percentageBarOptions)+"\n\n";
      reply += "0. attack \t\t\t\t\t\t 1. item \t\t\t\t\t\t 2. stats \t\t\t\t\t\t 3. run";
      msg.reply(reply);
    } else {
      if (msg.content === "battle 0") {
        // goto attack menu
        battle.status = 1;
      } else if (msg.content === "battle 1") {
        // goto item menu
        battle.status = 2;
      } else if (msg.content === "battle 2") {
        battle.status = 3;
      } else if (msg.content === "battle 3") {
        // stop battle
        msg.reply("you ran away");
        battle.status = 999;
      }
      msg.content = "battle"; // added to prevent a loop
      if (battle.status != 999) {
        battleHandler(battle, msg);
      }
    }
  }
  // the attack menu
  function attack() {
    var actions = battle.player.getWeaponActions();
    if (msg.content === "battle") {
      var reply = "what would you like to do?\n\n";
      for (var i = 0; i < actions.length; i++) {
        reply += i+". " + battle.player.equipedWeapon.name + " " + actions[i].name + ", " + Math.round(actions[i].attackPowerMultiplier * battle.player.equipedWeapon.attackPower + battle.player.attackPower) + " power\n";
      }
      reply += actions.length +". back";
      msg.reply(reply);
    } else {
      for (var i = 0; i < actions.length; i++) {
        if (msg.content === "battle "+i) { // some attack
          var opponentStats = battle.player.attack(battle.enemy, battle.player.equipedWeapon, i);
          if (opponentStats.miss) {
            msg.reply("you missed!");
          } else {
            if (opponentStats.crit) {
              msg.reply("it was a critical hit!");
            }
            msg.reply("you used " + actions[i].name + " with your " + battle.player.equipedWeapon.name + " and did " + opponentStats.dmg + " damage!");
          }
          if (opponentStats.hp === 0) {
            msg.reply("you won!");
            for (var j = 0; j < battle.enemy.dropItems.length; j++) {
              if (battle.player.addItem(battle.enemy.dropItems[j])) {
                msg.reply("you got a " + battle.enemy.dropItems[j].name);
              } else {
                // TODO: make something that askes what item to drop
              }
            }
            battle.player.addXp(battle.enemy);
            battle.status = 999; // exit the game
          } else {
            battle.status = 0; // go back to the first screen
          }
        }
      }
      if (msg.content === "battle "+actions.length) { // the back button
        battle.status = 0; // go back to the start
      }
      msg.content = "battle"; // added to prevent a loop
      battleHandler(battle, msg);
    }
  }
  // the item menu
  function item() {
    var items = battle.player.items;
    if (msg.content === "battle") {
      var reply = "inventory: \n";
      for (var i = 0; i < items.length; i++) {
        reply += i+". " + items[i].name + "\t\t\t";
        if ((i % 3) === 0) {
          reply += "\n";
        }
      }
      reply += items.length + ". back";
      msg.reply(reply);
    } else {
      for (var i = 0; i < items.length; i++) {
        if (msg.content === "battle "+i) {
          // TODO: use item
        }
      }
      if (msg.content === "battle "+items.length) {
        battle.status = 0; // go back to the start
      }
      msg.content = "battle"; // added to prevent a loop
      battleHandler(battle, msg);
    }
  }
  // gets current stats from the battle
  function stats() {
    var player = battle.player;
    var enemy = battle.enemy;
    var reply = "stats\n";
    var info = [];
    if (!battle.enemy.equipedWeapon) {
      var enemyWeapon = "nothing";
      var enemyWeaponAP = 0;
    } else {
      var enemyWeapon = battle.enemy.equipedWeapon.name;
      var enemyWeaponAP = battle.enemy.equipedWeapon.attackPower;
    }
    if (!battle.player.equipedWeapon) {
      var playerWeapon = "nothing";
      var playerWeaponAP = 0;
    } else {
      var playerWeapon = battle.player.equipedWeapon.name;
      var playerWeaponAP = battle.player.equipedWeapon.attackPower;
    }
    var totalDEFplayer = player.defense;
    for (var armor in player.equipedArmor) {
      if (player.equipedArmor.hasOwnProperty(armor) && player.equipedArmor[armor]) {
        totalDEFplayer += player.equipedArmor[armor].defense;
      }
    }
    var totalDEFenemy = enemy.defense;
    for (var armor in enemy.equipedArmor) {
      if (enemy.equipedArmor.hasOwnProperty(armor) && enemy.equipedArmor[armor]) {
        totalDEFenemy += enemy.equipedArmor[armor].defense;
      }
    }
    // add all the rows to the array
    info.push(["name", player.name, enemy.name]); // push names
    info.push(["lvl", player.lvl.toString(), enemy.lvl.toString()]); // push lvl
    info.push(["DEF", player.defense.toString(), enemy.defense.toString()]); // defense
    info.push(["AP", player.attackPower.toString(), enemy.attackPower.toString()+"\n"]); // attack power
    info.push(["weapon", playerWeapon, enemyWeapon]); // weapon name
    info.push(["weapon AP", playerWeaponAP.toString(), enemyWeaponAP.toString()+"\n"]); // weapon attackPower
    info.push(["total AP", (player.attackPower + playerWeaponAP).toString(), (enemy.attackPower + enemyWeaponAP).toString()]); // total AP the person has
    info.push(["total DEF", totalDEFplayer.toString(), totalDEFenemy.toString()]); // total defense points

    reply += textGrid(info);
    msg.reply("```"+reply+"```"); // add it to a code block to get the monospaced font
    msg.content = "battle";
    battle.status = 0;
    battleHandler(battle, msg);
  }
  battles.splice(battles.indexOf(battle), 1); // remove battle from battles array
  // statuscode 999 is escape code(remove from battles array and update player)
  if (battle.status != 999) {
    battles.push(battle); // push the updated battle to the battles array
  } else {
    setPlayer(battle.player); // upload player to the DB
  }
}



// input array needs to be a two dimensional array
// discord font is not monospaced
// in the options put every character with a different width to accomadate for non monospaced fonts
// options should look like this {m: -1, l: 1} difference from normal width, the more width the more you need to subtract and vise versa
// options is unneeded, because code block uses a monospaced font
function textGrid(array, options) {
  var text = "";
  // get biggest word for every row;
  var wordlengths = {};
  // get lengths
  for (var i = 0; i < array.length; i++) {
    for (var j = 0; j < array[i].length; j++) {
      var length = 0;
      for (var char in options) {
        if (options.hasOwnProperty(char)) {
          var offset = 0;
          while (array[i][j].indexOf(char, offset) != -1) {
            length += options[char];
            offset = array[i][j].indexOf(char, offset)+1;
          }
        }
      }
      length += array[i][j].length;
      if (length > wordlengths["col"+j] || !wordlengths["col"+j]) {
        wordlengths["col"+j] = length;
      }
    }
  }
  // generate text
  for (var i = 0; i < array.length; i++) {
    for (var j = 0; j < array[i].length; j++) {
      text += array[i][j] + " ";
      for (var k = 0; k < (wordlengths["col"+j] - array[i][j].length); k++) {
        text += " ";
      }
    }
    text += "\n";
  }
  return text
}















// gets a user from the database and adds all the items
// example/test
// getPlayer("253555759038726145", (player) => {
//   console.log(player);
// });
function getPlayer(userId, callback) {
  pool.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return
    }
    conn.query("SELECT item.id, item.type, item.lvl AS targetLvl, item.hp, item.defense, item.attackPower, item.armorType, item.name FROM user_has_item LEFT JOIN item ON item.id = item_id WHERE user_id = ?", [userId], (error, results, fields) => {
      if (error) {
        console.log(error);
        conn.destroy();
        return
      }
      var items = [];
      for (var i = 0; i < results.length; i++) {
        items.push(game.create(results[i].type, results[i].name, results[i].armorType, results[i])); //should create the item and push it in the items
      }
      conn.query("SELECT armor.id, armor.lvl AS targetLvl, armor.defense, armor.name, armor.armorType FROM user_has_armor LEFT JOIN armor ON armor.id = armor_id WHERE user_id = ?", [userId], (error, results, fields) => {
        if (error) {
          console.log(error);
          conn.destroy();
          return
        }
        var armor = {};
        for (var i = 0; i < results.length; i++) {
          var tmp = game.create("armor", results[i].name, results[i].armorType, results[i]); //should create the item
          armor[tmp.armorType] = tmp; // adds the armor
        }
        conn.query("SELECT user.name AS username, weapon_id, user.lvl AS userLvl, user.xp AS userXp, user.hp AS userHp, user.maxHp AS userMaxHp, user.maxItems AS userMaxItems, user.attackPower AS userAttackPower, user.defense AS userDefense, weapon.lvl AS weaponLvl, weapon.attackPower AS weaponAttackPower, weapon.name AS weaponName FROM user LEFT JOIN weapon ON weapon.id = weapon_id WHERE user.id = ?", [userId], (error, results, fields) => {
          if (error) {
            console.log(error);
            conn.destroy();
            return
          }
          if (!results[0].weapon_id) {
            var weapon = null;
          } else {
            var weapon = game.create("weapon", results[0].weaponName, results[0].armorType, {targetLvl: results[0].weaponLvl, attackPower: results[0].weaponAttackPower});
          }
          // returns a player with all of those things
          var player = new Player(userId, results[0].username, results[0].userXp, results[0].userLvl, results[0].userHp, results[0].userDefense, results[0].userAttackPower, results[0].userMaxHp, armor, weapon, results[0].userMaxItems, items);
          conn.destroy(); // remove conn from pool to prevent crashes and to make an connection available
          callback(player);
        });
      });
    });
  });
}

// updates the player on the database
function setPlayer(player) {
  // weapon and user connection
  pool.getConnection((err, conn) => {
    // add user and weapon to the database
    conn.query("SELECT weapon_id FROM user WHERE user.id = ?", [player.id], (error, results, fields) => {
      if (error) {
        console.log(error);
        conn.destroy();
        return
      }
      if (results[0]) {
        weaponId = results[0].weapon_id;
      } else {
        weaponId = null;
      }
      // update weapon if there is a weapon
      if (weaponId) {
        conn.query("UPDATE weapon SET lvl = ?, attackPower = ?, name = ? WHERE id = ?", [player.equipedWeapon.lvl, player.equipedWeapon.attackPower, player.equipedWeapon.name, weaponId], (error, results, fields) => {
          if (error) {
            console.log(error);
            conn.destroy();
            return
          }
          updateUser();
        });
      }
      if (weaponId === null) {
        conn.query("INSERT INTO weapon(lvl, attackPower, name) VALUES (?, ?, ?)", [player.equipedWeapon.lvl, player.equipedWeapon.attackPower, player.equipedWeapon.name], (error, results, fields) => {
          if (error) {
            console.log(error);
            conn.destroy();
            return
          }
          weaponId = results.insertId;
          updateUser();
        });
      }
      function updateUser() {
        conn.query("UPDATE user SET lvl = ?, xp = ?, hp = ?, maxHp = ?, maxItems = ?, attackPower = ?, defense = ?, weapon_id = ? WHERE user.id = ?", [player.lvl, player.xp, player.hp, player.maxHp, player.maxItems, player.attackPower, player.defense, weaponId, player.id], (error, results, fields) => {
          if (error) {
            console.log(error);
            conn.destroy();
            return
          }
          conn.destroy();
        });
      }
    });
  });

  // item connection
  pool.getConnection((err, conn) => {
    // add items to the database
    conn.query("SELECT * FROM user_has_item WHERE user_id = ?", [player.id], (error, results, fields) => {
      if (error) {
        console.log(error);
        conn.destroy();
        return
      }
      if (player.items.length === 0 && results.length === 0) {
        conn.destroy();
      }
      // reuse old items in the database for optimal use, because of this I don't need to add them to user_has_item
      for (var i = 0; i < results.length; i++) {
        (function(itemId, item){
          conn.query("UPDATE item SET type = ?, lvl = ?, hp = ?, defense = ?, attackPower = ?, armorType = ?, name = ? WHERE id = ?", [item.type, item.lvl, item.hp, item.defense, item.attackPower, item.armorType, item.name, itemId], (error, results, fields) => {
            if (error) {
              console.log(error);
              conn.destroy();
              return
            }
            if (item === player.items[player.items.length-1]) {
              conn.destroy();
            }
          });
        }(results[i].item_id, player.items[i]));
      }
      // add items if needed
      var offset = results.length-1;
      if (offset < 0) {
        offset = 0;
      }
      for (var i = offset; i < player.items.length; i++) {
        (function(item) {
          conn.query("INSERT INTO item(type, lvl, hp, defense, attackPower, armorType, name) VALUES(?, ?, ?, ?, ?, ?, ?)", [item.type, item.lvl, item.hp, item.defense, item.attackPower, item.armorType, item.name], (error, results, fields) => {
            if (error) {
              console.log(error);
              conn.destroy();
              return
            }
            conn.query("INSERT INTO user_has_item(user_id, item_id) VALUES (?, ?)", [player.id, results.insertId], (error, results, fields) => {
              if (error) {
                console.log(error);
                conn.destroy();
                return
              }
              if (item === player.items[player.items.length-1]) {
                conn.destroy();
              }
            });
          });
        }(player.items[i]));
      }
    });
  });
  // armor connection
  pool.getConnection((err, conn) => {
    // add armor to the database
    conn.query("SELECT * FROM user_has_armor INNER JOIN armor ON armor_id = armor.id WHERE user_id = ?", [player.id], (error, results, fields) => {
      if (error) {
        console.log(error);
        conn.destroy();
        return
      }
      var found = false;
      for (var armor in player.equipedArmor) {
        if (player.equipedArmor.hasOwnProperty(armor)) {
          if (player.equipedArmor[armor] && results.length === 0) {
            found = true;
          }
        }
      }
      if (!found) {
        conn.destroy();
        return
      }
      // reuse old items in the database for optimal use, because of this I don't need to add them to user_has_item
      for (var i = 0; i < results.length; i++) {
        (function(armorId, armor){
          conn.query("UPDATE armor SET lvl = ?, defense = ?, name = ? WHERE id = ?", [armor.lvl, armor.defense, armor.name, armorId], (error, results, fields) => {
            if (error) {
              console.log(error);
              conn.destroy();
              return
            }
            // if armor is the last armor piece, destroy connection
            var armorArray = player.equipedArmor.keys().map(key => obj[key]);
            if (armor === armorArray[armorArray.length-1]) {
              conn.destroy();
            }
          });
        }(results[i].armor_id, player.equipedArmor[results[i].armorType]));
      }
      // add items if needed
      for (var armor in player.equipedArmor) {
        // if there is no armor of that type already and he has it equiped
        if (player.equipedArmor.hasOwnProperty(armor) && player.equipedArmor[armor] && !results.find(result => result.armorType === armor)) {
          // add armor to the database
          (function(armor) {
            conn.query("INSERT INTO item(lvl, defense, name, armorType) VALUES(?, ?, ?, ?)", [armor.lvl, armor.defense, armor.name, armor.armorType], (error, results, fields) => {
              if (error) {
                console.log(error);
                conn.destroy();
                return
              }
              conn.query("INSERT INTO user_has_armor(user_id, armor_id) VALUES (?, ?)", [player.id, results.insertId], (error, results, fields) => {
                if (error) {
                  console.log(error);
                  conn.destroy();
                  return
                }
                // if armor is the last armor piece, destroy connection
                var armorArray = player.equipedArmor.keys().map(key => obj[key]);
                if (armor === armorArray[armorArray.length-1]) {
                  conn.destroy();
                }
              });
            });
          }(player.equipedArmor[armor]));
        }
      }
    });
  });
}

// adds new members and new guilds
function syncDB(callback) {
  pool.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      conn.destroy();
      return
    }
    var guilds = client.guilds.array();
    for (var i = 0; i < guilds.length; i++) {
      (function(guild) {
        conn.query("SELECT id FROM guild WHERE id = ?", [guild.id], (error, results, fields) => {
          if (error) {
            console.log(error);
            conn.destroy();
            return
          }
          if (!results[0]) {
            conn.query("INSERT INTO guild(id, name) VALUES (?, ?)", [guild.id, guild.name], (error, results, fields) => {
              if (error) {
                console.log(error);
                conn.destroy();
                return
              }
              addMembers(guild);
            });
          } else {
            addMembers(guild);
          }
          function addMembers(guild) {
            var members = guild.members.array();
            for (var i = 0; i < members.length; i++) {
              // use anonymous function to handle with the asynchronous stuff with a for loop
              (function(member, guild) {
                // use ? and [] to remove drop database stuff
                conn.query("SELECT id FROM user WHERE id = ?", [member.id], (error, results, fields) => {
                  if (error) {
                    console.log(error);
                    conn.destroy();
                    return
                  }
                  if (!results[0]) {
                    // de user niet gevonden dus maak hem aan
                    conn.query("INSERT INTO user(id, name) VALUES (?, ?)", [member.id, member.user.username], (error, results, fields) => {
                      if (error) {
                        console.log(error);
                        conn.destroy();
                        return
                      }
                      conn.query("INSERT INTO guild_has_user(user_id, guild_id) VALUES(?, ?)", [member.id, guild.id], (error, results, fields) => {
                        if (error) {
                          console.log(error);
                          conn.destroy();
                          return
                        }
                        // if its at the last user and the last guild
                        if(member.id === members[members.length-1].id && guild.id === guilds[guilds.length-1].id) {
                          // destroy connection to DB
                          conn.destroy();
                          if (callback) {
                            callback(); // call the callback
                          }
                        }
                      });
                    });
                  } else {
                    // if its at the last user and the last guild
                    if(member.id === members[members.length-1].id && guild.id === guilds[guilds.length-1].id) {
                      // destroy connection to DB
                      conn.destroy();
                      if (callback) {
                        callback(); // call the callback
                      }
                    }
                  }
                });
              }(members[i], guild));
            }
          }
        });
      }(guilds[i]));
    }
  });
}

// example
// console.log(percentageBar(0.75, 14, {caps: "()"}));
// percentage from 0 to 1 and width in character length, the options are {caps: "[]", full: "#", empty: "-"}
function percentageBar(percentage, width, options) {
  if (!options) {
    options = {};
  }
  if (!options.caps) {
    options.caps = "[]";
  }
  if (!options.full) {
    options.full = "#";
  }
  if (!options.empty) {
    options.empty = "-";
  }
  if (!width) {
    width = 14;
  }
  var bar = options.caps.substring(0, 1);
  var hashAmount = Math.round(width*percentage);
  var dashAmount = width - hashAmount;
  for (var i = 0; i < (hashAmount + dashAmount); i++) {
    if (i < hashAmount) {
      bar+= options.full;
    } else {
      bar+= options.empty;
    }
  }
  bar += options.caps.substring(1, 2);
  return bar
}

function startsWith(str, word) {
  str = str.trim();
  if (str.indexOf(word) === 0) {
    return true
  } else {
    return false
  }
}
