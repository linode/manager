// This file used by GitHub Actions (ci.yml workflow) to validate the api-v4 NPM package before publishing.

import { getRegions } from '@linode/api-v4';

getRegions().then(res => {
    console.log(res.data.length);
});
