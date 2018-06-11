const https = require('https');
const axios = require('axios');
const API_ROOT = process.env.REACT_APP_API_ROOT;

exports.deleteAll = (token) => {
    return new Promise((resolve, reject) => {
        const linodesEndpoint = '/linode/instances';
        const endpoints = [
            '/volumes',
            '/domains',
            '/nodebalancers',
            '/images',
        ];

        const instance = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            baseURL: API_ROOT,
            timeout: 5000,
            headers: { 'Authorization': `Bearer ${token}`},
        });

        const getEndpoint = (endpoint) => {
            return instance.get(`${API_ROOT}${endpoint}`)
                .then(res => {
                    if (endpoint.includes('images')) {
                        privateImages = res.data.data.filter(i => i['is_public'] === false);
                        res.data['data'] = privateImages;
                        return res.data;
                    }
                    return res.data;
                })
                .catch((error) => {
                    console.log('Error', error);
                    return error;
                });
        }

        const removeInstance = (res, endpoint) => {
            return instance.delete(`${endpoint}/${res.id}`)
                .then(res => {
                    return res;
                })
                .catch((error) => {
                    console.error('Error', error);
                    return error
                });
        }

        const iterateEndpointsAndRemove = () => {
            return endpoints.map(ep => {
                return getEndpoint(ep)
                    .then(res => {
                        if (res.results > 0) {
                            res.data.forEach(i => {
                                return removeInstance(i, ep)
                                .then(res => res);
                            });
                        }
                    })
                    .catch(error => error);
            });
        }

        // Remove linodes, then remove all instances
        return getEndpoint(linodesEndpoint)
            .then(res => {
                if (res.results > 0) {
                    res.data.forEach(linode => {
                        return removeInstance(linode, linodesEndpoint)
                            .then(() => new Promise(resolve => setTimeout(resolve,  25000))
                            .then(res => {
                                resolve(iterateEndpointsAndRemove());
                            }))
                        })
                } else {
                    return Promise.all(iterateEndpointsAndRemove())
                        .then(() => resolve());
                }
            })
            .catch(error => {
                reject('Error', error);
            });
    });
}


exports.removeAllLinodes = token => {
    return new Promise((resolve, reject) => {
        const linodesEndpoint = '/linode/instances';

        const instance = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            baseURL: API_ROOT,
            timeout: 5000,
            headers: { 'Authorization': `Bearer ${token}`},
        });

        const removeInstance = (res, endpoint) => {
            return instance.delete(`${endpoint}/${res.id}`)
                .then(res => res)
                .catch((error) => {
                    console.error('Error', error);
                    reject('Error', error);
                });
        }

        return instance.get(linodesEndpoint)
            .then(res => {
                const promiseArray = 
                    res.data.data.map(l => removeInstance(l, linodesEndpoint));

                Promise.all(promiseArray).then(function(res) {
                    resolve(res);
                }).catch(error => {
                    console.error(error);
                    reject('Error', error);
                });
        });
    });
}

exports.createLinode = (token, password, linodeLabel) => {
    return new Promise((resolve, reject) => {
        const linodesEndpoint = '/linode/instances';
        
        const linodeConfig = {
            backups_enabled: false,
            booted: true,
            image: 'linode/Ubuntu16.10',
            region: 'us-east',
            root_pass: password,
            type: 'g6-standard-1'
        }

        if (linodeLabel !== false) {
            linodeConfig['label'] = linodeLabel;
        }

        const instance = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            baseURL: API_ROOT,
            timeout: 5000,
            headers: { 'Authorization': `Bearer ${token}`},           
        });

        return instance.post(linodesEndpoint, linodeConfig)
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                console.error('Error', error);
                reject(error);
            });
    });
}

exports.allocatePrivateIp = (token, linodeId) => {
    return new Promise((resolve, reject) => {
        const ipsEndpoint = `/linode/instances/${linodeId}/ips`;
        const instance = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            baseURL: API_ROOT,
            timeout: 5000,
            headers: { 'Authorization': `Bearer ${token}`},
        });

        const requestPrivate = {
            public: false,
            type: 'ipv4',
        }

        return instance.post(ipsEndpoint, requestPrivate)
            .then(response => resolve(response.data))
            .catch(error => {
                console.error('Error', error);
                reject(error);
            });
    });
}

exports.getNodebalancers = token => {
    return new Promise((resolve, reject) => {
        const endpoint = '/nodebalancers';
        const instance = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            baseURL: API_ROOT,
            timeout: 5000,
            headers: { 'Authorization': `Bearer ${token}`},
        });

        return instance.get(endpoint)
            .then(response => resolve(response.data))
            .catch(error => {
                console.error('Error', error);
                reject(error);
            });
    });
}

exports.removeNodebalancer = (token, nodeBalancerId) => {
    return new Promise((resolve, reject) => {
        const endpoint = `/nodebalancers/${nodeBalancerId}`;
        const instance = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            baseURL: API_ROOT,
            timeout: 5000,
            headers: { 'Authorization': `Bearer ${token}`},
        });

        return instance.delete(endpoint)
            .then(response => resolve(response.data))
            .catch(error => {
                console.error('Error', error);
                reject(error);
            });
    });
}

exports.removeAllVolumes = token => {
    return new Promise((resolve, reject) => {
        const endpoint = '/volumes';

        const removeVolume = (res, endpoint) => {
            return instance.delete(`${endpoint}/${res.id}`)
                .then(response => response.status)
                .catch(error => {
                    console.error('Error', error);
                    reject(error);
                });
        }

        const instance = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            baseURL: API_ROOT,
            timeout: 5000,
            headers: { 'Authorization': `Bearer ${token}`}, 
        });

        return instance.get(endpoint).then(res => {
            const removeVolumesArray = 
                res.data.data.map(v => removeVolume(v, endpoint));

            Promise.all(removeVolumesArray).then(function(res) {
                resolve(res);
            }).catch(error => {
                console.log(error);
                return error;
            });
        });
    });
}
