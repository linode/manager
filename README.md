# Manager

Rewrite of Linode Manager. Buzzwords:

* React.js
* Redux
* Webpack
* ES6/Babel
* SCSS

## Setup

    node --version # should be 5.x or better
    git submodule update --init
    npm install

Add a file called src/secrets.js and put this in it:

    export const client_id = "change me";
    export const client_secret = "change me";

## Development

    npm start

Starts the dev server. Connect to http://localhost:3000 to try it out. Changes
you make to the source code will be applied on the fly, with a couple of
exceptions:

* Adding new dependencies
* Changing src/index.js
* Changing any config files

Just restart the server if you do any of these things. Press Ctrl+H to view the
coolio state history thing, and Ctrl+Q to move it around if necessary.

## Tests

Run tests:

    npm test

Re-run tests on every change:

    npm run test:watch

Tests are in the test/ directory. They use Mocha and Chai to do the whole
testing thing, look them up. Let's get good test coverage from day one on this
project, shall we?

TODO: Add info for when this repo becomes open source
