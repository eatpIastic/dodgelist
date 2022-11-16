/// <reference types="../CTAutocomplete" />

import PogObject from "PogData";
import request from '../requestV2';


function get_uuid(username, note) {
  request(`https://api.mojang.com/users/profiles/minecraft/${username}`)
    .then(function(res) {
      let uuid = JSON.parse(res).id;
      data.throwers[uuid] = [username, note];
      data.save();
    })
    .catch(function(err) {
      console.log(err.toString())
    })
}

let data = new PogObject("dodgelist", {
  "throwers": {},
  "first_time": true
}, ".throwers.json");


if(data.first_time) {
  data.first_time = false;
  data.save();
  ChatLib.chat("&c[DodgeList] &7Do /dodge to view commands.");
}

register("command", (...args) => {
  if(args[0]==undefined) {
    ChatLib.chat("&c[DodgeList] &7Commands:");
    ChatLib.chat("&7/dodge <player> <note>&8- &7Add a player to the list. Can write a note after the name about why that player is on the list.");
    ChatLib.chat("&7/dodge remove <player> &8- &7Remove a player from the list.");
    ChatLib.chat("&7/dodge list &8- &7List all players on the list.");
    ChatLib.chat("&7/dodge reset &8- &7Reset the list.");
    return;
  } else if(args[0]=="remove") {
    ChatLib.chat("&c[DodgeList] &7Removed &c" + args[1] + " &7from the list.");
    delete data.throwers[args[1]];
    data.save();
    return;
  } else if(args[0]=="list") {
    ChatLib.chat("&c[DodgeList] &7Players:")
    for(let i in data.throwers) {
      ChatLib.chat(`&7- ${data.throwers[i][0]}: ${data.throwers[i][1]}`);
    }
    return;
  } else if(args[0]=="reset") {
    data.throwers = {};
    data.first_time = true;
    data.save();
    ChatLib.chat("&c[DodgeList] &7Data reset.");
    return;
  } else {
    ChatLib.chat(`&c[DodgeList] &7Added ${args[0]} to the list.`);
    if(args.length==1) {
      get_uuid(args[0], "");
    }
    if(args.length>1) {
      get_uuid(args[0], args.slice(1).join(" "));
      ChatLib.chat(`&c[DodgeList] &7Note: &f${args.slice(1).join(" ")}`);
    }
  }
}).setName("dodge").setAliases(["dodgelist"]);

register("chat", (username) => {
  request(`https://api.mojang.com/users/profiles/minecraft/${username}`)
    .then(function(res) {
      let uuid = JSON.parse(res).id;
      if(data.throwers[uuid]) {
        ChatLib.chat(`&c[DodgeList] &7${data.throwers[uuid][0]}: &f${data.throwers[uuid][1]}`);

        if(data.throwers[uuid][0]!=username) {
          ChatLib.chat(`&c[DodgeList] ${username} has changed there name from ${data.throwers[uuid][0]} since they were added to the list.`);
          data.throwers[uuid][0] = username;
          data.save();
        }
      }
    })
}).setCriteria(/Dungeon Finder > (.+) joined the dungeon group! .+/)
