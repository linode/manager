const { constants } = require('../../constants');

import {
    timestamp,
    apiDeleteAllLinodes,
} from '../../utils/common';
import SearchBar from '../../pageobjects/search.page';
import VolumeDetail from '../../pageobjects/linode-detail/linode-detail-volume.page';

describe('Header - Search - Volumes Suite', () => {
    const testVolume = {
        label: `AutoVolume${timestamp()}`,
        tags: [`AutoTag${timestamp()}`]
    }

    beforeAll(() => {
        createUnattachedVolumes([testVolume]);
    });

    it('volume displays in search results when searching by name', () => {
        SearchBar.assertSearchDisplays();
        SearchBar.searSearchBar.executeSearch('blahlblahblah');
        SearchBar.suggestion.waitForVisible(constants.wait.norma;)

});
