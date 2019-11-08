const { constants } = require('../../../constants');
const {
  apiCreateMultipleLinodes,
  apiDeleteAllLinodes,
  timestamp,
  checkEnvironment
} = require('../../../utils/common');
import Networking from '../../../pageobjects/linode-detail/linode-detail-networking.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';

describe('Linode Detail - Netwrking - IP Sharing', () => {
  let linode1id, linode1Ip, linode2Ip, linodeOtherDcIp;

  beforeAll(() => {
    const environment = process.env.REACT_APP_API_ROOT;
    const testLinodes = [
      { linodeLabel: `Auto${timestamp()}` },
      { linodeLabel: `Auto1${timestamp()}` }
    ];
    if (!environment.includes('dev') && !environment.includes('testing')) {
      testLinodes.push({
        linodeLabel: `Auto2${timestamp()}`,
        privateIp: false,
        tags: [],
        type: undefined,
        region: 'us-central'
      });
    }
    const linodes = apiCreateMultipleLinodes(testLinodes);
    linode1id = linodes[0].id;
    linode1Ip = linodes[0].ipv4[0];
    linode2Ip = linodes[1].ipv4[0];
    linodeOtherDcIp = linodes[2].ipv4[0];
    browser.url(`${constants.routes.linodes}/${linode1id}/networking`);
    Networking.landingElemsDisplay();
  });

  afterAll(() => {
    apiDeleteAllLinodes();
  });

  it('Can expand the Ip Sharing panel', () => {
    Networking.expandIpSharing();
  });

  it('Can not share an Ip with a linode in a different datacenter', () => {
    Networking.addIcon('Add IP Address').click();
    Networking.shareIpSelect.waitForDisplayed(constants.wait.normal);
    checkEnvironment();
    Networking.shareIpSelect.click();
    Networking.ipShareOption.waitForDisplayed(constants.wait.normal);
    expect(Networking.ipShareSelection(linodeOtherDcIp).isDisplayed()).toBe(
      false
    );
  });

  it('Can share an Ip with a linode in the same datacenter', () => {
    $('body').click();
    Networking.selectIpForSharing(linode2Ip);
    Networking.ipTableRow(linode2Ip).waitForDisplayed(constants.wait.normal);
  });

  it('Can remove a shared Ip address', () => {
    browser.refresh();
    Networking.landingElemsDisplay();
    Networking.expandPanel('IP Sharing');
    Networking.removeSharedIp.waitForDisplayed(constants.wait.normal);
    Networking.removeSharedIp.click();
    Networking.submitButton.click();
    Networking.waitForNotice('IP Sharing updated successfully');
    Networking.ipTableRow(linode2Ip).waitForDisplayed(
      constants.wait.normal,
      true
    );
  });

  it('Shared Ip removal persists after refreshing page', () => {
    browser.refresh();
    Networking.landingElemsDisplay();
    Networking.expandPanel('IP Sharing');
    Networking.addIcon('Add IP Address').waitForDisplayed(
      constants.wait.normal
    );
    expect(Networking.removeSharedIp.isDisplayed()).toBe(false);
    expect(Networking.ipTableRow(linode2Ip).isDisplayed()).toBe(false);
  });
});
