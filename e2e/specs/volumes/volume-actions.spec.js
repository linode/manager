const { constants } = require('../../constants');

import {
  timestamp,
  apiCreateLinode,
  apiDeleteLinode,
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

  let linode;

  beforeAll(() => {
    linode = apiCreateLinode(testLinode);
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
    const attached = Volumes.getVolumeElement(volumeEastAttached.label);
    const unattached = Volumes.getVolumeElement(volumeEast.label);
    expect(Volumes.isAttached(attached)).toBeTruthy();
    expect(Volumes.isAttached(unattached)).toBeFalsy();
  });

  it("an unattached Volume should have the correct actions", () => {
    const unattachedVolume = Volumes.getVolumeElement(volumeEast.label)
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
    const attachedVolume = Volumes.getVolumeElement(volumeEastAttached.label);
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

  it("should list a volume as unattached after deleting a Linode", () => {
    /**
     * An API bug causes Volumes to report themselves as still attached
     * after the Linode they were attached to is deleted. This lasts for a few seconds,
     * and if it overlaps the update-volume request the VolumesLanding table can be
     * out of date until page reload. We catch and fix this case client-side.
     */
    apiDeleteLinode(linode.id);
    browser.pause(1000);
    const wasAttached = Volumes.getVolumeElement(volumeEastAttached.label);
    expect(Volumes.isAttached(wasAttached)).toBeFalsy();

    wasAttached.$(VolumeDetail.actionMenu.selector).click();
    const actionsDisplayed = Volumes.actionMenuItems.map(action => action.getText());

    expect(actionsDisplayed).not.toContain('Detach');
    expect(actionsDisplayed).toContain('Delete');
    expect(actionsDisplayed).toContain('Attach');
  });
});