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

// gets a user from the database and adds all the items
// example/test
// getPlayer("253555759038726145", (player) => {
//   console.log(player);
// });
function getPlayer(userId, callback) {
  pool.getConnection((err, conn) => {
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
          callback(player);
        });
      });
    });
  });
}

// updates the player on the database
function setPlayer(player) {

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
