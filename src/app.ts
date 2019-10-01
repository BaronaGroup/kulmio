import ServerModel from './ServerModel'
import Service from './Service'
import cp from 'child_process'
import {delay} from './utils/delay'

let path = '../package.json'
while (true) {
  try {
    const p = require(path)
    ;(global as any).kulmioVersion = p.version
    break
  } catch (err) {
    path = '../' + path
  }
}

const validCommands = /status|build|start|run|stop|restart|logs|screen/i

function isValidCommand(potential: string) {
  return validCommands.test(potential)
}

async function run() {
  // var wtf = require('wtfnode');
  const commandLineArgs = parseCommandLine()
  return runWithArgs(commandLineArgs)
}

const includeRunningOtherServicesFor = ['status', 'stop', 'restart']

export type Args = ReturnType<typeof parseCommandLine>

export async function runWithArgs(commandLineArgs: Args) {
  const model = new ServerModel(commandLineArgs.configFile)
  const command = commandLineArgs.command.toLowerCase()
  const services = await getServices(model, commandLineArgs.services, command)

  switch (command) {
    case 'status': {
      await serviceStatus(services)
      break
    }
    case 'build': {
      await buildServices(services)
      break
    }
    case 'start': {
      if (commandLineArgs.args.includes('--no-dependencies')) {
        startServicesNoDependencies(services)
      } else {
        await startServices(services, model)
      }
      break
    }
    case 'run': {
      if (commandLineArgs.args.includes('--no-dependencies')) {
        startServicesNoDependencies(services)
      } else {
        await startServices(services, model)
      }
      await openScreen(services)
      break
    }
    case 'stop': {
      await stopServices(commandLineArgs.args, services)
      break
    }
    case 'restart': {
      await stopServices(commandLineArgs.args, services)
      if (commandLineArgs.args.includes('--no-dependencies')) {
        startServicesNoDependencies(services)
      } else {
        await startServices(services, model)
      }
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
  // wtf.dump()
}

if (!process.env.KULMIO_API_MODE) {
  run().catch(err => {
    console.error(err.message, err.stack)
    process.exit(99)
  })
}

function parseCommandLine() {
  let [, , configFile, ...rest] = process.argv
  if ((isValidCommand(configFile) || !looksLikeConfigFile(configFile)) && process.env.KULMIO_CONFIG) {
    rest.unshift(configFile)
    configFile = process.env.KULMIO_CONFIG as string
  } else if (configFile === '--env') {
    configFile = process.env.KULMIO_CONFIG || ''
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
    services,
  }
}

function looksLikeConfigFile(fn: string) {
  return fn === '--env' || fn.endsWith('.json') || fn.endsWith('.js') || fn.includes('/')
}

async function serviceStatus(services: Service[]) {
  const statuses = services.map(service => ({ service, status: service.getStatus() }))
  for (const { service, status } of statuses) {
    console.log(service.name, await status)
  }
}

async function startServicesNoDependencies(services: Service[]) {
  for (const service of services) {
    const running = await service.isRunning()
    if (running) {
      console.log(service.name + ': Already running')
    } else {
      console.log(service.name + ': Starting...')
      await service.start()
    }
  }
}
async function startServices(services: Service[], model: ServerModel) {
  const workingSet = new Map<string, Promise<boolean>>()
  const mainPromises = services.map(service => startService(service, workingSet, model))
  await Promise.all(mainPromises)
}

function startService(service: Service, workingSet: Map<string, Promise<boolean>>, model: ServerModel) {
  const promise = workingSet.get(service.name)
  if (promise) return promise
  workingSet.set(
    service.name,
    new Promise(async (resolve, reject) => {
      try {
        const running = await service.isRunning()

        if (!running) {
          if (service.dependencies.length) {
            const deps = Promise.all(
              service.dependencies.map(dep => startService(model.getService(dep), workingSet, model))
            )
            console.log(service.name + ': Waiting for dependencies')
            await deps
          }

          console.log(service.name + ': Starting...')
          await service.start()
        }

        if ((await service.isHealthy()) === false) {
          console.log(service.name + ': Waiting until healthy...')
          do {
            await delay(500)
          } while ((await service.isHealthy()) === false)
        }
        console.log(service.name + ': Started')

        resolve(true)
      } catch (err) {
        reject(err)
      }
    })
  )
  return workingSet.get(service.name)
}

async function buildServices(services: Service[]) {
  for (const service of services) {
    await service.build()
    if (await service.isRunning()) {
      await service.restart()
    }
  }
}
async function stopServices(args: string[], services: Service[]) {
  const promises: Array<Promise<any>> = []
  for (const service of services) {
    const running = await service.isRunning()
    if (running) {
      console.log(service.name + ': Stopping...')
      promises.push(service.stop(args.includes('-9')))
    }
  }
  await Promise.all(promises)
}

async function getServices(model: ServerModel, serviceNames: string[], command: string): Promise<Service[]> {
  if (!serviceNames.length) {
    const baseServices = model.services.filter(service => !service.config.excludeFromAll)
    if (!includeRunningOtherServicesFor.includes(command)) return baseServices

    const potentiallyExcludedServices = model.services.filter(service => service.config.excludeFromAll),
      runningPotentiallyExcludedServices = (await Promise.all(
        potentiallyExcludedServices.map(service => service.isRunning())
      ))
        .map((running, i) => running && potentiallyExcludedServices[i])
        .filter(running => running) as Service[]

    return [...baseServices, ...runningPotentiallyExcludedServices]
  }
  const foundServices = model.services.filter(
    service =>
      service.aliases.some(alias => serviceNames.includes(alias)) ||
      (service.config.groups || []).some(group => serviceNames.includes(group))
  )
  const missingServices = serviceNames.filter(sn => foundServices.every(found => found.name !== sn))
  if (missingServices.length) throw new Error('No such services services: ' + missingServices.join(' '))
  return foundServices
}

async function logs(args: string[], services: Service[]) {
  const logfiles = services.map(service => service.logFile)
  cp.execSync('tail ' + args.join(' ') + ' -- ' + logfiles.join(' '), { stdio: 'inherit' })
}

async function openScreen(services: Service[]) {
  if (services.length !== 1) {
    console.error('Screen is only applicable for a single service')
    return
  }
  cp.execSync('screen -raAd ' + services[0].screenName, { stdio: 'inherit' })
}
