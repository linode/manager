const { constants } = require('../../constants');

import { flatten } from 'ramda';
import {
  apiCreateLinode,
  apiDeleteAllLinodes,
  timestamp,
  waitForLinodeStatus
} from '../../utils/common';
import ListLinodes from '../../pageobjects/list-linodes';

describe('List Linodes - Actions - Reboot Suite', () => {
  const linode = `AutoLinode${timestamp()}`;

  const waitForRebootListView = linode => {
    const linodeRow = $(ListLinodes.getLinodeSelector(linode));
    browser.waitUntil(() => {
      return linodeRow
        .$('..')
        .$('[data-qa-loading] [data-qa-entity-status="rebooting"]')
        .isDisplayed();
    }, constants.wait.normal);
  };

  beforeAll(() => {
    browser.url(constants.routes.linodes);
    apiCreateLinode(linode);
  });

  afterAll(() => {
    apiDeleteAllLinodes();
  });

  describe('Grid View Reboot - Suite', () => {
    let linodes;

    it('should reboot linode on click', () => {
      linodes = ListLinodes.linode;
      linodes[0].$(ListLinodes.rebootButton.selector).click();
      ListLinodes.acceptDialog('Reboot');
    });

    it('should update status on reboot to rebooting', () => {
      waitForLinodeStatus(linode, 'rebooting', true, constants.wait.short);
    });

    it('should display running status after booted', () => {
      waitForLinodeStatus(linode, 'running');
    });

    it('should display all grid view elements after reboot', () => {
      ListLinodes.gridElemsDisplay();
    });
  });

  describe('List View Reboot - Suite', () => {
    let totalLinodes;

    beforeAll(() => {
      ListLinodes.switchView('list');
      ListLinodes.tableHead.waitForDisplayed(constants.wait.normal);
      totalLinodes = ListLinodes.linode.length;
    });

    it('should reboot linode on click', () => {
      ListLinodes.selectActionMenuItemV2(
        ListLinodes.getLinodeSelector(linode),
        'Reboot'
      );
      ListLinodes.acceptDialog('Reboot');
    });

    it('should update status on reboot to rebooting', () => {
      waitForRebootListView(linode);
    });

    it('should display the linear progress bar above the linode row details', () => {
      const linodeRow = $(ListLinodes.getLinodeSelector(linode));
      expect(linodeRow.$(ListLinodes.linodeLabel.selector).isDisplayed()).toBe(
        true
      );
      expect(linodeRow.$(ListLinodes.ip.selector).isDisplayed()).toBe(true);
      expect(linodeRow.$(ListLinodes.region.selector).isDisplayed()).toBe(true);
      expect(linodeRow.$(ListLinodes.actionMenu.selector).isDisplayed()).toBe(
        true
      );
    });

    it('should display running status after booted', () => {
      waitForLinodeStatus(linode, 'running');
    });

    it('should display all list view elements after reboot', () => {
      ListLinodes.listElemsDisplay();
    });
  });
});
