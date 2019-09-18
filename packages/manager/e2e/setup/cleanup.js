require('dotenv').config();

const https = require('https');
const axios = require('axios');
const API_ROOT = process.env.REACT_APP_API_ROOT;
const { isEmpty } = require('lodash');
const { readFileSync, unlink } = require('fs');

function removeEntity(token, entity, endpoint) {
  return getAxiosInstance(token)
    .delete(`${endpoint}/${entity.id}`)
    .then(res => entity.label + ' - ' + res.status + ' ' + res.statusText);
}
const getAxiosInstance = token => {
  const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    }),
    baseURL: API_ROOT,
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'WebdriverIO'
    }
  });
  return axiosInstance;
};

exports.removeAllLinodes = token => {
  const linodesEndpoint = '/linode/instances';

  return getAxiosInstance(token)
    .get(linodesEndpoint)
    .then(res => {
      linodes = res.data.data;
      if (linodes.length > 0) {
        return Promise.all(
          res.data.data.map(linode =>
            removeEntity(token, linode, linodesEndpoint)
          )
        );
      } else {
        return ['No Linodes'];
      }
    });
};

/* We need to pause due to an API bug
   where Volumes fail to be removed if they were
   attached to a recently deleted linode
*/
exports.pause = volumesResponse => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(volumesResponse), 21000);
  });
};

exports.removeAllVolumes = token => {
  const endpoint = '/volumes';

  return getAxiosInstance(token)
    .get(endpoint)
    .then(volumesResponse => {
      return exports.pause(volumesResponse).then(res => {
        volumes = res.data.data;
        if (volumes.length > 0) {
          return Promise.all(
            res.data.data.map(v => removeEntity(token, v, endpoint))
          );
        } else {
          return ['No Volumes'];
        }
      });
    });
};

exports.deleteAll = (token, user) => {
  const endpoints = [
    '/domains',
    '/nodebalancers',
    '/images',
    '/account/users'
    // TODO JIRA - M3-3249: Uncomment this when we are ready to run on CI:
    // '/account/oauth-clients'
  ];

  const getEndpoint = (endpoint, user) => {
    return getAxiosInstance(token)
      .get(`${API_ROOT}${endpoint}`)
      .then(res => {
        if (endpoint.includes('images')) {
          privateImages = res.data.data.filter(i => i['is_public'] === false);
          res.data.data = privateImages;
        }

        if (endpoint.includes('oauth-clients')) {
          const appClients = res.data.data.filter(
            client => client['id'] !== process.env.REACT_APP_CLIENT_ID
          );
          res.data.data = appClients;
        }

        if (endpoint.includes('users')) {
          const nonRootUsers = res.data.data.filter(u => u.username !== user);
          // tack on an id and label so the general-purpose removeEntity function works
          // (it expects all entities to have an id and a label)
          nonRootUsers.forEach(user => {
            user.id = user.username;
            user.label = user.username;
          });
          res.data.data = nonRootUsers;
        }
        return res;
      });
  };

  const iterateEndpointsAndRemove = () => {
    return Promise.all(
      endpoints.map(ep => {
        return getEndpoint(ep, user).then(res => {
          if (res.data.data.length > 0) {
            return Promise.all(
              res.data.data.map(entity => removeEntity(token, entity, ep))
            );
          } else {
            return ['No entities for ' + ep];
          }
        });
      })
    );
  };

  // Remove linodes, then remove all instances
  return iterateEndpointsAndRemove();
};

exports.resetAccounts = credsArray => {
  return Promise.all(
    credsArray.map(cred => {
      return exports
        .removeAllLinodes(cred.token)
        .then(res => {
          console.log('removed all linodes');
          console.log(res);
          return exports.removeAllVolumes(cred.token);
        })
        .then(res => {
          console.log('removed all volumes');
          console.log(res);
          return exports.deleteAll(cred.token, cred.username);
        })
        .then(res => {
          console.log('removed everything else');
          console.log(res);
          return res;
        });
    })
  );
};
