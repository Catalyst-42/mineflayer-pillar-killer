const mineflayer = require('mineflayer')
const fs = require("fs");
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node index.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'demolisher',
  password: process.argv[5]
})

bot.loadPlugin(pathfinder)

let fileContent = fs.readFileSync("bot-data.txt", "utf8").split('\n')
let homeX = Number(fileContent[0])
let homeZ = Number(fileContent[1])
let radius = Number(fileContent[2])
let walkStage = -1
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
			walkStage = 0
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
			if (bot.blockAt(bot.entity.position.offset(x, 0, z))['name'] === 'obsidian'){
				await bot.dig(bot.blockAt(bot.entity.position.offset(x, 0, z)))
			}
		}
	}
	
	bot.pathfinder.setGoal(new GoalNear(homeX+radius, bot.entity.position.y, homeZ, 0))
}

bot.on('goal_reached', async () => {
	function createCustomTimeout(seconds) {
		return new Promise((resolve, reject) => {
		  setTimeout(() => {
			resolve();
			}, seconds * 1000);
		});
	}

	await createCustomTimeout(1)
	
	if (walkStage === 5) {
		walkStage = 0

		if (bot.entity.position.y === 1) {	
			digging = 0
			bot.chat('pillar done')
			return
		}
	
		if (!digging) {
			bot.chat('pause')
			return
		}
	
		await bot.dig(bot.blockAt(bot.entity.position.offset(0, -1, 0)))
		await createCustomTimeout(1)
		dig()
		return
	}

	if (walkStage === 4) {
		bot.pathfinder.setGoal(new GoalNear(homeX, bot.entity.position.y, homeZ, 0))
		walkStage += 1
	}

	if (walkStage === 3) {
		bot.pathfinder.setGoal(new GoalNear(homeX+radius, bot.entity.position.y, homeZ, 0))
		walkStage += 1
	}
	
	if (walkStage === 2) {
		bot.pathfinder.setGoal(new GoalNear(homeX, bot.entity.position.y, homeZ-radius, 0))
		walkStage += 1
	}
	
	if (walkStage === 1) {
		bot.pathfinder.setGoal(new GoalNear(homeX-radius, bot.entity.position.y, homeZ, 0))
		walkStage += 1
	}
	
	if (walkStage === 0) {
		bot.pathfinder.setGoal(new GoalNear(homeX, bot.entity.position.y, homeZ+radius, 0))
		walkStage += 1
	}
})

function dropAll() {
	if (bot.inventory.items().length === 0) return
	const item = bot.inventory.items()[0]
	bot.tossStack(item, dropAll)
}
