const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

console.info(chalk.green('Copy config start.'))

console.info(chalk.green('Checking config exists.'))
const isExist = fs.existsSync(path.join(__dirname, '../../config.json'))

if (isExist) {
  console.info(chalk.yellow('Config file `config.json` exists, process exit.'))
  console.info(chalk.bold.magenta('If you want to initialize your config, remove `Config.json` and re run `npm run copy-config`'))
  process.exit(-1)
}

try {
  const config = require('../../.config.json')
  fs.writeFileSync(path.join(__dirname, '../../config.json'), JSON.stringify(config, null, 2))
  
  console.info(chalk.bold.green('Config copied.'))
} catch (e) {
  console.error(chalk.red('Copy config failed'), e)
}

