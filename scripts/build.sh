#!/bin/bash

set -e

# Define source and build directories
SRC_DIR="spicedb/tests"
BUILD_DIR="build"

# Use the schema file provided via CLI argument or default to spicedb/schema.zed
SCHEMA_FILE=${1:-"spicedb/schema.zed"}

# Create the build directory
mkdir -p "$BUILD_DIR"

# shellcheck disable=SC2115
rm -rf "$BUILD_DIR"/*

# Find all yaml files recursively in $SRC_DIR
find "$SRC_DIR" -type f -name "*.spec.yaml" | while read -r yaml_file; do
    # Determine the relative path of the yaml file from $SRC_DIR
    relative_path="${yaml_file#$SRC_DIR/}"

    # Determine the destination path in the build directory
    dest_file="$BUILD_DIR/$relative_path"

    # Create the destination directory if it doesn't exist
    dest_dir=$(dirname "$dest_file")
    mkdir -p "$dest_dir"

    # Start building the new yaml content
    {
        echo "schema: |"
        sed 's/^/  /' "$SCHEMA_FILE"
        echo ""
        # Append the content of the original yaml file
        cat "$yaml_file"
    } > "$dest_file"
done
