const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import {
  apiCreateMultipleLinodes,
  apiCreateLinode,
  timestamp,
  apiDeleteAllLinodes,
  apiDeleteAllVolumes,
  checkEnvironment
} from '../../utils/common';
import ListLinodes from '../../pageobjects/list-linodes';
import VolumeDetail from '../../pageobjects/linode-detail/linode-detail-volume.page';

describe('Create, Edit, Resize, Attach, Detach, Clone, Delete - Volume Suite', () => {
  const linodeEast = {
    linodeLabel: `east${timestamp()}`,
    privateIp: false,
    tags: []
  };
  const linodeCentral = {
    linodeLabel: `central${timestamp()}`,
    privateIp: false,
    tags: [],
    type: undefined,
    region: 'us-central'
  };
  const testVolume = {
    label: ``,
    size: '10'
  };

  const getLinodeOptions = () => {
    VolumeDetail.selectLinodeOrVolume.click();
    VolumeDetail.selectOption.waitForDisplayed(constants.wait.normal);
    const linodes = VolumeDetail.selectOptions.map(option => option.getText());
    const justLinodes = linodes.filter(options => options != 'Select a Linode');
    $('body').click();
    VolumeDetail.selectOption.waitForDisplayed(constants.wait.normal, true);
    return justLinodes;
  };

  beforeAll(() => {
    const environment = process.env.REACT_APP_API_ROOT;
    if (environment.includes('dev') || environment.includes('testing')) {
      apiCreateLinode(linodeEast.linodeLabel);
    } else {
      apiCreateMultipleLinodes([linodeEast, linodeCentral]);
    }
  });

  afterAll(() => {
    apiDeleteAllVolumes();
    apiDeleteAllLinodes();
  });

  it('should display create volumes option in global create menu', () => {
    ListLinodes.globalCreate.click();
    ListLinodes.addVolumeMenu.waitForDisplayed(constants.wait.normal);
  });

  it('should display global volume create drawer', () => {
    ListLinodes.addVolumeMenu.click();
    VolumeDetail.defaultDrawerElemsDisplay();
  });

  it('should display volume helper text', () => {
    const sizeHelpText =
      'A single Volume can range from 10 to 10240 gibibytes in size and costs $0.10/GiB per month. Up to eight volumes can be attached to a single Linode.';
    const volumeHelpText =
      'Volumes must be created in a particular region. You can choose to create a volume in a region and attach it later to a Linode in the same region. If you select a Linode from the field below, the Volume will be automatically created in that Linode’s region and attached upon creation.';
    const regionHelpText =
      'If you want to attach the new volume to a Linode, select it here. Only Linodes in the selected region are displayed.';
    const blockStorageText =
      'The datacenter where the new volume should be created. Only regions supporting block storage are displayed.';
    expect(VolumeDetail.volumeCreateSizeHelpText.getText()).toEqual(
      sizeHelpText
    );
    expect(VolumeDetail.volumeCreateHelpText.getText()).toEqual(volumeHelpText);
    const volumeFieldsText = $$(VolumeDetail.volumeCreateRegionHelp.selector);
    expect(volumeFieldsText[0].getText()).toEqual(blockStorageText);
    expect(volumeFieldsText[1].getText()).toEqual(regionHelpText);
  });

  it('should display volume price dynamically based on size', () => {
    [200, 333, 450].forEach(price => {
      browser.trySetValue(`${VolumeDetail.size.selector} #size`, price);
      const volumePrice = price * 0.1;
      expect(VolumeDetail.volumePrice.getText()).toEqual(
        `$${volumePrice.toFixed(2)}`
      );
      expect(VolumeDetail.volumePriceBillingInterval.getText()).toContain('mo');
    });
  });

  //TODO redo this test as we no longer have options for regions like us-east
  xit('should only display linodes in a selected region', () => {
    checkEnvironment();
    VolumeDetail.selectRegion('us-east');
    browser.pause(500);
    expect(getLinodeOptions()).toEqual([linodeEast.linodeLabel]);
    VolumeDetail.selectRegion('us-central');
    expect(getLinodeOptions()).toEqual([linodeCentral.linodeLabel]);
  });

  it('should display a tag input/select field for tagging new volume', () => {
    expect(VolumeDetail.tagsMultiSelect.isDisplayed()).toBe(true);
    VolumeDetail.closeVolumeDrawer();
  });

  it('should display form error on create without a label', () => {
    VolumeDetail.createVolume(testVolume, 'header');
    expect(VolumeDetail.label.$('p').isDisplayed()).toBe(true);
    VolumeDetail.closeVolumeDrawer();
  });

  it('should display a error notice on create without region', () => {
    testVolume['label'] = `ASD${new Date().getTime()}`;
    VolumeDetail.createVolume(testVolume, 'header');
    expect($('#select-a-region-helper-text').isDisplayed())
      .withContext(`region error ${assertLog.displayed}`)
      .toBe(true);
    VolumeDetail.closeVolumeDrawer();
  });

  it('create a volume in a region with a tag', () => {
    testVolume['label'] = `ASD${new Date().getTime()}`;
    testVolume['region'] = 'Newark, NJ';
    testVolume['tag'] = `Auto${new Date().getTime()}`;
    VolumeDetail.createVolume(testVolume, 'header');
    VolumeDetail.waitForNotice('Volume scheduled for creation.');
    VolumeDetail.toastDisplays(
      'Volume successfully created.',
      constants.wait.minute * 2
    );
  });

  it('after creating a volume, configuration drawer displays with volume mounting commands', () => {
    VolumeDetail.volumeConfigurationDrawerDisplays();
    VolumeDetail.checkVolumeConfigurationCommands(testVolume.label);
  });

  // TODO this test fails at times but if skipped cause the trailing tests to fail
  // leaving this on for now
  it('should create a volume without attaching to a linode', () => {
    VolumeDetail.drawerClose.click();
    browser.url(constants.routes.volumes);
    browser.waitUntil(() => {
      return VolumeDetail.volumeCell.length > 0;
    }, constants.wait.long);
    expect(VolumeDetail.volumeCellLabel.getText()).toContain(testVolume.label);
  });

  //TODO check if this tag functionality works this way now
  xit('should display the tags added to the volume', () => {
    VolumeDetail.hoverVolumeTags(testVolume.label);
    VolumeDetail.checkTagsApplied([testVolume.tag]);
  });

  it('expected action menu options are displayed for a detached volume', () => {
    const volumeActionMenu = `${VolumeDetail.volumeCellElem.selector} ${
      VolumeDetail.actionMenu.selector
    }`;
    $(volumeActionMenu).waitForDisplayed(constants.wait.true);
    $(volumeActionMenu).click();
    VolumeDetail.assertActionMenuItems(false);
    $('body').click();
    VolumeDetail.actionMenuItem.waitForDisplayed(constants.wait.normal, true);
  });

  //TODO check if this tag functionality works this way now
  xit('can edit volume, update label and add tag', () => {
    const tag1 = testVolume.tag;
    const tag2 = `Auto-New${timestamp()}`;
    testVolume['label'] = `edit${timestamp()}`;
    testVolume['tag'] = [tag1, tag2];
    browser.pause(500);
    VolumeDetail.selectActionMenuItemV2(
      VolumeDetail.volumeCellElem.selector,
      'Edit Volume'
    );
    VolumeDetail.editVolume(testVolume.label, tag2);
    browser.pause(1000);
    VolumeDetail.hoverVolumeTags(testVolume.label);
    VolumeDetail.checkTagsApplied(testVolume.tag);
  });

  it('can resize a volume', () => {
    testVolume['size'] = 100;
    VolumeDetail.selectActionMenuItemV2(
      VolumeDetail.volumeCellElem.selector,
      'Resize'
    );
    VolumeDetail.resizeVolume(testVolume.size);
    expect(VolumeDetail.umountCommand.getAttribute('value'))
      .withContext(`${assertLog.incorrectText}`)
      .toEqual(
        `umount /dev/disk/by-id/scsi-0Linode_Volume_${testVolume.label}`
      );
    expect(VolumeDetail.fileSystemCheckCommand.getAttribute('value'))
      .withContext(`${assertLog.incorrectText}`)
      .toEqual(
        `e2fsck -f /dev/disk/by-id/scsi-0Linode_Volume_${testVolume.label}`
      );
    expect(VolumeDetail.resizeFileSystemCommand.getAttribute('value'))
      .withContext(`${assertLog.incorrectText}`)
      .toEqual(
        `resize2fs /dev/disk/by-id/scsi-0Linode_Volume_${testVolume.label}`
      );
    expect(VolumeDetail.mountCommand.getAttribute('value'))
      .withContext(`${assertLog.incorrectText}`)
      .toEqual(
        `mount /dev/disk/by-id/scsi-0Linode_Volume_${testVolume.label} /mnt/${
          testVolume.label
        }`
      );
    VolumeDetail.closeVolumeDrawer();
    browser.waitUntil(() => {
      return VolumeDetail.volumeCellSize.getText().includes(testVolume.size);
    }, constants.wait.normal);
  });

  it('can attach a detached volume', () => {
    VolumeDetail.selectActionMenuItemV2(
      VolumeDetail.volumeCellElem.selector,
      'Attach'
    );
    VolumeDetail.attachVolumeFromVolumeLanding(linodeEast.linodeLabel);
    VolumeDetail.toastDisplays(
      'Volume successfully attached.',
      constants.wait.minute
    );
  });

  it('can detach an attached volume', () => {
    const volumeActionMenu = `${VolumeDetail.volumeCellElem.selector} ${
      VolumeDetail.actionMenu.selector
    }`;
    $(volumeActionMenu).waitForDisplayed(constants.wait.true);
    $(volumeActionMenu).click();
    VolumeDetail.assertActionMenuItems(true);
    $('body').click();
    VolumeDetail.actionMenuItem.waitForDisplayed(constants.wait.normal, true);
    browser.pause(750);
    VolumeDetail.selectActionMenuItemV2(
      VolumeDetail.volumeCellElem.selector,
      'Detach'
    );
    VolumeDetail.confirmDetachORDelete();
    VolumeDetail.toastDisplays(
      'Volume successfully detached.',
      constants.wait.minute * 3
    );
    expect($$(VolumeDetail.volumeAttachment.selector).length).toEqual(0);
  });

  it('can clone an existing volume', () => {
    const cloneLabel = `Clone${timestamp()}`;
    VolumeDetail.selectActionMenuItemV2(
      VolumeDetail.volumeCellElem.selector,
      'Clone'
    );
    VolumeDetail.cloneVolume(cloneLabel, testVolume.size);
    const clonedVolume = $$(VolumeDetail.volumeCellLabel.selector).find(
      volume => volume.getText().includes(cloneLabel)
    );
    expect(clonedVolume).toBeTruthy();
  });

  it('can delete a volume', () => {
    browser.pause(500);
    VolumeDetail.selectActionMenuItemV2(
      VolumeDetail.volumeCellElem.selector,
      'Delete'
    );
    VolumeDetail.confirmDetachORDelete();
    VolumeDetail.toastDisplays(
      'Volume successfully deleted.',
      constants.wait.minute
    );
    browser.waitUntil(() => {
      return VolumeDetail.volumeCell.length === 1;
    }, constants.wait.minute);
  });
});
