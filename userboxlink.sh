
# Check if at least one argument is provided
if [ $# -lt 1 ]; then
    echo "Usage: $0 <argument>"
    exit 1
fi

# Access the first argument
argument=$1

# Use the argument in your script
// grep -oE '\{\{yy.[^ ]*\}\}' $argument | grep -vE '\{\{babels\|' | grep -vE '\|image.*\}\}' | grep -vE '\{\{yy(top|end)\}\}' > $argument.txt| pbcopy


sed 's/\(\{\{yy\.[^ ]*\)\*\(\}\}\)/\1User:*\/\2/g; s/\(\{\{yy\.[^ ]*\)\*\(\|\)\(\}\}\)/\1Template:*\/\2\3/g' $argument | grep -oE '\{\{yy\.[^ ]*\}\}' > $argument.txt
// grep -oE '\{\{yy.[^ ]*\}\}' $argument | grep -vE 'User:' grep -vE '\{\{yy(top|end)\}\}' > $argument.txt| pbcopy
