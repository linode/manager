const { constants } = require('../../../constants');

import { apiCreateLinode, apiDeleteAllLinodes } from '../../../utils/common';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';
import Networking from '../../../pageobjects/linode-detail/linode-detail-networking.page';

describe('Linode Detail - Ip Transfer Suite', () => {
  let linodeA, linodeB, singlePublicIpError;

  beforeAll(() => {
    linodeA = apiCreateLinode(false, true);
    linodeB = apiCreateLinode(false, true);
    browser.url(`${constants.routes.linodes}/${linodeA.id}/networking`);
  });

  afterAll(() => {
    apiDeleteAllLinodes();
  });

  it('should display ip transfer configuration', () => {
    Networking.networkActionsTitle.waitForDisplayed(constants.wait.normal);
    Networking.expandPanels(2);
    expect(Networking.networkingActionsSubheading.isDisplayed()).toBe(true);
    expect(Networking.ipTransferSubheading.isDisplayed()).toBe(true);
    Networking.ipTransferActionMenu.waitForDisplayed(constants.wait.normal);
    expect(Networking.ipTransferActionMenus.length).toBe(2);
  });

  it('should display swap and move to transfer actions', () => {
    Networking.ipTransferActionMenus[0].click();

    Networking.moveIpButton.waitForDisplayed(constants.wait.normal);
    expect(Networking.swapIpButton.isDisplayed()).toBe(true);
  });

  it('should display an error on move to linode', () => {
    singlePublicIpError = `${
      linodeA.id
    } must have at least one public IP after assignment`;
    Networking.moveIpButton.click();
    Networking.moveIpButton.waitForDisplayed(constants.wait.normal, true);
    Networking.ipTransferSave.click();
    Networking.waitForNotice(singlePublicIpError);
  });

  it('should dismiss error on cancel', () => {
    Networking.ipTransferCancel.click();
    Networking.waitForNotice(singlePublicIpError, constants.wait.normal, true);
  });

  it('should fail to swap public to private ips', () => {
    const errorMsg = `${
      linodeA.id
    } must have no more than one private IP after assignment.`;

    chooseSwapAction();

    /** select the first private IP in the list */
    selectIP(true);

    /** save the configuration */
    Networking.ipTransferSave.click();
    Networking.waitForNotice(errorMsg);
  });

  it('should successfully swap ips on a valid ip selection', () => {
    /** chose swap fromthe dropdown */
    chooseSwapAction();

    /** click the first public IP in the list */
    selectIP();

    /** save the configuration */
    Networking.ipTransferSave.click();
  });
});

const chooseSwapAction = () => {
  /** click the first actions dropdown */
  Networking.ipTransferActionMenu.waitForDisplayed(constants.wait.normal);
  Networking.ipTransferActionMenu.click();

  Networking.swapIpButton.click();
};

const selectIP = (selectPrivIP = false) => {
  /** open the IP selection dropdown */
  const firstIPSelect = $('[data-qa-swap-ip-action-menu]');
  firstIPSelect.click();

  const filterFn =
    selectPrivIP === true
      ? ip =>
          !!ip
            .getText()
            .match(
              /^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/
            )
      : ip =>
          !ip
            .getText()
            .match(
              /^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/
            );

  /** click the first public IP in the list */
  $('[data-qa-option]').waitForDisplayed(constants.wait.normal);
  const ips = $$(`[data-qa-option]`).filter(filterFn);
  ips[0].click();
};
