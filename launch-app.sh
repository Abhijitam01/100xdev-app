#!/bin/bash
# Direct launcher - works better with desktop entries

cd /home/abhijitam/Desktop/projects/100xdev
export PATH="$HOME/.local/share/pnpm:$PATH"

# Run the app
exec ~/.local/share/pnpm/pnpm start
