const axios = require('axios');
const localStorage = require('../../localStorage');

// Substitute manually if you do not have this file
const token = localStorage['authentication/oauth-token'];

// TODO: Use process.env.REACT_APP_API_ROOT instead of hardcoding api environment
const API_ROOT = 'https://api.linode.com/v4';

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
