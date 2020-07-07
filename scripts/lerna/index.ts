import { program } from 'commander'

import './command/add'
import './command/exec'

const argv = ['node', 'lerna-script'].concat(process.argv.slice(2))

program.name('lerna-script').usage('<command> [options]').parse(argv)
