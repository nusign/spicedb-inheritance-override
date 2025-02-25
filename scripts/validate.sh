#!/bin/bash

set -e

# Define source and build directories
BUILD_DIR="build"

SCHEMA_FILE=${1}
# Get optional BUILD_FILE argument
BUILD_FILE=${2}

./scripts/build.sh "$SCHEMA_FILE"

if [ -n "$BUILD_FILE" ]; then
    # If BUILD_FILE is provided, only validate that specific file
    echo "Validating $BUILD_FILE"
    zed validate "$BUILD_FILE"
else
    # Find all yaml files recursively in build directory
    find "$BUILD_DIR" -type f -name "*.yaml" | while read -r yaml_file; do
        echo "Validating $yaml_file"
        zed validate "$yaml_file"
    done
fi
