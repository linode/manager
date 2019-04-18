const { constants } = require('../../constants');

import {
  timestamp,
  apiCreateLinode,
  createVolumes,
  apiDeleteAllLinodes,
  apiDeleteAllVolumes,
  checkEnvironment,
} from '../../utils/common';

import Volumes from '../../pageobjects/volumes.page';
import VolumeDetail from '../../pageobjects/linode-detail/linode-detail-volume.page';

describe("Volumes Landing - Volume Actions", () => {
  const testVolume = {
    label: `AutoVolume${timestamp()}`,
    size: 100,
    tags: `AutoTag${timestamp()}`
  };

  const volumeEast = {
    label: `testEast${timestamp()}`
  }

  const volumeCentral = {
      region: 'us-central',
      label: `testWest${timestamp()}`
  }

  const testLinode = `AutoLinodeEast${timestamp()}`;

  beforeAll(() => {
    const environment = process.env.REACT_APP_API_ROOT;
    if (environment.includes('dev') || environment.includes('testing')){
        createVolumes([volumeEast]);
    } else{
      createVolumes([volumeEast,volumeCentral]);
    }
    apiCreateLinode(testLinode);
  });

  it("should list the Volumes on the Volumes landing page", () => {
    browser.url(constants.routes.volumes);
    Volumes.baseElemsDisplay();
    expect(Volumes.volumeCell.length).toBeGreaterThan(0);
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
  });

  it("an attached Volume should have the correct actions", () => {
    const unattachedVolumeId = Volumes.getVolumeId(volumeEast.label);
    const unattachedVolume = $(`[data-qa-volume-cell="${unattachedVolumeId}"]`);
    unattachedVolume.$(VolumeDetail.actionMenu.selector).click();
    const basicActions = ['Show Configuration', 'Edit Volume', 'Resize', 'Clone', 'Detach'];
    const actionsDisplayed = Volumes.actionMenuItems.map(action => action.getText());
    basicActions.forEach(action => {
      expect(actionsDisplayed).toContain(action);
    });
  });
});