const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import {
  apiCreateLinode,
  apiDeleteAllLinodes,
  apiDeleteAllVolumes
} from '../../utils/common';
import ListLinodes from '../../pageobjects/list-linodes';
import VolumeDetail from '../../pageobjects/linode-detail/linode-detail-volume.page';
import Volumes from '../../pageobjects/volumes.page';

describe('Create - Volume Suite', () => {
  let linodeLabel;
  let volumeId;
  const testVolume = {
    label: ``,
    size: '10'
  };
  let testLabel = `ASD${new Date().getTime()}`;

  afterAll(() => {
    apiDeleteAllLinodes();
    try {
      // attempt to remove all volumes, in case the ui failed
      apiDeleteAllVolumes();
    } catch (err) {
      // do nothing
    }
  });

  it('should setup the scenario', () => {
    browser.url(constants.routes.linodes);
    apiCreateLinode();
    ListLinodes.linodesDisplay();
    linodeLabel = ListLinodes.linode[0]
      .$(ListLinodes.linodeLabel.selector)
      .getText();
  });

  it('should create attached to a linode', () => {
    browser.url(constants.routes.volumes);
    Volumes.baseElemsDisplay(true);

    (testVolume['label'] = testLabel),
      (testVolume['attachedLinode'] = linodeLabel);

    VolumeDetail.createVolume(testVolume, 'header');

    browser.url(constants.routes.volumes);
    Volumes.baseElemsDisplay();

    volumeId = VolumeDetail.getVolumeId(testVolume.label);
    VolumeDetail.volumeCellElem.waitForDisplayed(constants.wait.normal);
    $(`[data-qa-volume-cell="${volumeId}"]`).waitForDisplayed(
      constants.wait.normal
    );
  });

  xit('should detach from linode', () => {
    console.log(`volume id: ${volumeId}`);
    const volumeElement = $(`[data-qa-volume-cell="${volumeId}"]`);
    VolumeDetail.detachVolume(volumeElement, testLabel);
    //Volumes.detachConfirm(volumeId, linodeLabel);
  });

  xit('should remove the volume', () => {
    VolumeDetail.removeAllVolumes();
  });
});
