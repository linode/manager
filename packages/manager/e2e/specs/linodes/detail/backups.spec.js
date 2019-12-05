const { constants } = require('../../../constants');

import { apiCreateLinode, apiDeleteAllLinodes } from '../../../utils/common';
import Backups from '../../../pageobjects/linode-detail/linode-detail-backups.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';
import Settings from '../../../pageobjects/linode-detail/linode-detail-settings.page';

describe('Linode Detail - Backups Suite', () => {
  beforeAll(() => {
    // create a linode
    browser.url(constants.routes.linodes);
    $('[data-qa-add-new-menu-button]').waitForDisplayed();
    apiCreateLinode();
    ListLinodes.navigateToDetail();
    LinodeDetail.launchConsole.waitForDisplayed(constants.wait.normal);
    LinodeDetail.changeTab('Backups');
  });

  afterAll(() => {
    apiDeleteAllLinodes();
  });

  it('should dislay placeholder text', () => {
    Backups.baseElemsDisplay(true);
  });

  it('should enable backups', () => {
    const toastMsg = 'Backups are being enabled for this Linode';

    Backups.enableButton.click();
    Backups.toastDisplays(toastMsg);
    Backups.description.waitForDisplayed();
  });

  it('should display backups elements', () => {
    Backups.baseElemsDisplay();
  });
  // TODO this is no longer the behavior of this event. There is a new window and two warnings (probably an issue)
  // One on the new snapshot dialog and one on the Name Snapshot field
  xit('should fail to take a snapshot without a name', () => {
    Backups.snapshotButton.click();
    const toastMsg = 'A snapshot label is required.';
    Backups.toastDisplays(toastMsg);

    $('[data-qa-toast]').waitForExist(constants.wait.normal, true);
  });

  it('should cancel backups', () => {
    Backups.cancelBackups();
  });
});
