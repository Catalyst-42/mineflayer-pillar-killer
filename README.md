# mineflyaer-pillar-killer
  
| 🇺🇸 [English](./README.md) | 🇷🇺 [Russian](./README_RU.md)|
|-------------------------|----------------------------|  
  
## Preparation  
Install `node.js` from the official [website] (https://nodejs.org/en/), then, `in the bot` folder, write the following commands in the console  
  
`npm init`.  
`npm install mineflayer`  
`npm install mineflayer-pathfinder`.  
    
To start the bot  
node <file name> <host> <port> [bot name] [password]  
Example: `node index.js localhost 23523 Catalyst`  
If you do everything correctly the bot will appear on the server  

Bring the bot to the center of the column with the command `come`, give the bot a pickaxe and a carved pumpkin, when the bot is standing in the center of the column, write `home` and `radius` for the parameters of the column. After `dig` to start working. The bot will stop when it gets to Y = 1. 

## Commands for chat:
come --> call the bot
home --> set center of column  
radius \<blocks> --> set column radius (not counting center block)  
save --> save digging data
dig --> start the bot's digging  
stop --> stop the bot, the bot will write `pause` when it stops  
drop --> bot will drop all the stuff under itself
  
bot-data.txt save view:  
```
-37.5 // home X  
24.5 // home Z  
2 // radius 
```