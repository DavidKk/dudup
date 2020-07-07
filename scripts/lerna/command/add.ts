import flattenDeep from 'lodash/flattenDeep'
import { program } from 'commander'
import inquirer from 'inquirer'
import { select, spawn } from '../share/pm'
import { rootPath } from '../constants/conf'
import * as Typings from '../typings'

export const add = async (dependencies: string[], options?: Typings.CommandOptions & { isDev?: boolean }): Promise<void> => {
  if (!(Array.isArray(dependencies) && dependencies.length > 0)) {
    const prompt = inquirer.createPromptModule()
    const questions = [
      {
        name: 'dependencies',
        type: 'input',
        message: '请选择需需要添加依赖的模块',
      },
    ]

    const { dependencies } = await prompt(questions)
    return add(dependencies.split(' '), options)
  }

  const { packages } = await select('请选择需要添加依赖的模块', options.mutiple, options.yes, options.packages, options.ignore)
  if (!(Array.isArray(packages) && packages.length > 0)) {
    return
  }

  const [command] = dependencies
  const scopes = packages.map((name) => ['--scope', name])
  const scopeParams = command.split(' ').concat(flattenDeep(scopes))
  const params = ['add', options.isDev ? '--dev' : '', ...scopeParams].filter(Boolean)
  await spawn('lerna', params, { cwd: rootPath, stdio: 'inherit' })
}

program
  .command('add [dependencies...]')
  .option('--dev, --save-dev <isDev>', '配置是否为 --save-dev 模式')
  .option('--packages <packages>', '配置 lerna.json packages 字段, 默认读取 lerna.json')
  .option('--ignore <ignore>', '过滤模块, 过滤匹配 lerna.json packages 字段中的模块')
  .option('--mutiple', '是否为多选')
  .option('--yes', '配合多选情况下, 跳过选择并返回全部')
  .action((dependencies, options) => add(dependencies, options))
