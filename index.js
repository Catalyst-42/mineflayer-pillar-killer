const mineflayer = require('mineflayer')
const fs = require("fs");
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node gps.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'gps',
  password: process.argv[5]
})

bot.loadPlugin(pathfinder)

let fileContent = fs.readFileSync("bot-data.txt", "utf8").split('\n')
let homeX = Number(fileContent[0])
let homeZ = Number(fileContent[1])
let radius = Number(fileContent[2])

let digging = 1

bot.once('spawn', () => {
  const mcData = require('minecraft-data')(bot.version)
  const defaultMove = new Movements(bot, mcData)
	bot.pathfinder.setMovements(defaultMove)

  bot.on('chat', (username, message) => {
	const args = message.split(' ')
	switch(args[0]) {
		case 'dig': 
			digging = 1
			dig()
			return
		case 'come':	
			const target = bot.players[username]?.entity
			if (!target) return
			const { x: playerX, y: playerY, z: playerZ } = target.position
			bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, 1))
			return
		case 'home':
			homeX = bot.entity.position.x.toFixed(1)
			homeZ = bot.entity.position.z.toFixed(1)
			console.log('now home at ' + homeX + ' ' + homeZ)
			return
		case 'radius':
			radius = Number(args[1])
			console.log('now radius is ' + radius)
			return
		case 'save':
			fs.writeFileSync("bot-data.txt", homeX + '\n' + homeZ + '\n' + radius)
			console.log('data saved')
			return
		case 'stop':
			digging = 0
			return
		case 'drop':
			bot.lookAt(bot.entity.position)
  		setTimeout(dropAll, 1000)
			return
		}
  })
})

bot.on('playerCollect', (collector, itemDrop) => {
  if (collector !== bot.entity) return

  setTimeout(() => {
    const pumpkin = bot.inventory.items().find(item => item.name.includes('carved_pumpkin'))
    if (pumpkin) bot.equip(pumpkin, 'head')
  }, 150)
})

async function dig() {
	for (z=-radius;z<=radius;z++) {
		for (x=-radius;x<=radius;x++) {
				await bot.dig(bot.blockAt(bot.entity.position.offset(x, 0, z)))
		}
	}
	
	bot.pathfinder.setGoal(new GoalNear(homeX+radius, bot.entity.position.y, homeZ, 0))
	setTimeout(bot.pathfinder.setGoal, 4000, new GoalNear(homeX, bot.entity.position.y, homeZ+radius, 0))
	setTimeout(bot.pathfinder.setGoal, 8000, new GoalNear(homeX-radius, bot.entity.position.y, homeZ, 0))
	setTimeout(bot.pathfinder.setGoal, 12000, new GoalNear(homeX, bot.entity.position.y, homeZ-radius, 0))
	setTimeout(bot.pathfinder.setGoal, 16000, new GoalNear(homeX+radius, bot.entity.position.y, homeZ, 0))
	setTimeout(bot.pathfinder.setGoal, 20000, new GoalNear(homeX, bot.entity.position.y, homeZ, 0))

	if (bot.entity.position.y === 1) {	
		digging = 0
		bot.chat('pillar done')
		return
	}

	if (!digging) {
		bot.chat('pause')
		return
	}

	setTimeout(bot.dig, 24000, bot.blockAt(bot.entity.position.offset(0, -1, 0)))
	setTimeout(dig, 28000)
}

function dropAll() {
	if (bot.inventory.items().length === 0) return
	const item = bot.inventory.items()[0]
	bot.tossStack(item, dropAll)
}
