const Discord = require("discord.js");
const client = new Discord.Client();
const tokens = require("./tokens");
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
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});

client.login(tokens.discord);

getPlayer("253555759038726145", player => {
  console.log(player);
  player.addXp(5);
  setPlayer(player);
});






















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
      console.log(results);
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
  pool.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return
    }

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
      conn.query("UPDATE weapon SET lvl = ?, attackPower = ?, name = ? WHERE id = ?", [player.equipedWeapon.lvl, player.equipedWeapon.attackPower, player.equipedWeapon.name, weaponId], (error, results, fields) => {
        if (error) {
          console.log(error);
          conn.destroy();
          return
        }
        conn.query("UPDATE user SET lvl = ?, xp = ?, hp = ?, maxHp = ?, maxItems = ?, attackPower = ?, defense = ?, weapon_id = ? WHERE user.id = ?", [player.lvl, player.xp, player.hp, player.maxHp, player.maxItems, player.attackPower, player.defense, weaponId, player.id], (error, results, fields) => {
          if (error) {
            console.log(error);
            conn.destroy();
            return
          }
        });
      });
    });

    // add items to the database
    conn.query("SELECT * FROM user_has_item WHERE user_id = ?", [player.id], (error, results, fields) => {
      if (error) {
        console.log(error);
        conn.destroy();
        return
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
          });
        }(results[i].item_id, player.items[i]));
      }
      // add items if needed
      var offset = results.length-1;
      if (offset < 0) {
        offset = 0;
      }
      for (var i = offset; i < player.items.length; i++) {
        console.log(i);
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
            });
          });
        }(player.items[i]));
      }
    });

    // add armor to the database
    conn.query("SELECT * FROM user_has_armor INNER JOIN armor ON armor_id = armor.id WHERE user_id = ?", [player.id], (error, results, fields) => {
      if (error) {
        console.log(error);
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
