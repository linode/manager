<h1 align="center">
  <img src="https://www.linode.com/media/images/logos/diagonal/light/linode-logo_diagonal_light_medium.png" width="200" />
  <br />
  The Linode API Docs
</h1>

## Setup

    git clone https://github.com/Linode/manager.git
    cd manager/docs
    node --version # should be 7.2.x
    npm install
    ./transform.sh
    ./docsConvert.sh

## Development

Run:

    npm start

to start the development server. Connect to
[localhost:5000](https://localhost:5000) to try it out. Most of the changes you
make will be applied on the fly, but you may occasionally find that you have to
restart it.

## License

The Linode Manager's code is distributed under the terms of the [BSD 3-clause
license](https://github.com/linode/manager/blob/master/LICENSE). The assets are
not licensed for any purpose without prior written approval from Linode, unless
otherwise noted.
