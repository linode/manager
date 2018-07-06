const { writeFileSync } = require('fs');
const axios = require('axios');

const proxyImposter = config => {
    const imposter = {
        "port": config.imposterPort,
        "protocol": config.imposterProtocol,
        "name": config.imposterName,
        "useCORS": true,
        "stubs": [{
            "responses": [
            {
                "proxy": {
                    "to": config.proxyHost,
                    "mode": "proxyAlways",
                    "predicateGenerators": [{
                        "matches": {
                            "method": true, 
                            "path": true,
                            "query": true,
                            "body": true
                        }
                    }],
                    "injectHeaders" : {
                        "Accept-Encoding": "identity"
                    }
                }
            }]
        }]
    }

     // Add certificate and key to imposter when specified
    if (config.hasOwnProperty('key') && config.hasOwnProperty('cert')) {
        imposter["key"] = config.key;
        imposter["cert"] = config.cert;
    }
    
    /*  If mutual auth is true, the server will request a client certificate. 
    *   Since the goal is simply to virtualize a server requiring mutual auth, 
    *   invalid certificates will not be rejected.
    */
    if (config.hasOwnProperty('mutualAuth')) {
        imposter["mutualAuth"] = config.mutualAuth;
    }

    return imposter;
}

const instance = axios.create({
    baseURL: 'http://localhost:2525',
    timeout: 5000,
    headers: {'Content-Type': 'application/json'}
});

const mountebankEndpoint = '/imposters?replayable=true';

/*
* Sends POST to mountebank to load an imposter that proxies
* @param { Object } imposter Imposter object
* @returns { Promise } Resolves with response data
*/
exports.loadProxyImposter = (proxyConfig) => {
    return new Promise((resolve, reject) => {
        const imposterObject = proxyImposter(proxyConfig);

        instance.post(mountebankEndpoint, imposterObject)
            .then(response => resolve(response.data))
            .catch(error => reject(console.error(error)));
    });
}

/*
* Sends PUT request to mountebank to load an imposter
* @param { Object } imposter Imposter object
* @returns { Promise } Resolves with response data
*/
exports.loadImposter = (imposter) => {
    return new Promise((resolve, reject) => {
        instance.put(mountebankEndpoint, imposter)
            .then(response => resolve(response.data))
            .catch(error => reject(console.error(error)));
    });
}

/*
* GET imposters from mountebank
* @param { Boolean } removeProxies Adds Remove proxies param to remove proxy stubs
* @param { String } file filepath and filename to save imposters.
* @returns { Promise } Resolves writing response data to file
*/
exports.getImposters = (removeProxies, file) => {
    return new Promise((resolve, reject) => {
        const removeProxyParam = '&removeProxies=true';
        instance.get(removeProxies ? mountebankEndpoint + removeProxyParam : mountebankEndpoint)
            .then(response => {
                resolve(writeFileSync(file, JSON.stringify(response.data)));
            })
            .catch(error => reject(console.error(error)));
    });
}

/*
* Sends a DELETE request to remove all imposters from mountebank
* @returns { Promise } Resolves with response data
*/
exports.deleteImposters = () => {
    return new Promise((resolve, reject) => {
        const impostersEndPoint = '/imposters';
        instance.delete(impostersEndPoint)
            .then(response => resolve(response.data))
            .catch(error => reject(console.error(error)));
    });
}
