#!/usr/bin/env bash

outDir="tsTypes"
outDecodeDir="decodeDir"

# 定义包含 proto 文件的根目录
PROTO_ROOTS=(
    "./third_party"
    "./proto"
)

# 定义一个数组来存储所有 .proto 文件路径
PROTO_FILES=()

# 遍历根目录数组，查找所有的 .proto 文件
for root in "${PROTO_ROOTS[@]}"; do
    while IFS= read -r -d '' file; do
        PROTO_FILES+=("$file")
    done < <(find "$root" -name "*.proto" -print0)
done

function genJson() {
  # 清理旧的生成文件并创建新的输出目录
  rm -rf "./${outDecodeDir}" && mkdir "${outDecodeDir}"

  echo "开始输出 decode 文件"

  protoc \
  -I./third_party \
  -I./proto \
  -I./ \
  --plugin=./protoc-gen-ts_proto \
  --ts_proto_out="./${outDecodeDir}" \
  --ts_proto_opt=outputSchema=true \
  "${PROTO_FILES[@]}"

  echo "输出编译完成"

  # 转换成 json 配置
  ts-node --transpile-only ./globTsFileOptionToJson.ts
  echo "转换JSON完成"
}

function genType() {
  rm -rf "./${outDir}" && mkdir "${outDir}"

  echo "开始输出 ts 类型文件"

  # 编译 proto 文件
  protoc \
  -I./third_party \
  -I./proto \
  -I./ \
  --plugin=./protoc-gen-ts_proto \
  --ts_proto_out="./${outDir}" \
  --ts_proto_opt=onlyTypes=true,coverCustomType=true,coverCustomOptional=true \
  "${PROTO_FILES[@]}"

  echo "生成ts类型完成"
}

function startGen() {
  genJson
  genType
}


startGen
