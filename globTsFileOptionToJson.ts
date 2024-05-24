import { writeFileSync } from 'fs'
import { join, resolve } from 'path'
import { glob } from 'glob'

const sourceDirPath = resolve(process.cwd(), './decodeDir')

const outputFiledOptions = resolve(process.cwd(), './filedOptions.json')
const outputMessageOptions = resolve(process.cwd(), './messageOptions.json')

function getMessageResourceOption(messageOptions: Record<string, any> = {}) {
  const matchResourceOption = messageOptions['google.api.resource']
  const val = matchResourceOption?.value

  if (val?.type) {
    return [val.type, val.pattern]
  }
}

function mergeFileOptions() {
  const filedOptionConfig: Record<string, any> = {}
  const messageResourceOptionConfig: Record<string, any> = {}

  return function(protoMetadata: Record<string, any>, done?: boolean){
    if (done) return [messageResourceOptionConfig, filedOptionConfig]
    const fileName = protoMetadata.fileDescriptor.name
    const messages: any = Object.entries(protoMetadata?.options?.messages || {})

    for (const [messageName, messageVal] of messages) {
      const matchResourceOption = getMessageResourceOption(messageVal?.options || {})
      if (matchResourceOption) {
        messageResourceOptionConfig[matchResourceOption[0]] = matchResourceOption[1]
      }
      for (const [filedName, filedOptions] of Object.entries(messageVal?.fields || {})) {
        filedOptionConfig[`${fileName}_${messageName}_${filedName}`] = { ...filedOptions || {} }
      }
    }
  }
}

async function getTsFilesOptions(sourcePath: string): Promise<Record<string, any>[]> {
  const pattern = join(sourcePath, '**/*.ts');
  const tsFiles = await glob(pattern, { ignore: 'node_modules/**' })
  const mergeFn = mergeFileOptions()

  for (const tsFile of tsFiles) {
    const { protoMetadata } = await import(tsFile)
    mergeFn(protoMetadata)
  }

  return mergeFn({}, true) as Record<string, any>[]
}

async function globTsFileOptionToJson(sourceDirPath: string) {
  const [messageResourceOptionConfig, filedOptionConfig] = await getTsFilesOptions(sourceDirPath)
  writeFileSync(outputFiledOptions,JSON.stringify(filedOptionConfig, null, 2), 'utf8')
  writeFileSync(outputMessageOptions,JSON.stringify(messageResourceOptionConfig, null, 2), 'utf8')
}

globTsFileOptionToJson(sourceDirPath).catch((e) => {
  console.log('e', e)
})
