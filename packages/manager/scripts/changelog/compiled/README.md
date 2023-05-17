# Changelog BOT

This is the file that the GH Action workflow will consume. Compiling avoids having to install the dependencies in the GH workflow.
It only need to be generated if changing anything to ../changeset-bot.mjs

You can compile the script by running `npx @vercel/ncc build scripts/changelog/changeset-bot.mjs -o scripts/changelog/dist/` and moving the 
`index.mjs` file here.