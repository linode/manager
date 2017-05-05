#!/bin/bash

readonly TEMPDIR=$RANDOM

convertToJSON() {
  local folder=$1
  local filename=""
  cd src/data/$folder
  ls /tmp/dev_docs_$TEMPDIR/_data/$folder \
    | while read i; do
      filename=$(echo $i | sed 's/\.yaml$//')
      any-json -format=yaml /tmp/dev_docs_$TEMPDIR/_data/$folder/$i > "$filename.json"
      done
  cd ../../..
}

main() {
  git clone https://github.com/linode/developers.git /tmp/dev_docs_$TEMPDIR
  convertToJSON endpoints
  convertToJSON objects
  convertToJSON python
  rm -rf /tmp/dev_docs_$TEMPDIR
}
main
