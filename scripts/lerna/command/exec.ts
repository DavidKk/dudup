import flattenDeep from 'lodash/flattenDeep'
import { program } from 'commander'
import { select, spawn } from '../share/pm'
import { rootPath } from '../constants/conf'
import * as Typings from '../typings'

export async function exec(commands: string[], options?: Typings.CommandOptions): Promise<void> {
  if (!(Array.isArray(commands) && commands.length > 0)) {
    return
  }

  let { packages } = await select(`请选择需要开发的模块${options.mutiple ? ', 注意监听的模块不能有依赖' : ''}.`, options.mutiple, options.yes, options.packages, options.ignore)
  if (options.mutiple !== true) {
    packages = [packages]
  }

  if (!(Array.isArray(packages) && packages.length > 0)) {
    return
  }

  const [command] = commands
  const scopes = packages.map((name) => ['--scope', name])
  const scopeParams = command.split(' ').concat(flattenDeep(scopes))
  const params = ['exec', ...scopeParams]
  await spawn('lerna', params, { cwd: rootPath, stdio: 'inherit' })
}

program
  .command('exec [commands...]')
  .option('--packages <packages>', '配置 lerna.json packages 字段, 默认读取 lerna.json')
  .option('--ignore <ignore>', '过滤模块, 过滤匹配 lerna.json packages 字段中的模块')
  .option('--mutiple', '是否为多选')
  .option('--yes', '配合多选情况下, 跳过选择并返回全部')
  .action((commands, options) => exec(commands, options))
