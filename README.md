# Manager ![](https://img.shields.io/badge/license-BSD-lightgrey.svg)

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

    git clone https://github.com/Linode/manager.git
    cd manager
    node --version # should be 5.x or better
    npm install

Currently the codebase is hardcoded to point to our [alpha
environment](https://alpha.linode.com). It communicates with Linode via 
[Linode API 4](https://developers.linode.com). You'll need to [register an OAuth
client](https://developers.linode.com/reference/#authentication) in the alpha
environment, then create a file at `src/secrets.js` with your client ID and
client secret set appropriately:

    export const client_id = "change me";
    export const client_secret = "change me";

## Development

Run:

    npm start

to start the development server. Connect to
[localhost:3000](https://localhost:3000) to try it out. Most of the changes you
make will be applied on the fly, but you may occasionally find that you have to
restart it.

While running the manager in development mode, you may press Ctrl+H to view the
redux dev tools to track the state of the application, and Ctrl+Q to move them
around the screen if necessary.

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

Come chat with us in [#linode-next on
irc.oftc.net](https://webchat.oftc.net/?channels=linode-next&uio=d4) if you're
interested in helping out with this. We'd love to have community input on how
the new manager takes shape. This is your chance to help build the features you
need into it! We'll take pull requests in the usual way. We're still learning
about the technologies in use here ourselves, so bear with us as we figure out
the right patterns - some large scale refactorings may be in order.

## License

The Linode manager's code is distributed under the terms of the [BSD 3-clause
license](https://github.com/linode/manager/blob/master/LICENSE). The assets are
not licensed for any purpose without prior written approval from Linode, unless
otherwise noted.
