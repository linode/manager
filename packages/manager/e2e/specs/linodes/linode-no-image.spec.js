const { constants } = require('../../constants');
import {
  apiCreateMultipleLinodes,
  apiDeleteAllLinodes,
  timestamp
} from '../../utils/common';
import ListLinodes from '../../pageobjects/list-linodes';
import LinodeDetail from '../../pageobjects/linode-detail/linode-detail.page';

describe('Can not boot a linode without an Image', () => {
  const toolTipMessage =
    'A config needs to be added before powering on a Linode';
  const linode = {
    linodeLabel: `Auto${timestamp()}`,
    noImage: true,
    timeout: 12000
  };
  let testLinode;

  beforeAll(() => {
    testLinode = apiCreateMultipleLinodes([linode])[0];
  });

  afterAll(() => {
    apiDeleteAllLinodes();
  });
  //TODO This takes an extremely long time to wait and makes this a slow test. Both of these
  //Tests should probably be Jest tests
  it('Power on tool tip displays for a linode without an image on Linode listing page', () => {
    ListLinodes.openActionMenu(
      $(ListLinodes.getLinodeSelector(linode.linodeLabel))
    );

    ListLinodes.toolTipIcon.waitForDisplayed(constants.wait.normal);
    const toolTipIcon = ListLinodes.powerOnMenu.$(
      ListLinodes.toolTipIcon.selector
    );
    toolTipIcon.waitForDisplayed(constants.wait.normal);
    toolTipIcon.moveTo();
    expect(ListLinodes.toolTipMessage.getText()).toMatch(toolTipMessage);
  });
  // TODO testLinode.id is returning undefined so this test cannot get to the linode page
  xit('Power on tool tip displays for a linode without an image on Linode detail page', () => {
    browser.url(`${constants.routes.linodes}/${testLinode.id}/summary`);
    browser.pause(500);
    LinodeDetail.powerControl.waitForDisplayed(constants.wait.normal);
    LinodeDetail.powerControl.click();
    browser.pause(500);
    LinodeDetail.setPowerOn.waitForDisplayed(constants.wait.normal);
    const toolTipIcon = LinodeDetail.setPowerOn.$(
      ListLinodes.toolTipIcon.selector
    );
    toolTipIcon.moveTo();
    expect(ListLinodes.toolTipMessage.getText()).toBe(toolTipMessage);
  });
});
