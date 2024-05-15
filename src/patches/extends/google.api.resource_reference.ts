import {DescriptorProto, FieldDescriptorProto} from "ts-proto-descriptors";
import {code, Code} from "ts-poet";
import {Context} from "../../context";
import {getFiledOption, requireConfigJson} from "../data";
import {replaceCurlyBracesToType} from "../common";
import {SourceDescription} from "../../sourceInfo";

/**
 * 获取字段对应 pattern
 * @param ctx
 * @param messageDesc
 * @param fieldDesc
 * @example
 * //  option (google.api.resource) = {
 * //    type: "v1.boss-bff.dos.lixinio.com/CallCenterConfig",
 * //    pattern: "groups/{group_id_int64}/stores/{store_id_int64}/callCenterConfigs/{call_center_config_id_int64}"
 * //    pattern: "groups/{group_id_int64}/stores/{store_id_int64}"
 * //  };
 * // 返回：["groups/{group_id_int64}/stores/{store_id_int64}/callCenterConfigs/{call_center_config_id_int64}", "groups/{group_id_int64}/stores/{store_id_int64}"]
 */
export function getFiledPatterns(ctx: Context, messageDesc: DescriptorProto | undefined, fieldDesc: FieldDescriptorProto) {
  const { options } = ctx
  if (!messageDesc || !options.coverCustomType) return

  // 匹配数据
  const { messageOptions } = requireConfigJson()
  const filedOption = getFiledOption(ctx, messageDesc, fieldDesc)
  const resourceReferenceData = filedOption?.['google.api.resource_reference']?.value
  const messageKey = resourceReferenceData?.type || resourceReferenceData?.childType
  // 从 messageOptions 匹配出对应 message option 值中 pattern
  // 在字段，type/childType 中，同时 pattern 可能会存在多个。
  return messageOptions?.[messageKey]
}

/**
 * 追加 pattern 注释
 * @param ctx
 * @param messageDesc
 * @param fieldDesc
 * @param info
 */
export function filedPatternToComment(ctx: Context, messageDesc: DescriptorProto | undefined, fieldDesc: FieldDescriptorProto, info: SourceDescription): SourceDescription {
  const filedPatterns = getFiledPatterns(ctx, messageDesc, fieldDesc)

  if (!filedPatterns) return info

  return {
    ...info,
    // 追加 pattern 注释
    leadingComments: `${info.leadingComments}\n\n${filedPatterns.join('\n')}`
  }
}

/**
 * 如果配置存在，则转出 message option 中的 pattern 对应的模板类型code。
 * @param ctx
 * @param messageDesc
 * @param fieldDesc
 * @param type
 */
export function maybeCover2ResourceReferenceType(ctx: Context, messageDesc: DescriptorProto | undefined, fieldDesc: FieldDescriptorProto, type: Code): Code {
  const filedPatterns = getFiledPatterns(ctx, messageDesc, fieldDesc)
  if (!filedPatterns) return type

  // 需要转换成 ts 模板类型
  // 把 pattern 中的{}，替换成 ts:number、ts:string。
  const patternCodeStr  = replaceCurlyBracesToType(filedPatterns.map(item => `\`${item}\``).join(' | '))

  return filedPatterns ? code`${patternCodeStr}` : type
}
