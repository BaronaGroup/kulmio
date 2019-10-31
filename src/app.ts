import ServerModel from './ServerModel'
import Service from './Service'
import cp from 'child_process'
import { delay } from './utils/delay'
import fs from 'fs'
import { join } from 'path'
import flatten from './utils/flatten'

let path = '../package.json'
while (true) {
  try {
    const p = require(path) // tslint:disable-line
    ;(global as any).kulmioVersion = p.version
    break
  } catch (err) {
    path = '../' + path
  }
}

const validCommands = /status|build|start|run|stop|restart|logs|screen|exec/i

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
        await startServicesNoDependencies(services)
      } else {
        await startServices(services, model)
      }
      break
    }
    case 'run': {
      if (commandLineArgs.args.includes('--no-dependencies')) {
        await startServicesNoDependencies(services)
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
        await startServicesNoDependencies(services)
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
    case 'exec': {
      await execute(
        services,
        commandLineArgs.extraArgs,
        commandLineArgs.args.includes('-p') || commandLineArgs.args.includes('--parallel')
      )
      break
    }
    case 'git':
      await git(
        services,
        commandLineArgs.extraArgs,
        commandLineArgs.args.includes('-p') || commandLineArgs.args.includes('--parallel')
      )
      break
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
  const commandIsExecOrGit = ['git', 'exec'].includes(command.toLowerCase())

  const tripleDashIndex = rest.indexOf('---')
  let extraArgs: string[] = []

  if (tripleDashIndex !== -1) {
    extraArgs = rest.slice(tripleDashIndex + 1)
    rest.splice(tripleDashIndex, rest.length)
  } else if (commandIsExecOrGit) {
    const model = new ServerModel(configFile)
    const firstUnknown = rest.find(entry => !entry.startsWith('-') && !model.isKnownName(entry))
    if (firstUnknown) {
      const foundAt = rest.indexOf(firstUnknown)
      extraArgs = rest.slice(foundAt)
      rest.splice(foundAt, rest.length)
    }
  }

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
    extraArgs,
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
          if (service.softDependencies.length) {
            console.log('Starting soft dependencies')
            for (const softDep of service.softDependencies) {
              // No await, we have them start but do not wait
              startService(model.getService(softDep), workingSet, model)
            }
          }
          if (service.dependencies.length) {
            const deps = Promise.all(
              service.dependencies.map(dep => startService(model.getService(dep), workingSet, model))
            )
            console.log(service.name + ': Starting/waiting for dependencies')
            await deps
          }

          console.log(service.name + ': Starting...')
          await service.start()
        }

        const initiallyHealthy = (await service.isHealthy()) !== false
        if (!initiallyHealthy) {
          console.log(service.name + ': Waiting until healthy...')
          do {
            await delay(500)
          } while ((await service.isHealthy()) === false)
        }

        if (running && initiallyHealthy) {
          console.log(service.name + ': Already running')
        } else {
          console.log(service.name + ': Started')
        }

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

  return flatten(serviceNames.map(name => model.getServicesByName(name)))
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

async function execute(services: Service[], command: string[], parallel: boolean) {
  if (!command.length) {
    console.log('No command provided. Separate the command from the rest of the command line with a triple dash')
    console.log(`e.g. ${process.argv[1]} servicename --- ls`)
    process.exit(1)
  }

  if (parallel) {
    console.error('Parallel execution not supported at this time')
    process.exit(1)
  }

  let failures = [] as string[]

  for (const service of services) {
    try {
      await service.execute(command)
    } catch (err) {
      failures.push(service.name)
    }
  }

  if (failures.length) {
    throw new Error('Execution failed for ' + failures.join(', '))
  }
}

async function git(services: Service[], command: string[], parallel: boolean) {
  const actualServices = services.filter(hasGit)
  return execute(actualServices, command, parallel)

  function hasGit(service: Service) {
    return fs.existsSync(join(service.actualWorkDir, '.git'))
  }
}
