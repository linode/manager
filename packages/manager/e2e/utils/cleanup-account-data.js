const https = require('https');
const axios = require('axios');
const { readFileSync } = require('fs');
const { argv } = require('yargs');

const deleteAllData = (token,user,dev) => {

    const api = dev ? 'https://api.dev.linode.com/v4' : 'https://api.linode.com/v4';
    
    const axiosInstance = axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        }),
        baseURL: api,
        timeout: 10000,
        headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'WebdriverIO',
        },
    });

    const endpoints = [
        '/linode/instances',
        '/volumes',
        '/domains',
        '/nodebalancers',
        '/account/users',
        '/images',
    ];

    endpoints.forEach((entityEndpoint) => {
        axiosInstance.get(entityEndpoint).then((response) => {
            const data = entityEndpoint.includes('images')
                ? response.data.data.filter( image => !image.is_public) : response.data.data;
            if(data.length > 0){
                data.forEach((entityInstance) => {
                    const deleteId = entityEndpoint.includes('users') ? entityInstance.username : entityInstance.id;
                    if( deleteId !== user){
                        axiosInstance.delete(`${entityEndpoint}/${deleteId}`).catch(e => console.log(e));
                    }
                });
            }
        })
        .catch(e => console.log(e));
    });

    const stackScriptEndPoint = '/linode/stackscripts';
    axiosInstance.get(stackScriptEndPoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Filter': `{"username":"${user}","+order_by":"deployments_total","+order":"desc"}`,
        'User-Agent': 'WebdriverIO',
      }
    }).then((response) => {
        if(response.data.data.length > 0){
            response.data.data.forEach((myStackScript) => {
                axiosInstance.delete(`${stackScriptEndPoint}/${myStackScript.id}`).catch(e => console.log(e));
            })
        }
    })
    .catch(e => console.log(e));
}


deleteAllData(argv.token,argv.username,argv.env);
