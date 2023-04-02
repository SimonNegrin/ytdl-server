import { config } from 'dotenv'
import { program } from 'commander'
import serve from './actions/serve.js'
import setup from './actions/setup.js'

config()

program
  .command('setup')
  .description('Setup the server')
  .action(setup)

program
  .command('serve')
  .description('Start the server')
  .action(serve)

program.parse()
