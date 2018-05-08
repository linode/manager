const axios = require('axios');
const localStorage = require('../../localStorage');
const token = localStorage['authentication/oauth-token'];
const API_ROOT = 'https://api.linode.com/v4';
// TODO: Use process.env.REACT_APP_API_ROOT instead of hardcoding api environment

const endpoints = [
    '/volumes',
    '/domains',
    '/nodebalancers',
];

function getEndpoint(endpoint) {
    return axios.get(`${API_ROOT}${endpoint}`, {
        headers: {'Authorization': `Bearer ${token}`}
    }).then((res) => {
        return res.data;
    }).catch((err) => {
        console.log(err);
        return err;
    });
}


function removeInstance(res, endpoint) {
    if (res.results > 0) {
        return res.data.map(instance => {
            return axios.delete(`${API_ROOT}${endpoint}/${instance.id}`, {
                headers: {'Authorization': `Bearer ${token}`}
            }).then((res) => {
                return res;
            }).catch((err) => {
                console.log(err);
                return err
            });
        });
    }
    return true;
}

const linodes = '/linode/instances';

// Remove linodes first
getEndpoint(linodes)
    .then(res => removeInstance(res, linodes))
    .catch(err => err);


// Remove all other endpoint instances
// Refactor to be in parallel (using promise.all?)
endpoints.forEach(ep => {
    return getEndpoint(ep)
        .then(res => removeInstance(res, ep))
        .catch(err => err);
});
