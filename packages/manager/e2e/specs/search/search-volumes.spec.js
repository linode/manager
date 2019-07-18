const { constants } = require('../../constants');

import {
    timestamp,
    createVolumes,
    apiDeleteAllVolumes,
} from '../../utils/common';
import SearchBar from '../../pageobjects/search.page';
import SearchResults from '../../pageobjects/search-results.page';
import VolumeDetail from '../../pageobjects/linode-detail/linode-detail-volume.page';

describe('Header - Search - Volumes Suite', () => {
    const testVolume = {
        label: `AutoVolume${timestamp()}`,
        tags: [`AutoTag${timestamp()}`]
    }

    const assertVolumeDisplaysInSearchSuggestion = (query) => {
        SearchBar.executeSearch(query);
        SearchBar.suggestion.waitForVisible(constants.wait.normal);
        const volumeSuggestion = SearchBar.suggestions.find(suggestion => suggestion.getText().includes(testVolume.label));
        expect(volumeSuggestion).toBeTruthy();
        $('body').click();
        SearchBar.suggestion.waitForVisible(constants.wait.norma, true);
    }

    beforeAll(() => {
        createVolumes([testVolume]);
    });

    afterAll(() => {
        apiDeleteAllVolumes();
    });

    it('volume displays in search result suggestion when searching by name', () => {
        SearchBar.assertSearchDisplays();
        assertVolumeDisplaysInSearchSuggestion(testVolume.label);
    });

    it('volume displays in search result suggestions when searching by applied tag', () => {
        assertVolumeDisplaysInSearchSuggestion(testVolume.tags[0]);
    });

    it('searching for volume by name and pressing enter navigates to the search results page', () => {
        SearchBar.searchAndNavigateToResults(testVolume.label);
        SearchResults.waitForSearchResult('volumes',testVolume.label);
        expect(browser.getUrl()).toContain(`/search?query=${testVolume.label}`);
    });

    it('searching for volume by tag and pressing enter navigates to the search results page', () => {
        browser.url(constants.routes.volumes);
        VolumeDetail.volumeCellElem.waitForVisible(constants.wait.normal);
        SearchBar.searchAndNavigateToResults(testVolume.tags[0]);
        SearchResults.waitForSearchResult('volumes',testVolume.label);
        expect(browser.getUrl()).toContain(`/search?query=${testVolume.tags[0]}`);
    });

    it('tags are displayed on the search results row for the volume when tag is the query', () => {
        expect(SearchResults.getTagsAppliedToResult(testVolume.label)).toEqual(testVolume.tags);
    });
});
