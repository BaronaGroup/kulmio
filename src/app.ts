import ServerModel from './ServerModel'
import Service from './Service'
import cp from 'child_process'

async function run() {
  //var wtf = require('wtfnode');
  const commandLineArgs = parseCommandLine()

  const model = new ServerModel(commandLineArgs.configFile)
  const services = getServices(model, commandLineArgs.services)

  switch (commandLineArgs.command.toLowerCase()) {
    case 'status': {
      await serviceStatus(services)
      break
    }
    case 'build': {
      await buildServices(services)
      break
    }
    case 'start': {
      await startServices(services)
      break
    }
    case 'run': {
      await startServices(services)
      await openScreen(services)
    }
    case 'stop': {
      await stopServices(commandLineArgs.args, services)
      break
    }
    case 'restart': {
      await stopServices(commandLineArgs.args, services)
      await startServices(services)
      break
    }
    case 'logs': {
      await logs(commandLineArgs.args, services)
      break
    }
    case 'screen': {
      await openScreen(services)
      break
    }
    default:
      console.log('Invalid command', commandLineArgs.command)
  }
  //wtf.dump()
}

run().catch(err => {
  console.error(err.message, err.stack)
  process.exit(99)
})

function parseCommandLine() {
  const [, , configFile, ...rest] = process.argv
  const command = rest.shift() || ''
  let args: string[], services: string[]
  if (rest.includes('--')) {
    const index = rest.indexOf('--')
    args = rest.slice(0, index)
    services = rest.slice(index + 1)
  } else {
    args = rest.filter(item => item.startsWith('-'))
    services = rest.filter(item => !item.startsWith('-'))
  }

  return {
    configFile,
    command,
    args,
    services
  }
}

async function serviceStatus(services: Service[]) {
  const statuses = services.map(service => ({service, status: service.getStatus()}))
  for (const {service, status} of statuses) {
    console.log(service.name, await status, await service.getPid())
  }
}

async function startServices(services: Service[]) {
  for (let service of services) {
    const running = await service.isRunning()
    if (running) {
      console.log(service.name + ': Already running')
    } else {
      console.log(service.name + ': Starting...')
      await service.start()
    }
  }
}

async function buildServices(services: Service[]) {
  for (let service of services) {
    await service.build()
    if (await service.isRunning()) {
      await service.restart()
    }
  }
}
async function stopServices(args: string[], services: Service[]) {
  const promises: Promise<any>[] = []
  for (let service of services) {
    const running = await service.isRunning()
    if (running) {
      console.log(service.name + ': Stopping...')
      promises.push(service.stop(args.includes('-9')))
    }
  }
  await Promise.all(promises)
}

function getServices(model: ServerModel, serviceNames: string[]) {
  return model.services.filter(service => serviceNames.length ? serviceNames.includes(service.name) : true)
}

async function logs(args: string[], services: Service[]) {
  const logfiles = services.map(service => service.logFile)
  cp.execSync('tail ' + args.join(' ') + ' -- ' + logfiles.join(' '), {stdio: 'inherit'})
}

async function openScreen(services: Service[]) {
  if (services.length !== 1) {
    console.error('Screen is only applicable for a single service')
    return
  }
  cp.execSync('screen -raAd ' + services[0].screenName, { stdio: 'inherit'})
}
