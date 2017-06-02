const Discord = require("discord.js");
const client = new Discord.Client();
const tokens = require("./tokens");
const mysql = require("mysql");
var pool = mysql.createPool({
  connectionLimit: 50, // to be on the safe side
  host: tokens.DBhost || "localhost",
  user: tokens.DBusername || "rpgBot",
  password: tokens.DBpassword || "rpgBot",
  database: tokens.DBname || "rpgBot"
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`);
  syncDB();
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});

client.login(tokens.discord);

// adds new members and new guilds
function syncDB() {
  pool.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return
    }
    var guilds = client.guilds.array();
    for (var i = 0; i < guilds.length; i++) {
      (function(guild) {
        conn.query("SELECT id FROM guild WHERE id = ?", [guild.id], (error, results, fields) => {
          if (error) {
            console.log(error);
            return
          }
          if (!results[0]) {
            conn.query("INSERT INTO guild(id, name) VALUES (?, ?)", [guild.id, guild.name], (error, results, fields) => {
              if (error) {
                console.log(error);
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
                    return
                  }
                  if (!results[0]) {
                    // de user niet gevonden dus maak hem aan
                    conn.query("INSERT INTO user(id, name) VALUES (?, ?)", [member.id, member.user.username], (error, results, fields) => {
                      if (error) {
                        console.log(error);
                        return
                      }
                      conn.query("INSERT INTO guild_has_user(user_id, guild_id) VALUES(?, ?)", [member.id, guild.id], (error, results, fields) => {
                        if (error) {
                          console.log(error);
                          return
                        }
                      });
                    });
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
