import fs from 'fs'
import cp from 'child_process'
import path from 'path'
import mkdirp from 'mkdirp'
import {ServiceConfig} from './config'
import {RuntimeServerConfig} from './ServerModel'

export default class Service {
  public readonly config: ServiceConfig
  private serverConfig: RuntimeServerConfig

  constructor(serverConfig: RuntimeServerConfig, serviceConfig: ServiceConfig) {
    this.serverConfig = serverConfig
    this.config = serviceConfig
  }

  get name() {
    return this.config.name
  }

  get screenName() {
    return 'server-' + this.name + '.' + (this.config.screenSuffix || this.serverConfig.screenSuffix || 'kulmio')
  }

  private get pidFile() {
    const pidDir = this.serverConfig.baseDir + '/pids'
    if (!fs.existsSync(pidDir)) mkdirp.sync(pidDir)
    return pidDir + '/' + this.config.name + '.pid'
  }

  get logFile() {
    const logDir = this.serverConfig.baseDir + '/logs'
    if (!fs.existsSync(logDir)) mkdirp.sync(logDir)

    return logDir + '/' + this.config.name + '.log'
  }

  get actualWorkDir() {
    return path.resolve(this.serverConfig.baseDir, this.config.workDir)
  }

  public async getStatus() {
    const pid = await this.getPid()
    return pid ? 'Running #' + pid : 'Stopped'
  }

  public async getPid() {
    if (!fs.existsSync(this.pidFile)) return null
    const pid = fs.readFileSync(this.pidFile, 'UTF-8')
    if (!pid) return null
    const running = await new Promise(resolve => {
      const child = cp.exec('ps -p ' + pid)
      child.on('exit', code => {
        if (code === 1) resolve(false)
        else resolve(true)
      })
    })
    return running ? +pid : null
  }

  public async isRunning() {
    return (await this.getPid()) !== null
  }

  public async build() {
    const command = this.config.build
    if (!command) return
    console.log('Building', this.config.name)
    cp.execSync(command, {
      cwd: this.actualWorkDir,
      env: {
        ...process.env,
        ...this.getEnvVariables(),
      },
      stdio: 'inherit',
    })
  }

  public async start() {
    const command = this.config.command + ' 2>&1 | tee -a ' + this.logFile
    const child = cp.spawn('screen', ['-D', '-m', '-S', this.screenName, 'bash', '-c', command], {
      cwd: this.actualWorkDir,
      env: {
        ...process.env,
        ...this.getEnvVariables(),
      },
      stdio: 'ignore',
      detached: true,
    })
    const pid = child.pid
    child.unref()
    if (pid) {
      fs.writeFileSync(this.pidFile, pid.toString(), 'UTF-8')
    }
  }

  public async stop(force: boolean) {
    if (!force && this.config.stopCommand) {
      cp.execSync(this.config.stopCommand, {
        cwd: this.actualWorkDir,
        env: {
          ...process.env,
          ...this.getEnvVariables(),
        },
        stdio: 'inherit',
      })
    } else {
      return await this.kill(force)
    }
  }

  public async kill(force: boolean) {
    const pid = await this.getPid()
    if (force) throw new Error('Force not supported at this time')
    if (pid) {
      // cp.execSync(`screen -XS ${this.screenName} quit`)
      killMany([pid, ...getChildren(pid)])
      while (await this.isRunning()) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      fs.writeFileSync(this.pidFile, '', 'UTF-8')
      console.log('Stopped ' + this.name)
    }

    function killMany(pids: number[]) {
      cp.execSync(`kill -- ${pids.join(' ')}`)
    }

    function* getChildren(parentPid: number): IterableIterator<number> {
      for (const childPid of findChildren(parentPid)) {
        yield* getChildren(childPid)
        yield childPid
      }
    }

    function findChildren(parentPid: number) {
      try {
        const a = cp
          .execSync(`pgrep -P ${parentPid}`)
          .toString('utf-8')
          .split('\n')
          .filter(x => x)
        return a.map(l => +l)
      } catch (err) {
        return []
      }
    }
  }

  public async restart() {
    if (await this.isRunning()) {
      await this.stop(false)
    }
    await this.start()
  }

  private getEnvVariables(): any {
    const baseDir = this.serverConfig.baseDir
    const envDir = baseDir + '/envs'

    const globalEnvs = (this.serverConfig.envDirectories || []).map(ed => loadEnvFromFile(`${ed}/global.env`))
    const envName = this.config.envName || this.config.name
    const envsFromDirectories = (this.serverConfig.envDirectories || []).map(ed =>
      loadEnvFromFile(`${ed}/${envName}.env`)
    )
    const configEnv: Record<string, string> = this.config.env || {}

    return combineEnv(
      loadEnvFromFile(envDir + '/global.env'),
      ...globalEnvs,
      loadEnvFromFiles(this.serverConfig.envFiles || []),
      loadEnvFromFile(envDir + '/' + envName + '.env'),
      ...envsFromDirectories,
      loadEnvFromFiles(this.config.envFiles || []),
      Object.keys(configEnv).map(key => ({key, value: configEnv[key]}))
    )

    function combineEnv(...envParts: Array<Array<{key: string; value: string}>>) {
      const output: Record<string, string> = {}
      for (const part of envParts) {
        for (const envVar of part) {
          output[envVar.key] = envVar.value.replace(/\$(?:(\w+)|{(.+?)})/g, (_fullMatch, b, c) => {
            const variable = b || c
            return output[variable] || process.env[variable] || ''
          })
        }
      }
      return output
    }

    function loadEnvFromFile(filename: string) {
      const fullName = path.resolve(baseDir, filename)
      const dirname = path.dirname(fullName)
      if (!fs.existsSync(fullName)) {
        return []
      }
      const data = fs.readFileSync(fullName, 'UTF-8')
      return data
        .split(/[\r\n]+/)
        .map(l => l.trim())
        .filter(s => !!s)
        .map(e => {
          let [key, value] = (e.match(/^(.+?)=(.+)$/) || []).slice(1)
          if (value) {
            value = value.replace(/__DIRNAME__/g, dirname)
          }
          return {key, value}
        })
        .filter(({value}) => value !== undefined)
    }

    function loadEnvFromFiles(files: string[]) {
      return flatten(files.map(loadEnvFromFile))
    }
  }
}

function flatten<T>(arrays: T[][]): T[] {
  return ([] as T[]).concat(...arrays)
}
