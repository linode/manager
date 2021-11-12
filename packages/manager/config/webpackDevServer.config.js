'use strict';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const apiProxyUrl = process.env.REACT_APP_API_ROOT;

module.exports = {
  compress: true,
  https: protocol === 'https',
  host: HOST,
  port: PORT,
  historyApiFallback: {
    disableDotRule: true,
  },
  proxy: {
    '/api/v4': {
      changeOrigin: true,
      target: apiProxyUrl,
    },
  },
};
