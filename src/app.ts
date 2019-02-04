import ServerModel from './ServerModel'
import Service from './Service'
import cp from 'child_process'

const validCommands = /status|build|start|run|stop|restart|logs|screen/i

function isValidCommand(potential: string) {
  return validCommands.test(potential)
}

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
      break
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
    case 'update-kulmio':
      await updateKulmio()
      break
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
  let [, , configFile, ...rest] = process.argv
  if ((isValidCommand(configFile) || !looksLikeConfigFile(configFile)) && process.env['KULMIO_CONFIG']) {
    rest.unshift(configFile)
    configFile = process.env['KULMIO_CONFIG'] as string
  } else if (configFile === '--env') {
    configFile = process.env['KULMIO_CONFIG'] || ''
  }
  if (rest.length > 1) {
    if (isValidCommand(rest[rest.length - 1]) && !isValidCommand(rest[0])) {
      rest.unshift(rest.pop() as string)
    }
  }

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

function looksLikeConfigFile(fn: string) {
  return fn === '--env'
   || fn.endsWith('.json')
   || fn.endsWith('.js')
   || fn.includes('/')
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
  if (!serviceNames.length) {
    return model.services.filter(service => !service.config.excludeFromAll)
  }
  const foundServices = model.services.filter(service =>
    serviceNames.includes(service.name)
    || (service.config.groups || []).some(group => serviceNames.includes(group)))
  const missingServices = serviceNames.filter(sn => foundServices.every(found => found.name !== sn))
  if (missingServices.length) throw new Error('No such services services: ' + missingServices.join(' '))
  return foundServices
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

async function updateKulmio() {
  console.log('Updating kulmio')
  cp.execSync('npm i -g git+ssh://git@gitlab.baronatechnologies.fi/public-repositories/kulmio#release', {stdio: 'inherit'})
}
