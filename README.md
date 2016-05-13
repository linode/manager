# Manager

This is the new Linode Manager. It provides a web interface for manging your
Linode account. Currently this software is *pre-alpha* and won't be released for
a while.

The following buzzwords are involved in this project:

* [React.js](https://facebook.github.io/react/)
* [Redux](http://redux.js.org/)
* [Webpack](https://webpack.github.io/)
* ES6/ES7 (via [Babel](https://babeljs.io/))
* [SCSS](http://sass-lang.com)

## Setup

    node --version # should be 5.x or better
    npm install

Create a file called src/secrets.js and put this in it:

    export const client_id = "change me";
    export const client_secret = "change me";

Currently the codebase is hardcoded to point to our [alpha
environment](https://alpha.linode.com). It communicates with Linode via 
[Linode API 4](https://developers.linode.com). You'll need to register an OAuth
client in the alpha environment and set the client ID and client secret
appropriately above.

## Development

Run:

    npm start

to start the development server. Connect to http://localhost:3000 to try it out.
Most of the changes you make will be applied on the fly thanks to
react-hot-loader, but you may occasionally find that you have to restart it.

Press Ctrl+H to view the redux dev tools to track the state of the application,
and Ctrl+Q to move them around the screen if necessary.

## Tests

To run tests:

    npm test

To automatically re-run tests when you make changes:

    npm run test:watch

Our tests live in test/**.spec.js. They're run with
[Mocha](https://mochajs.org/) and do assertions with [Chai](http://chaijs.com/).
We're aiming for as close to 100% test coverage as possible, but we're still
figuring out what patterns to use for testing in this project.

## Contributing

Come chat with us in #linode-next if you're interested in helping out with this.
We'd love to have community input on how the new manager takes shape. This is
your chance to help build the features you need into it! We'll take pull
requests in the usual way. We're still learning about the technologies in use
here ourselves, so bear with us as we figure out the right patterns - some large
scale refactorings may be in order.
