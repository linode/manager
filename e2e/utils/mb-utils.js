const { readFileSync, writeFileSync } = require('fs');

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
                            "query": true
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
* Sends request to mountebank to create a new imposter
* USE PUT method when loading saved imposters from JSON file
* USE POST method when loading a proxy
* @param { Object } imposter Imposter object
* @returns { Promise } Resolves when response status code is 200
*/
exports.loadProxyImposter = (proxyConfig) => {
    return new Promise((resolve, reject) => {
        const imposterObject = proxyImposter(proxyConfig);

        instance.post(mountebankEndpoint, imposterObject)
            .then(response => resolve(response.data))
            .catch(error => reject(console.error(error)));
    });
}

exports.loadImposter = (imposter) => {
    return new Promise((resolve, reject) => {
        instance.put(mountebankEndpoint, imposter)
            .then(response => resolve(response.data))
            .catch(error => reject(console.error(error)));
    });
}

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

exports.deleteImposters = () => {
    return new Promise((resolve, reject) => {
        const impostersEndPoint = '/imposters';
        instance.delete(impostersEndPoint)
            .then(response => resolve(response.data))
            .catch(error => reject(console.error(error)));
    });
}


// Create an imposter object that proxies to a host

// exports.loadProxyImposter()
//     .then(response => console.log(response))
//     .catch(err => console.error(err));


// getImposters(true)
//     .then(res => console.log(res))
//     .catch(error => console.error(error));

// deleteImposters()
//     .then(res => console.log(res));


// const imposterConfig = readFileSync('./imposters.json');

// loadImposter(imposterConfig)
//     .then(response => console.log(response))
//     .catch(error => console.error(error));