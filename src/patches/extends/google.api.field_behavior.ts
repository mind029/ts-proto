import {DescriptorProto, FieldDescriptorProto} from "ts-proto-descriptors";
import {getFiledOption} from "../data";
import {Context} from "../../context";

enum LxFieldBehavior {
  FIELD_BEHAVIOR_UNSPECIFIED = 0,
  OPTIONAL = 1,
  REQUIRED = 2,
  OUTPUT_ONLY = 3,
  INPUT_ONLY = 4,
  IMMUTABLE = 5,
  UNORDERED_LIST = 6,
  NON_EMPTY_DEFAULT = 7,
  IDENTIFIER = 8,
  UNRECOGNIZED = -1,
}

/**
 * 如果配置存在，则覆盖option
 */
export function maybeCoverFiledOptionalProperty(ctx: Context, messageDesc: DescriptorProto | undefined, fieldDesc: FieldDescriptorProto, curOptional: boolean): boolean {
  const { options } = ctx
  if (!messageDesc || !options.coverCustomOptional) return curOptional

  // 可能匹配到 value
  const filedOption = getFiledOption(ctx, messageDesc, fieldDesc)
  const matchFiledBehaviorValue = filedOption?.['google.api.field_behavior']?.value

  return LxFieldBehavior.REQUIRED !== matchFiledBehaviorValue
}
