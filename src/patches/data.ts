import { resolve } from "path"
import {getConfigJsonKey} from "./common";
import {Context} from "../context";
import {DescriptorProto, FieldDescriptorProto} from "ts-proto-descriptors";

/**
 * 加载配置文件
 */
export function requireConfigJson() {
  let filedOptions: Record<string, Record<string, Record<'value' | 'type', any>>> = {}
  let messageOptions: Record<string, string[] | undefined> = {}
  try {
    const projectDir = process.cwd()
    filedOptions = require(resolve(projectDir, 'filedOptions.json')) || {}
    messageOptions = require(resolve(projectDir, 'messageOptions.json')) || {}
  } catch (e) {
    console.warn('requireConfigJson 加载配置文件失败', e)
  }
  return {
    filedOptions,
    messageOptions
  }
}

/**
 * 获取字段option
 * @param ctx
 * @param messageDesc
 * @param fieldDesc
 */
export function getFiledOption(ctx: Context, messageDesc: DescriptorProto, fieldDesc: FieldDescriptorProto) {
  const { filedOptions } = requireConfigJson()
  const filedJsonKey = getConfigJsonKey(ctx, messageDesc, fieldDesc)

  return filedOptions[filedJsonKey]
}
