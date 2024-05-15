import {DescriptorProto, FieldDescriptorProto} from "ts-proto-descriptors";
import {Context} from "../../context";
import { getFiledOption } from '../data'
import {SourceDescription} from "../../sourceInfo";
import { capitalizeFirstLetter } from '../common'

/**
 * 追加 filter 注释
 * @param ctx
 * @param messageDesc
 * @param fieldDesc
 * @param info
 * @example
 * FilterBy(
 *  Eq('')
 * )
 */
export function filterRulesToComment(ctx: Context, messageDesc: DescriptorProto | undefined, fieldDesc: FieldDescriptorProto, info: SourceDescription): SourceDescription {
  const { options } = ctx
  if (!messageDesc || !options.coverCustomType) return info

  const filedOption = getFiledOption(ctx, messageDesc, fieldDesc)
  const filedFilterRules = filedOption?.['lixin.common.validator.v1.filter']?.value?.rules

  if (!Array.isArray(filedFilterRules)) {
    return info
  }

  const comments: string[] = [
    '@example',
    'FilterBy('
  ];

  for (const rule of filedFilterRules) {
    for (const opItem of rule.ops) {
      comments.push(`  ${capitalizeFirstLetter(opItem.op)}(${rule.field}, ${opItem.types.join('|')}),`)
    }
  }

  comments.push(')')

  return {
    ...info,
    // 追加 pattern 注释
    leadingComments: `${info.leadingComments}\n\n${comments.join('\n')}`
  }
}
