import { logEvent } from './eventLogger'
import ServerModel from './ServerModel'
import Service from './Service'
import { delay } from './utils/delay'

export async function startServices(services: Service[], model: ServerModel) {
  const workingSet = new Map<string, Promise<boolean>>()
  const mainPromises = services.map((service) => startService(service, workingSet, model))
  await Promise.all(mainPromises)
}
export function startService(service: Service, workingSet: Map<string, Promise<boolean>>, model: ServerModel) {
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
              service.dependencies.map((dep) => startService(model.getService(dep), workingSet, model))
            )
            logEvent(model.config, { type: 'STATUS_UPDATED', serviceName: service.name, status: 'WAITING_DEPS' })
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
          logEvent(model.config, {
            type: 'STATUS_UPDATED',
            serviceName: service.name,
            status: service.config.healthCommand ? 'RUNNING:HEALTHY' : 'RUNNING',
          })
          console.log(service.name + ': Already running')
        } else {
          console.log(service.name + ': Started')
          logEvent(model.config, {
            type: 'STATUS_UPDATED',
            serviceName: service.name,
            status: service.config.healthCommand ? 'RUNNING:HEALTHY' : 'RUNNING',
          })
        }

        resolve(true)
      } catch (err) {
        reject(err)
      }
    })
  )
  return workingSet.get(service.name)
}
