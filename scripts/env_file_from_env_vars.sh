#!/bin/bash

# Bash script that creates an .env file with the values
# from the system's environment variables.
#
# The script will read each key from the example.env file,
# check if there's a system environment variable matching that key,
# and if found, it will write the key with the corresponding value
# to the .env file.

# Get absolute path to script regardless which folder it was executed from
SCRIPT=$(realpath "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

# Path to the .env file
source_example_env_file="$SCRIPTPATH/../.example.env"
echo $source_example_env_file
# Path to the target .env file
target_env_file="$SCRIPTPATH/../.env"

# Create temporary file"
tmp_file="$(mktemp)"

# Checks if the .env file exists
if [ ! -f "$source_example_env_file" ]; then
    echo "Error: .example.env file does not exist."
    exit 1
fi

# Read .env file line by line
while IFS= read -r line; do
    # Extract the key from each line (assumes no spaces around '=')
    key=$(echo "$line" | cut -d '=' -f 1)
    
    # Get the value from the current environment using the key
    value=$(printenv "$key")
    
    # If the environment variable exists and is not empty, use it
    if [ -n "$value" ]; then
        echo "$key=$value" >> "$tmp_file"
    else
        # If no environment variable exists, just write the original line
        echo "$line" >> "$tmp_file"
    fi
done < "$source_example_env_file"

# Overwrite the original .env file with the new values
mv "$tmp_file" "$target_env_file"

echo ".env file created successfully."