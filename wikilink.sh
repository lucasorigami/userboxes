#!/bin/zsh

# Check if at least one argument is provided
if [ $# -lt 1 ]; then
    echo "Usage: $0 <argument>"
    exit 1
fi

# Access the first argument
argument=$1

# Use the argument in your script
grep -oE '\[\[[^ ]*\]\]' $argument | sed 's/\[\[//;s/\]\]//' > $argument.txt | pbcopy
