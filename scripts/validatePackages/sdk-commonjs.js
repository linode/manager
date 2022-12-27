// This file used by GitHub Actions (ci.yml workflow) to validate the api-v4 NPM package before publishing.

const apiv4 = require('@linode/api-v4/lib');

apiv4.getRegions().then(res => {
    console.log(res.data.length)
})
