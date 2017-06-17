<h1 align="center">
  <img src="https://www.linode.com/media/images/logos/diagonal/light/linode-logo_diagonal_light_medium.png" width="200" />
  <br />
  The Linode Manager
</h1>

<p align="center">
  <a href="https://travis-ci.org/linode/manager"><img src="https://travis-ci.org/linode/manager.svg?branch=master" alt="Build status" /></a>
  <a href="https://coveralls.io/github/linode/manager?branch=master"><img src="https://coveralls.io/repos/github/linode/manager/badge.svg?branch=master" alt="Code coverage" /></a>
  <a href="https://waffle.io/linode/manager"><img src="https://badge.waffle.io/linode/manager.svg?label=ready&title=Agile%20board" alt="Sprint status" /></a>
  <img src="https://img.shields.io/badge/badges-many-brightgreen.svg" alt="much badges" />
</p>

This is the new Linode Manager. It provides a web interface for managing your
Linode account. Currently this software is *beta* and is available at [cloud.linode.com](https://cloud.linode.com).

The following buzzwords are involved in this project:

* [React.js](https://facebook.github.io/react/)
* [Redux](http://redux.js.org/)
* [Webpack](https://webpack.github.io/)
* ES6/ES7 (via [Babel](https://babeljs.io/))
* [SCSS](http://sass-lang.com)

## Setup

    git clone https://github.com/Linode/manager.git
    cd manager
    node --version # should be 6.x - 7.2.1
    npm install

This application communicates with Linode via the
[Linode APIv4](https://developers.linode.com). You'll need to [register an OAuth
client](https://cloud.linode.com/profile/integrations/tokens), then create a file
at `src/secrets.js` with your client ID and client secret set appropriately:

    export const clientId = 'change me';
    export const clientSecret = 'change me';

Be sure to set your callback URL to something like
`http://localhost:3000/oauth/callback` when you register your OAuth client.

Note: if you pick a callback url that is not on localhost:3000, you will need to
update the APP_ROOT variable in src/constants.js to point to the different
server.

## Development

Run:

    npm start

to start the development server. Connect to
[localhost:3000](https://localhost:3000) to try it out. Most of the changes you
make will be applied on the fly, but you may occasionally find that you have to
restart it.

While running the manager in development mode, you may press Ctrl+H to view the
redux dev tools to track the state of the application, and Ctrl+Q to move them
around the screen if necessary. If you'd rather disable the devtools, you can
set the NODE_ENV flag to "production" or set the DEVTOOLS_DISABLED flag to false:

    DEVTOOLS_DISABLED=true npm start

## Tests

To run tests:

    npm test

To automatically re-run tests when you make changes:

    npm run test:watch
    
To automatically re-run tests on a single test file:

    npm run test:watch --single_file=**/name.spec.js

Our tests live in test/**.spec.js. They're based on
[Mocha](https://mochajs.org/) and do assertions with
[Chai](http://chaijs.com/) plus DOM/React testing with
[enzyme](http://airbnb.io/enzyme/). We run them with
[Karma](https://news.ycombinator.com/item?id=11927891).
We're aiming for 95%+ test coverage.

## Contributing

Come chat with us in [#linode-next on
irc.oftc.net](https://webchat.oftc.net/?channels=linode-next&uio=d4) if you're
interested in helping out with this. We'd love to have community input on how
the new manager takes shape. This is your chance to help build the features you
need into it! We'll take pull requests in the usual way. We're still learning
about the technologies in use here ourselves, so bear with us as we figure out
the right patterns - some large scale refactorings may be in order.

## License

The Linode Manager's code is distributed under the terms of the [BSD 3-clause
license](https://github.com/linode/manager/blob/master/LICENSE). The assets are
not licensed for any purpose without prior written approval from Linode, unless
otherwise noted.
