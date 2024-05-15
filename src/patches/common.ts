import {DescriptorProto, FieldDescriptorProto} from "ts-proto-descriptors";
import {code} from "ts-poet";
import {toReaderCall} from "../types";
import {Context} from "../context";
import {maybeSnakeToCamel} from "../case";
import {getFieldName, safeAccessor} from "../utils";


/**
 * 获取扩展类型名
 * @param _extension
 */
export function getExtensionTypeName(_extension: FieldDescriptorProto) {
  const value = _extension.typeName || _extension.type
  if (typeof value === "string") {
    return code`"${value}"`;
  }

  return code`"${toReaderCall(_extension)}"`
}

/**
 * 获取 options 的包名
 */
export function getExtensionPackageName(extension: FieldDescriptorProto) {
  const value = extension.typeName
  let res = ''
  if (value) {
    // 说明是自定义类型的 options，eq：.lixin.common.validator.v1.FilterDescriptor
    const packagePathItems = value.split('.').slice(1, -1)
    if (packagePathItems.length) {
      // 最后 '' 用于生成 .
      res = [...packagePathItems, ''].join('.')
    }
  }

  return code`${res}`
}

/**
 * 替换字符串中的 {} ，成为 ts 模板类型
 * @param input
 * @example
 * const inputString = 'groups/{group_id_int64}/stores/{mobile}/users/{name}';
 * const outputString = replaceCurlyBracesToType(inputString);
 *
 * console.log(outputString); // 输出: groups/${number}/stores/${string}/users/${string}
 *
 */
export function replaceCurlyBracesToType(input: string) {
  // 替换包含 int 的占位符为 __number__ (临时字符串)
  return input.replace(/{[^{}]*int[^{}]*}/gi, '__number__')
    // 替换其他占位符为 ${string}
    .replace(/{[^{}]*}/g, '${string}')
    // 最后把临时字符串 __number__ 替换为 ${number}
    .replace(/__number__/g, '${number}');
}

/**
 * 通过文件、message、filed 组合得到外部配置key。用于匹配外部json是否存在对应配置
 * @param ctx
 * @param messageDesc
 * @param fieldDesc
 */
export function getConfigJsonKey(ctx: Context, messageDesc: DescriptorProto, fieldDesc: FieldDescriptorProto) {
  function messageName(message: DescriptorProto): string {
    const { name } = message;
    return ["Date"].includes(name) ? `${name}Message` : name;
  }

  const { options } = ctx
  const fileName = ctx.currentFile.name
  const messageFullName = maybeSnakeToCamel(messageName(messageDesc), options);
  const filedName = safeAccessor(getFieldName(fieldDesc, options));

  return `${fileName}_${messageFullName}_${filedName}`
}


/**
 * 首字母大写
 * @param string
 */
export function capitalizeFirstLetter(string: string) {
  if (!string) return string; // 检查空字符串
  return string.charAt(0).toUpperCase() + string.slice(1);
}
