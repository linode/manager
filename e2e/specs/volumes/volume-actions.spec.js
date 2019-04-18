const { constants } = require('../../constants');

import {
  timestamp,
  apiCreateLinode,
  createVolumes,
} from '../../utils/common';

import Volumes from '../../pageobjects/volumes.page';
import VolumeDetail from '../../pageobjects/linode-detail/linode-detail-volume.page';

describe("Volumes Landing - Volume Actions", () => {
  const volumeEast = {
    label: `testEast${timestamp()}`,
    size: 20
  }

  const volumeEastAttached = {
    label: `testEast2${timestamp()}`,
    size: 20
  }

  const volumeCentral = {
      region: 'us-central',
      label: `testWest${timestamp()}`
  }

  const testLinode = `AutoLinodeEast${timestamp()}`;

  beforeAll(() => {
    const linode = apiCreateLinode(testLinode);
    const environment = process.env.REACT_APP_API_ROOT;
    volumeEastAttached.linode_id = linode.id;
    if (environment.includes('dev') || environment.includes('testing')){
        createVolumes([volumeEast, volumeEastAttached]);
    } else{
      createVolumes([volumeEast, volumeCentral, volumeEastAttached], true);
    }
  });

  it("should list the Volumes on the Volumes landing page", () => {
    browser.url(constants.routes.volumes);
    Volumes.baseElemsDisplay();
    VolumeDetail.assertVolumeInTable(volumeEast);
    VolumeDetail.assertVolumeInTable(volumeEastAttached);
  });

  it("an unattached Volume should have the correct actions", () => {
    const unattachedVolumeId = Volumes.getVolumeId(volumeEast.label);
    const unattachedVolume = $(`[data-qa-volume-cell="${unattachedVolumeId}"]`);
    unattachedVolume.$(VolumeDetail.actionMenu.selector).click();
    const basicActions = ['Show Configuration', 'Edit Volume', 'Resize', 'Clone', 'Attach', 'Delete'];
    const actionsDisplayed = Volumes.actionMenuItems.map(action => action.getText());
    basicActions.forEach(action => {
      expect(actionsDisplayed).toContain(action);
    });
    
    // Close the menu
    $('[data-qa-backdrop]').click()
  });

  it("an attached Volume should have the correct actions", () => {
    const attachedVolumeId = Volumes.getVolumeId(volumeEastAttached.label);
    const attachedVolume = $(`[data-qa-volume-cell="${attachedVolumeId}"]`);
    browser.waitForExist('[data-qa-backdrop]', constants.wait.normal, true);

    attachedVolume.$(VolumeDetail.actionMenu.selector).click();
    const attachedActions = ['Show Configuration', 'Edit Volume', 'Resize', 'Clone', 'Detach'];
    const actionsDisplayed = Volumes.actionMenuItems.map(action => action.getText());
    attachedActions.forEach(action => {
      expect(actionsDisplayed).toContain(action);
    });

    expect(actionsDisplayed).not.toContain('Attach');
    expect(actionsDisplayed).not.toContain('Delete');
    // Close the menu
    $('[data-qa-backdrop]').click()
  });
});