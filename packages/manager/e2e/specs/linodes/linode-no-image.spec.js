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
    noImage: true
  };
  let testLinode;

  beforeAll(() => {
    testLinode = apiCreateMultipleLinodes([linode])[0];
  });

  afterAll(() => {
    apiDeleteAllLinodes();
  });

  it('Power on tool tip displays for a linode without an image on Linode listing page', () => {
    ListLinodes.openActionMenu(
      $(ListLinodes.getLinodeSelector(linode.linodeLabel))
    );
    ListLinodes.toolTipIcon.waitForVisible(constants.wait.normal);
    const toolTipIcon = ListLinodes.powerOnMenu.$(
      ListLinodes.toolTipIcon.selector
    );
    toolTipIcon.waitForVisible(constants.wait.normal);
    toolTipIcon.moveToObject();
    expect(ListLinodes.toolTipMessage.getText()).toMatch(toolTipMessage);
  });

  it('Power on tool tip displays for a linode without an image on Linode detail page', () => {
    browser.url(`${constants.routes.linodes}/${testLinode.id}/summary`);
    browser.pause(500);
    LinodeDetail.powerControl.waitForVisible(constants.wait.normal);
    LinodeDetail.powerControl.click();
    browser.pause(500);
    LinodeDetail.setPowerOn.waitForVisible(constants.wait.normal);
    const toolTipIcon = LinodeDetail.setPowerOn.$(
      ListLinodes.toolTipIcon.selector
    );
    toolTipIcon.moveToObject();
    expect(ListLinodes.toolTipMessage.getText()).toBe(toolTipMessage);
  });
});
