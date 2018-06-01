const { constants } = require('../../constants');

import { flatten } from 'ramda';
import ListLinodes from '../../pageobjects/list-linodes';

describe('List Linodes Suite', () => {
    function assertActionMenuItems() {
        expect([ListLinodes.powerOffMenu.isVisible(), ListLinodes.powerOnMenu.isVisible()]).toContain(true);
        expect(ListLinodes.launchConsoleMenu.isVisible()).toBe(true);
        expect(ListLinodes.rebootMenu.isVisible()).toBe(true);
        expect(ListLinodes.viewGraphsMenu.isVisible()).toBe(true);
        expect(ListLinodes.resizeMenu.isVisible()).toBe(true);
        expect(ListLinodes.viewBackupsMenu.isVisible()).toBe(true);
        expect(ListLinodes.settingsMenu.isVisible()).toBe(true);
    }

    beforeAll(() => {
        browser.url(constants.routes.linodes);
        browser.waitForVisible('[data-qa-linode]');
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
            // Click first Linode Action Menu
            ListLinodes.linode[0].$(ListLinodes.linodeActionMenu.selector).click();
            assertActionMenuItems();

            browser.refresh();
        });

        it('should display launch console button', () => {
            ListLinodes.linodeLabel.waitForVisible();
            const consoleButton = ListLinodes.linode[0].$(ListLinodes.launchConsole.selector);
            expect(consoleButton.isVisible()).toBe(true);
        });

        it('should display reboot button', () => {
            const rebootButton = ListLinodes.linode[0].$(ListLinodes.rebootButton.selector);
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
            linodes.forEach(l => {
                const actionMenu = l.$(ListLinodes.linodeActionMenu.selector);
                expect(actionMenu.isVisible()).toBe(true);
            });
            linodes[0].$(ListLinodes.linodeActionMenu.selector).click();

            assertActionMenuItems();
        });
    });
});
