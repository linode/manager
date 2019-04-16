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
    expect(Volumes.volumeCell.length).toBe(2);
  });

  it("should have basic actions", () => {
    VolumeDetail.selectActionMenuItemV2(VolumeDetail.volumeCellElem.selector, 'Detach');
  });
});