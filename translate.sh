#!/bin/bash
set -e

changed_files=$(git diff --name-only main | grep '^src/content/docs/zh-cn/')

if [ -z "$changed_files" ]; then
  echo "not changed files in src/content/docs/zh-cn/ "
  exit 0
fi

for file in $changed_files; do
  if [[ "$file" == *.md ]]; then
    output_path=$(echo "$file" | sed 's|src/content/docs/zh-cn/|src/content/docs/|')
    output_dir=$(dirname "$output_path")

    echo "🔄 Translating: $file"
    echo "➡️ Output to:  $output_dir"

    docs translate "$file" --to en --output "$output_dir"
  fi
done

