const { constants } = require('../../constants');
import {
    timestamp,
    apiCreateMultipleLinodes,
    apiDeleteAllLinodes,
    getLocalStorageValue,
} from '../../utils/common';
import ListLinodes from '../../pageobjects/list-linodes';

describe('Group Linodes by Tags - Suite', () => {

    const tags = [`b${timestamp()}`,`a${timestamp()}`,`c${timestamp()}`];
    let linodes = [];

    const generateTagGroups = () => {
        tags.forEach((tag) => {
            const lin = {
                linodeLabel: `A${tag}${timestamp()}`,
                tags: [tag]
            }
            const lin1 = {
                linodeLabel: `B${tag}${timestamp()}`,
                tags: [tag]
            }
            linodes.push(lin);
            linodes.push(lin1);
        });
    }

    const checkGroupedByTags = () => {
        tags.forEach((tag) => {
            const expectedLinodes = linodes.filter(linode => linode.tags[0] === tag)
                .map(filteredLinode => filteredLinode.linodeLabel);
            const displayedGroup = ListLinodes.getLinodesInTagsGroup(tag);
            expect(displayedGroup.sort()).toEqual(expectedLinodes.sort());
        });
    }

    const checkSortOrder = () => {
        const ascOrDesc = ListLinodes.sortLinodesByLabel.getAttribute(ListLinodes.linodeSortAttribute);
        tags.forEach((tag) => {
            const linodesInGroup = ListLinodes.getLinodesInTagsGroup(tag);
            ascOrDesc === 'asc' ? expect(linodesInGroup).toEqual(linodesInGroup.sort().reverse()) :
              expect(linodesInGroup).toEqual(linodesInGroup.sort())
        });
    }

    const tagGroupsInAlphabeticalOrder = () => {
        const tagHeaders = ListLinodes.tagHeaders
            .map(header => header.getAttribute(ListLinodes.tagHeaderSelector));
        expect(tagHeaders).toEqual(tags.sort());
    }

    beforeAll(() => {
        generateTagGroups();
        apiCreateMultipleLinodes(linodes);
        browser.pause(1000);
    });

    afterAll(() => {
        apiDeleteAllLinodes();
    });

    it('Group by tag toggle is present and off by default', () => {
        expect(ListLinodes.groupByTagsToggle.isVisible()).toBe(true);
        expect(ListLinodes.tagHeaders.length).toBe(0);
    });

    it('Group linodes by tags', () => {
        ListLinodes.groupByTags(true);
    });

    describe('Grouped Linodes - List View', () => {

        it('Linodes are groupped by tags', () => {
            checkGroupedByTags();
        });

        it('Tag groups are displayed in alphabetical order', () => {
            ListLinodes.tagGroupsInAlphabeticalOrder(tags);
        });

        it('Linodes are sortable within tag groups', () => {
            expect(ListLinodes.sortLinodesByLabel.isVisible()).toBe(true);
            [1,2].forEach((iterator) => {
                ListLinodes.sortLinodesByLabel.$('svg').click();
                browser.pause(500);
                checkSortOrder();
            });
        });

    });

    describe('Grouped Linodes - Grid View', () => {

        beforeAll(() => {
            ListLinodes.switchView('grid');
            browser.waitUntil(() => {
                return browser.getUrl().includes('?view=grid')
            });
        })

        it('Linodes are groupped by tags', () => {
            checkGroupedByTags();
        });

        it('Tag groups are displayed in alphabetical order', () => {
            ListLinodes.tagGroupsInAlphabeticalOrder(tags);
        });

    });

    it('Ungroup Linodes', () => {
        ListLinodes.groupByTags(false);
        ListLinodes.switchView('list');
        browser.waitUntil(() => {
            return browser.getUrl().includes('?view=list')
        });
        expect(ListLinodes.tagHeaders.length).toBe(0);
    });
});
