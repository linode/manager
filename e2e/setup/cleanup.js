require('dotenv').config();

const https = require('https');
const axios = require('axios');
const API_ROOT = process.env.REACT_APP_API_ROOT;
const { isEmpty } = require('lodash');
const { readFileSync, unlink } = require('fs');


const getAxiosInstance = function(token) {
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({
          rejectUnauthorized: false
      }),
      baseURL: API_ROOT,
      timeout: 10000,
      headers: { 'Authorization': `Bearer ${token}`},
    });
    return axiosInstance;
}

exports.removeAllLinodes = token => {
    return new Promise((resolve, reject) => {
        const linodesEndpoint = '/linode/instances';


        const removeInstance = (linode, endpoint) => {
            return getAxiosInstance(token).delete(`${endpoint}/${linode.id}`)
                .then(res => {
                    
                })
                .catch((error) => {
                    console.error('Error was', error);
                    reject(error);
                });
        }

        return getAxiosInstance(token).get(linodesEndpoint)
            .then(res => {
                const promiseArray = 
                    res.data.data.map(l => removeInstance(l, linodesEndpoint));

                Promise.all(promiseArray)
                .then(function(res) {
                    resolve(res);
                }).catch(error => {
                    console.error(`error was`, error);
                    reject(error);
                })
            })
            .catch(error => console.log(error.response.status));
    });
}

/* We need to pause due to an API bug
   where Volumes fail to be removed if they were
   attached to a recently deleted linode
*/
exports.pause = (volumesResponse) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(volumesResponse), 21000);
    });
}

exports.removeAllVolumes = token => {
    return new Promise((resolve, reject) => {
        const endpoint = '/volumes';

        const removeVolume = (res, endpoint) => {
            return getAxiosInstance(token).delete(`${endpoint}/${res.id}`)
                .then(response => {
                  resolve(response.status);
                })
                .catch(error => {
                    if (error.includes('This volume must be detached before it can be deleted.')) {

                    }
                    reject(`Removing Volume ${res.id} failed due to ${JSON.stringify(error.response.data)}`);
                });
        }

        return getAxiosInstance(token).get(endpoint).then(volumesResponse => {
            return exports.pause(volumesResponse).then(res => {
                const removeVolumesArray = 
                    res.data.data.map(v => removeVolume(v, endpoint));

                Promise.all(removeVolumesArray).then(function(res) {
                    resolve(res);
                }).catch(error => {
                    console.log(error.data);
                    reject(error.data)
                });
            })
        })
        .catch(error => console.log(error.response.status));
    });
}

exports.deleteAll = (token, user) => {
    return new Promise((resolve, reject) => {
        const endpoints = [
            '/domains',
            '/nodebalancers',
            '/images',
            '/account/users',
        ];

        const getEndpoint = (endpoint, user) => {
            return getAxiosInstance(token).get(`${API_ROOT}${endpoint}`)
                .then(res => {
                    if (endpoint.includes('images')) {
                        privateImages = res.data.data.filter(i => i['is_public'] === false);
                        res.data['data'] = privateImages;
                        return res.data;
                    }

                    if(endpoint.includes('users')) {
                        const nonRootUsers = res.data.data.filter(u => u.username !== user);
                        res.data['data'] = nonRootUsers;
                        return res.data;
                    }
                    return res.data;
                })
                .catch((error) => {
                    console.log('Error', error);
                    // reject(error);
                });
        }

        const removeInstance = (res, endpoint, token) => {
            return getAxiosInstance(token).delete(`${endpoint}/${res.id ? res.id : res.username}`)
                .then(res => res)
                .catch((error) => {
                    // reject(error);
                    console.error(error);
                });
        }

        const iterateEndpointsAndRemove = () => {
            return endpoints.map(ep => {
                return getEndpoint(ep, user)
                    .then(res => {
                        if (res.results > 0) {
                            res.data.forEach(i => {
                                removeInstance(i, ep, token)
                                    .then(res => {
                                        return res;
                                    });
                            });
                        }
                    })
                    .catch(error => {
                      console.error(error);
                      reject(error);
                    });
            });
        }

        // Remove linodes, then remove all instances
        return Promise.all(iterateEndpointsAndRemove())
            .then((values) => resolve(values))
            .catch(error => {
                console.error('Error', reject(error));
            });
    });
}

exports.resetAccounts = (credsArray, credsPath) => {
  return new Promise((resolve, reject) => {
      credsArray.forEach((cred, i) => {
        return exports.removeAllLinodes(cred.token)
          .then(res => {
                console.log(`Removing all data from ${cred.username}`);
                return exports.removeAllVolumes(cred.token)
                  .then(res => {
                    return exports.deleteAll(cred.token, cred.username)
                      .then(res => {
                        if (i === credsArray.length -1) {
                            unlink(credsPath, (err) => {
                                return res;
                            });
                        }
                      })
                      .catch(error => {
                        console.log('error', error);
                      });
                  })
                  .catch(error => {
                    console.log('error', error)
                  })
          })
          .catch(error => {
            console.log(error.data)
            reject(error)
          });
      });
  });
}

