import keys from 'lodash/keys'
import fs from 'fs-extra'
import path from 'path'
import { spawn as cpSpawn, SpawnOptions } from 'child_process'
import glob from 'glob'
import inquirer from 'inquirer'
import fromPairs from 'lodash/fromPairs'
import flattenDeep from 'lodash/flattenDeep'
import { rootPath } from '../constants/conf'

export const select = async (
  message: string = '请选择模块',
  mutiple: boolean = false,
  yes: boolean = false,
  lernaPackages: string | string[] = [],
  lernaIgnorePackages: string | string[] = []
) => {
  if (typeof lernaPackages === 'string') {
    lernaPackages = [lernaPackages]
  }

  if (typeof lernaIgnorePackages === 'string') {
    lernaIgnorePackages = [lernaIgnorePackages]
  }

  if (!(Array.isArray(lernaPackages) && lernaPackages.length > 0)) {
    const json = await fs.readJSON(path.join(rootPath, 'lerna.json'))
    lernaPackages = json.packages as string[]
  }

  lernaPackages = lernaPackages.filter((item) => lernaIgnorePackages.indexOf(item) === -1)

  const promises = lernaPackages.map((pattern) => {
    return new Promise((resolve, reject) => {
      glob(pattern, { cwd: rootPath }, (error, matches) => {
        error ? reject(error) : resolve(matches)
      })
    })
  })

  const files = (await Promise.all(promises).then((...files) => flattenDeep(files))) as string[]
  const folders = files.filter((file) => fs.statSync(file).isDirectory() && fs.existsSync(path.join(file, 'package.json')))
  const packages = folders.map((folder) => {
    const file = path.join(folder, 'package.json')
    const { name } = fs.readJsonSync(file)
    return [name, folder]
  })

  const packageMap = fromPairs(packages)
  if (yes === true && mutiple === true) {
    const result = keys(packageMap)
    return { packages: result }
  }

  if (packages.length === 1) {
    const [result] = keys(packageMap)
    return { packages: [result] }
  }

  const prompt = inquirer.createPromptModule()
  const questions = [
    {
      name: 'packages',
      type: mutiple ? 'checkbox' : 'list',
      message: message,
      choices: Object.keys(packageMap),
    },
  ]

  return prompt(questions)
}

export const spawn = (cli: string, params: string[] = [], options: SpawnOptions = {}, stdout?: (data: string, type: 'out' | 'err') => void): Promise<number> => {
  return new Promise((resolve, reject) => {
    let cp = cpSpawn(cli, params || [], options || {})

    if (typeof stdout === 'function') {
      cp.stdout.on('data', (data) => stdout(data, 'out'))
      cp.stderr.on('data', (data) => stdout(data, 'err'))
    }

    let handleProcessSigint = process.exit.bind(process)
    let handleProcessExit = () => {
      cp && cp.kill('SIGINT')
      process.removeListener('exit', handleProcessExit)
      process.removeListener('SIGINT', handleProcessSigint)

      cp = undefined
      handleProcessExit = undefined
      handleProcessSigint = undefined
    }

    cp.on('exit', (code) => resolve(code))
    cp.on('SIGINT', () => reject(new Error('Process has been killed')))

    process.on('exit', handleProcessExit)
    process.on('SIGINT', handleProcessSigint)
  })
}
