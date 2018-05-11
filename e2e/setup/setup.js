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
            timeout: 1000,
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
            timeout: 1000,
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
                res.data.data.forEach(linode => {
                    removeInstance(linode, linodesEndpoint)
                });
            })
            .catch(err => reject(err));
    });
}
