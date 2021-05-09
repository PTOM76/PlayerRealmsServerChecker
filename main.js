const http = require('http');
const querystring = require('querystring');

http.createServer(function (req, res) {
  if (req.method == 'POST') {
    var data = "";
    req.on('data', function (chunk) {
      data += chunk;
    });
    req.on('end', function () {
      if (!data) {
        console.log("No post data");
        res.end();
        return;
      }
      var dataObject = querystring.parse(data);
      console.log("post:" + dataObject.type);
      if (dataObject.type == "wake") {
        console.log("Woke up in post");
        res.end();
        return;
      }
      res.end();
    });
  } else if (req.method == 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    res.end('Discord Bot is active now\n');
  }
}).listen(3000);
const discord = require('discord.js');
const client = new discord.Client();
client.on('ready', message => {
  client.user.setActivity("pr!help", {
    "type": "PLAYING",
    "status": "online"
  });
  console.log('pr bot is ready!');
});
client.on('message', msg => {
  if (msg.author.bot) {
    return;
  }
  let ch = msg.channel;
  let args = msg.content.split(" ").slice(0);
  if (args[0] === "pr!help") {
    ch.send({
      embed: {
        title: "コマンド一覧",
        color: 0xffffff,
        fields: [
          {
            name: "ヘルプ表示",
            value: "`pr!help`",
            inline: true
          },
          {
            name: "ボット情報表示",
            value: "`pr!info`",
            inline: true
          },
          {
            name: "サーバーリスト表示",
            value: "`pr!serverlist ([normal/simple/easy])`",
            inline: true
          },
          {
            name: "ステータス表示",
            value: "`pr!status`",
            inline: true
          },
          {
            name: "サーバー情報表示",
            value: "`pr!server [サーバー名]`",
            inline: true
          }
        ]
      }
    });
    return;
  }
  if (args[0] === "pr!info") {
    ch.send({
      embed: {
        title: "ボット情報",
        color: 0xffffff,
        footer: {
          icon_url: "https://cravatar.eu/helmhead/Pitan_MAD",
          text:"ボット開発者:Pitan"},
        fields: [
          {
            name: "ボット名",
            value: "PlayerRealms Server Checker",
            inline: false
          },
          {
            name: "説明",
            value: "このボットはPlayerRealms公式のボットではありません。\nPlayerRealmsのAPIを利用して試しにつくってみたボットです。",
            inline: false
          },
          {
            name: "詳細",
            value: "ユーザー名:PlayerRealms Server Checker#4577\nプログラミング言語:JavaScript\n依存関係:discord.js, sync-request, querystring",
            inline: false
          },
          {
            name: "PlayerRealms",
            value: "https://discord.gg/qqU4mx2",
            inline: false
          },
          {
            name: "ボットサポートサーバー",
            value: "https://discord.gg/W7wxkmn",
            inline: false
          }
        ]
      }
    });
      return;
  }
  if (args[0] === "pr!serverlist") {
    var https = require('https');
    var url = 'https://playerrealms.com/api/getservers/';
    var data = [];
    https.get(url, function (res) {
      res.on('data', function(chunk) {
        data.push(chunk);
      }).on('end', function() {
        var events = Buffer.concat(data);
        var serversdata = JSON.parse(events);
        var embed = {
            title: "サーバーリスト",
            color: 0xffffff,
            fields: [
              
            ]
        };
        Object.keys(serversdata).forEach(function(serverdata){
          if (serversdata[serverdata ].name != undefined){
            if(args[1] == undefined || args[1] == "normal"){
              var addline = "";
              if (serversdata[serverdata ].whitelist == true){
                addline += "ホワイトリスト:有効";
              }
              if (serversdata[serverdata ].thirdparty == true){
                addline += "ThirdParty";
              }
              embed['fields'].push({
                name: serversdata[serverdata].name,
                value: "`" + serversdata[serverdata].motd + "`" + 
                "\nオーナー:`" + getName(serversdata[serverdata].owner) + 
                "`\nプレイヤー数:" + serversdata[serverdata].players + "/" + serversdata[serverdata].maxplayers + 
                "\n投票数:" + serversdata[serverdata].votes +
                "\n\n" + addline
                ,
                inline: true
              });
            }else if(args[1] == "simple"){
              embed['fields'].push({
                name: serversdata[serverdata].name,
                value: "\nオーナー:`" + getName(serversdata[serverdata].owner) + 
                "`\nプレイヤー数:" + serversdata[serverdata].players + "/" + serversdata[serverdata].maxplayers + 
                "\n投票数:" + serversdata[serverdata].votes
                ,
                inline: true
              });
            }else if(args[1] == "easy"){
              embed['fields'].push({
                name: serversdata[serverdata].name,
                value: "`" + serversdata[serverdata].motd + "`",
                inline: true
              });
            }
          }
        });
        ch.send({ embed: embed });
        
      });
    });
    return;
  }
  if (args[0] == "pr!status"){
    var request = require('sync-request');
    var url = "https://playerrealms.com/api/getserver/Hub";
    var res = request('GET',url);
    var webStatus = ":red_circle:オフライン";
    var hubStatus = ":red_circle:オフライン";
    if(res.statusCode == 200){
      var jsondata = JSON.parse(res.getBody('utf8'));
      webStatus = ":green_circle:オンライン";
      if(jsondata.status == "ONLINE"){
        hubStatus = ":green_circle:オンライン";
      }
    }
    ch.send({embed: {
            title: "PlayerRealmsの状態",
            color: 0xffffff,
            fields: [
              {
                name: "playerrealms.com(WEB)",
                value: webStatus,
                inline:false
              },
              {
                name: "Hub.playerrealms.com(ロビー)",
                value: hubStatus,
                inline:false
              }
            ]
        }});
    return;
  }
  if (args[0] === "pr!server") {
    if (args[1] == undefined){
      ch.send("pr!server [サーバー名]");
      return;
    }
    var https = require('https');
    var url = 'https://playerrealms.com/api/getserver/' + args[1];
    var data = [];
    https.get(url, function (res) {
      res.on('data', function(chunk) {
        data.push(chunk);
      }).on('end', function() {
        var events = Buffer.concat(data);
        var serverdata = JSON.parse(events);
        var embed = {
            title: "サーバーが見つかりませんでした。",
            color: 0xffffff,
            fields: [
              
            ]
        };
          if (serverdata.name != undefined){
            embed.title = serverdata.name;
            var addline = "";
            if (serverdata.whitelist == true){
              addline += "ホワイトリスト:有効";
            }
            var serverstatus = ":red_circle:オフライン";
            if (serverdata.status == "ONLINE"){
              serverstatus = ":green_circle:オンライン"
            }
           if (serverdata.thirdparty == true){
              addline += "ThirdParty";
             if (serverdata.players >= 1){
               serverstatus = ":green_circle:オンライン"
             }
              serverdata.maxplayers = "*";
            }
            var serverlang = "不明";
            if (serverdata.language == "ja_jp"){
              serverlang = "日本語";
            }else if (serverdata.language == "en_us"){
              serverlang = "英語";
            }
            
            var laststartdate = new Date(serverdata.laststart * 1000)
            embed['fields'].push({
              name: "サーバー名:" + serverdata.name,
              value: "Motd:`" + serverdata.motd + "`" + 
              "\nオーナー:`" + getName(serverdata.owner) + 
              "`\nプレイヤー数:" + serverdata.players + "/" + serverdata.maxplayers + 
              "\n投票数:" + serverdata.votes +
              "\n状態:" + serverstatus +
              "\n言語:" + serverlang +
              "\n最終起動日:" + (laststartdate.getFullYear() + '年' + (laststartdate.getMonth() + 1) + '月' + laststartdate.getDate() + '日') +
              "\n\n" + addline
              ,
              inline: true
            });
          }
        ch.send({ embed: embed });
        
      });
    });
    return;
  }
});
client.login(process.env.token);

var name;

function getName(uuid) {
  var request = require('sync-request');
  var url = "https://sessionserver.mojang.com/session/minecraft/profile/" + uuid;
    var res = request('GET',url);
  if(res.statusCode == 200){
    var playerdata = JSON.parse(res.getBody('utf8'));    
    return playerdata.name;
  }else{
    return "null";
  }
}