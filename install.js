// discordBot install script
var fs = require("fs");
var child = require("child_process");
var data = require("./tokens_default");

// used to get user input
function prompt(question, callback) {
    var stdin = process.stdin,
        stdout = process.stdout;

    stdin.resume();
    stdout.write(question);

    stdin.once('data', function (data) {
        callback(data.toString().trim());
    });
}

if (!fs.existsSync("node_modules")) {
  install();
} else {
  prompt("do you want to do a completely reinstall y/n ", (input) => {
    if (input == "y") {
      if (deleteRecursive("node_modules")) {
        console.log("done deleting old files");
        install();
      } else {
        throw "something went wrong!";
      }
    } else if(input == "n") {
      createToken();
    }
  });
}

function deleteRecursive(path) {
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    if (!files.length == 0) {
      files.forEach((file, index) => {
        var current = path+"/"+file;
        if (fs.lstatSync(current).isDirectory()) {
          deleteRecursive(current);
        } else {
          fs.unlinkSync(current);
        }
      });
    }
    fs.rmdirSync(path);
    return true
  } else {
    return false
  }
}

function install() {
  const spawn = child.spawn;
  const ls = spawn('npm', ['install']);

  ls.stdout.on('data', (data) => {
    process.stdout.write(data.toString());
  });

  ls.stderr.on('data', (data) => {
    process.stdout.write(data.toString());
  });

  ls.on('close', (code) => {
    createToken();
  });
}

function createToken() {
  if (fs.existsSync("tokens.json")) {
    fs.unlink("tokens.json", (err) => {
      if (err) {
        console.error("couldn't delete tokens.json");
      }
    });
  }

  prompt("paste your discord token\n", (input) => {
    data.discord = input;
    prompt("what prefix would you like, default: $ ($)", (input) => {
      if (input) {
        data.prefix = input;
      }
      prompt("the defaults are\nDBhost: "+data.DBhost+"\nDBusername: "+data.DBusername+"\nDBpassword: "+data.DBpassword+"\ndo you want to change your DB login? y/n ", (input) => {
        if (input.toLowerCase() == "n") {
          writeTokens();
        } else if (input.toLowerCase() == "y") {
          prompt("DB host (localhost)\n", (input) => {
            if (input) {
              data.DBhost = input;
            }
            prompt("DB username (discord)\n", (input) => {
              if (input) {
                data.DBusername = input;
              }
              prompt("DB password (discord)\n", (input) => {
                if (input) {
                  data.DBpassword = input;
                }
                writeTokens();
              });
            });
          });
        } else {
          console.log("you didn't press the correct key.");
          createToken();
          return
        }
      });
    });
  });
  function writeTokens() {
    fs.writeFile('tokens.json', JSON.stringify(data), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
      console.log("you can now start the bot by typing\nnode index.js");
      console.log("done!");
      process.exit();
    });
  }
}
