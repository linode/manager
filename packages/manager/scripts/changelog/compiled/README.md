# Changelog BOT

This is the file that the GH Action workflow will consume. Compiling avoids having to install the dependencies in the GH workflow.
It only needs to be generated if changing anything in ../changeset-bot.mjs.

You can compile the script by running `npx @vercel/ncc build scripts/changelog/changeset-bot.mjs -o scripts/changelog/dist/` and moving the 
`index.mjs` file here.