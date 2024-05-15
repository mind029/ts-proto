import {filedPatternToComment} from "./extends/google.api.resource_reference";
import {Context} from "../context";
import {DescriptorProto, FieldDescriptorProto} from "ts-proto-descriptors";
import {SourceDescription} from "../sourceInfo";
import {filterRulesToComment} from "./extends/lixin.common.validator.v1.filter";

/**
 * 给字段添加注释
 * 1. pattern 注释
 * 2. filter 注释
 * @param ctx
 * @param messageDesc
 * @param fieldDesc
 * @param info
 */
export function appendFiledComment(ctx: Context, messageDesc: DescriptorProto | undefined, fieldDesc: FieldDescriptorProto, info: SourceDescription): SourceDescription {
  const witchPatternComment = filedPatternToComment(ctx, messageDesc, fieldDesc, info)
  return filterRulesToComment(ctx, messageDesc, fieldDesc, witchPatternComment)
}
