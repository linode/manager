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
                .catch((err) => {
                    console.log('Error', err);
                    return err;
                });
        }

        const removeInstance = (res, endpoint) => {
            return instance.delete(`${endpoint}/${res.id}`)
                .then(res => {
                    return res;
                })
                .catch((err) => {
                    console.log('Error', err);
                    return err
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
                    .catch(err => err);
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
            .catch(err => {
                reject('Error', err);
            });
    });
}


exports.removeAllLinodes = (token) => {
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
                .catch((err) => {
                    console.log('Error', err);
                    return err
                });
        }

        return instance.get(linodesEndpoint)
            .then(res => {
                const promiseArray = 
                    res.data.data.map(l => removeInstance(l, linodesEndpoint));

                Promise.all(promiseArray).then(function(res) {
                    resolve(res);
                }).catch(err => console.log(err));
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
        .then(res => resolve(res.status === 200)) 
        .catch(err => reject(err));
    });
}

exports.removeAllVolumes = (token) => {
    return new Promise((resolve, reject) => {
        const volumesEndpoint = '/volumes';

        const removeVolume = (res, endpoint) => {
            return instance.delete(`${endpoint}/${res.id}`)
                .then(res => res.status)
                .catch(err => {
                    console.log('Error', err);
                    return err;
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

        return instance.get(volumesEndpoint).then(res => {
            const removeVolumesArray = 
                res.data.data.map(v => removeVolume(v, volumesEndpoint));

            Promise.all(removeVolumesArray).then(function(res) {
                resolve(res);
            }).catch(err => {
                console.log(err);
                return err;
            });
        });
    });
}
