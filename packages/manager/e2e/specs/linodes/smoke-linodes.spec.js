const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import { flatten } from 'ramda';
import {
  apiCreateMultipleLinodes,
  apiDeleteAllLinodes,
  timestamp
} from '../../utils/common';
import ListLinodes from '../../pageobjects/list-linodes';
import LinodeDetail from '../../pageobjects/linode-detail/linode-detail.page';
import SearchResults from '../../pageobjects/search-results.page';

describe('List Linodes Suite', () => {
  const linode = {
    linodeLabel: `AutoLinode${timestamp()}`,
    privateIp: false,
    tags: [`AutoTag${timestamp()}`]
  };

  const assertActionMenuItems = linode => {
    const expectedOptions = [
      'Reboot',
      'Power Off',
      'Launch Console',
      'Clone',
      'Resize',
      'View Backups',
      'Enable Backups',
      'Delete'
    ];
    ListLinodes.actionMenuOptionExists(
      $(ListLinodes.getLinodeSelector(linode)),
      expectedOptions
    );
    $('body').click();
    ListLinodes.actionMenuItem.waitForExist(constants.wait.normal, true);
  };

  beforeAll(() => {
    apiCreateMultipleLinodes([linode]);
  });

  afterAll(() => {
    apiDeleteAllLinodes();
  });

  xit('should display Linodes header', () => {
    const subheader = ListLinodes.subheader;
    expect(subheader.isDisplayed())
      .withContext(`"${subheader.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(subheader.getText())
      .withContext(
        `${assertLog.incorrectText} for "${subheader.selector}" selector`
      )
      .toBe('Linodes');
  });

  xit('should default to grid view', () => {
    if (ListLinodes.linode.length < 4) {
      const activeView = $('[data-qa-active-view]').getAttribute(
        'data-qa-active-view'
      );
      expect(activeView)
        .withContext(
          `${assertLog.incorrectAttr} "[data-qa-active-view]" selector`
        )
        .toBe('grid');
    } else {
      pending('Defaults to list with > 3 Linodes');
    }
  });

  xit('should display with documentation', () => {
    ListLinodes.assertDocsDisplay();
  });

  xdescribe('Grid View Suite', () => {
    beforeAll(() => {
      const activeView = $('[data-qa-active-view]').getAttribute(
        'data-qa-active-view'
      );

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

    it('should display  console button', () => {
      expect(ListLinodes.launchConsole.isDisplayed())
        .withContext(
          `"${ListLinodes.launchConsole.selector}" selector ${
            assertLog.displayed
          }`
        )
        .toBe(true);
    });

    it('should display reboot button', () => {
      expect(ListLinodes.rebootButton.isDisplayed())
        .withContext(
          `"${ListLinodes.rebootButton.selector}" selector ${
            assertLog.displayed
          }`
        )
        .toBe(true);
    });
  });

  describe('List View Suite', () => {
    let copyButtons, linodes;

    beforeAll(() => {
      ListLinodes.switchView('list');
    });

    xit('should update url to contain list param', () => {
      const currentUrl = browser.getUrl();
      expect(currentUrl.includes('?view=list'))
        .withContext(`${assertLog.incorrectText} in Url`)
        .toBe(true);
    });

    it('should display linode, ips, region', () => {
      ListLinodes.listElemsDisplay();
    });

    it('should display copy to clipboard elements', () => {
      copyButtons = flatten(
        ListLinodes.linode.map(l => l.$$(ListLinodes.copyIp.selector))
      );
      const linodesLength = ListLinodes.linode.length;
      const expectedCopyButtons = linodesLength;

      expect(copyButtons.length)
        .withContext(`${assertLog.incorrectNum} for "${copyButtons}`)
        .toEqual(expectedCopyButtons);
    });

    xit('should copy ip on click', () => {
      copyButtons[0].click();
      $('[data-qa-copied]').waitForDisplayed();
    });

    it('should display the status', () => {
      linodes = ListLinodes.linode;
      const statuses = linodes.map(l => l.$(ListLinodes.status.selector));
      statuses.forEach(s =>
        expect(['offline', 'running']).toContain(
          s.getAttribute('data-qa-entity-status')
        )
      );
    });

    xit('should display action menu and linode action menu items', () => {
      assertActionMenuItems(linode.linodeLabel);
    });
  });
});
