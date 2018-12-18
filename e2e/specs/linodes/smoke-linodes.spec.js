const { constants } = require('../../constants');

import { flatten } from 'ramda';
import {
    apiCreateMultipleLinodes,
    apiDeleteAllLinodes,
    timestamp,
} from '../../utils/common';
import ListLinodes from '../../pageobjects/list-linodes';
import LinodeDetail from '../../pageobjects/linode-detail/linode-detail.page';
import SearchResults from '../../pageobjects/search-results.page';

describe('List Linodes Suite', () => {
    const linode = {
        linodeLabel: `AutoLinode${timestamp()}`,
        privateIp: false,
        tags: [`AutoTag${timestamp()}`]
    }

    const assertActionMenuItems = (linode) => {
        const expectedOptions = ['Reboot', 'Power Off', 'Launch Console', 'View Graphs', 'Resize', 'Enable Backups', 'Settings'];
        ListLinodes.actionMenuOptionExists($(ListLinodes.getLinodeSelector(linode)), expectedOptions);
        browser.click('body');
        ListLinodes.actionMenuItem.waitForExist(constants.wait.normal, true);
    }

    beforeAll(() => {
        apiCreateMultipleLinodes([linode]);
    });

    afterAll(() => {
        apiDeleteAllLinodes();
    });

    it('should display Linodes header', () => {
        const subheader = ListLinodes.subheader;
        expect(subheader.isVisible()).toBe(true);
        expect(subheader.getText()).toBe('Linodes');
    });

    it('should default to grid view', () => {
        if (ListLinodes.linode.length < 4) {
            const activeView = $('[data-qa-active-view]').getAttribute('data-qa-active-view');
            expect(activeView).toBe('grid');
        } else {
            pending('Defaults to list with > 3 Linodes');
        }
    });

    it('should display with documentation', () => {
            ListLinodes.assertDocsDisplay();
    });

    describe('Grid View Suite', () =>  {
        beforeAll(() => {
            const activeView = $('[data-qa-active-view]').getAttribute('data-qa-active-view');

            if (activeView !== 'grid') {
                browser.click('[data-qa-view="grid"]');
            }
        });

        it('should display a Linode and linode grid item elements', () => {
            ListLinodes.gridElemsDisplay();
        });

        it('should display action menu and linode action menu items', () => {
            assertActionMenuItems(linode.linodeLabel);
        });

        it('should display launch console button', () => {
            const consoleButton = $(`${ListLinodes.getLinodeSelector(linode.linodeLabel)} ${ListLinodes.launchConsole.selector}`);
            expect(consoleButton.isVisible()).toBe(true);
        });

        it('should display reboot button', () => {
            const rebootButton = $(`${ListLinodes.getLinodeSelector(linode.linodeLabel)} ${ListLinodes.rebootButton.selector}`);
            expect(rebootButton.isVisible()).toBe(true);
        });
    });

    describe('List View Suite', () => {
        let copyButtons, linodes;

        beforeAll(() => {
            ListLinodes.switchView('list');
        });

        it('should update url to contain list param', () => {
            const currentUrl = browser.getUrl();
            expect(currentUrl.includes('#list')).toBe(true);
        });

        it('should display linode, ips, region', () => {
            ListLinodes.listElemsDisplay();
        });

        it('should display copy to clipboard elements', () => {
            copyButtons = flatten(ListLinodes.linode.map(l => l.$$(ListLinodes.copyIp.selector)));
            const linodesLength = ListLinodes.linode.length;
            const expectedCopyButtons = linodesLength * 2;

            expect(copyButtons.length).toEqual(expectedCopyButtons);
        });

        it('should copy ip on click', () => {
            copyButtons[0].click();
            browser.waitForVisible('[data-qa-copied]');
        });

        it('should display the status', () => {
            linodes = ListLinodes.linode;
            const statuses = linodes.map(l => l.$(ListLinodes.status.selector));
            statuses.forEach(s => expect(['offline', 'running']).toContain(s.getAttribute('data-qa-status')));
        });

        it('should display action menu and linode action menu items', () => {
            assertActionMenuItems(linode.linodeLabel);
        });

        it('tags should be clickable in list view and navigate to search result page for the tag', () => {
            expect(ListLinodes.tag.isVisible()).toBe(true);
            ListLinodes.tag.click();
            SearchResults.waitForSearchResult('linodes',linode.linodeLabel);
            expect(browser.getUrl()).toContain(`?query=${linode.tags[0]}`);
        });
    });
});
