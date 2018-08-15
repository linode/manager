// TODO: M3-1049 - REFACTOR LINODE DETAILS VOLUMES TESTS

// const { constants } = require('../../../constants');

// import {
//     apiCreateLinode,
//     apiDeleteAllLinodes,
//     apiDeleteAllVolumes,
// } from '../../../utils/common';
// import VolumeDetail from '../../../pageobjects/linode-detail/linode-detail-volume.page';
// import ListLinodes from '../../../pageobjects/list-linodes';
// import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';

// describe('Linode - Volumes - Attach, Detach, Delete Suite', () => {
//     let linodeName;

//     const testVolume = {
//         label: `test-volume-${new Date().getTime()}`,
//         size: '20',
//     }

//     beforeAll(() => {
//         browser.url(constants.routes.linodes);
//         apiCreateLinode();
//         ListLinodes.linodeElem.waitForVisible();
//         linodeName = ListLinodes.linode[0].$(ListLinodes.linodeLabel.selector).getText();
//         ListLinodes.powerOff(ListLinodes.linode[0]);
//         ListLinodes.navigateToDetail();
//         LinodeDetail.landingElemsDisplay();
//         LinodeDetail.changeTab('Volumes');
        
//         VolumeDetail.createVolume(testVolume);
//         browser.waitForVisible('[data-qa-volume-cell]', constants.wait.long);
//     });

//     afterAll(() => {
//         apiDeleteAllLinodes();
//         apiDeleteAllVolumes();
//     });

//     it('should display detach linode dialog', () => {
//         const volume = VolumeDetail.volumeCell[0];
//         testVolume['id'] = volume.getAttribute('data-qa-volume-cell');
//         testVolume['label'] = volume.$(VolumeDetail.volumeCellLabel.selector).getText();

//         VolumeDetail.detachVolume(volume);
//     });

//     it('should detach the volume', () => {
//         VolumeDetail.detachConfirm(testVolume.id);
//         if (VolumeDetail.placeholderText.isVisible()) {
//             browser.waitUntil(function() {
//                 const placeholderMsg = VolumeDetail.placeholderText.getText();
//                 return placeholderMsg.includes('No volumes attached');
//             }, constants.wait.normal, `"No volumes attached" placeholder message failed to display`);
//         }
//     });

//     it('should display attach drawer', () => {
//         const createButton = 
//             VolumeDetail.placeholderText.isVisible() ? VolumeDetail.createButton : VolumeDetail.createIconLink;

//         createButton.click();
//         VolumeDetail.drawerTitle.waitForVisible();
//     });

//     it('should attach to linode', () => {
//         VolumeDetail.attachVolume(linodeName, testVolume);
//     });

//     it('should remove the volume', () => {
//         VolumeDetail.removeVolume($(`[data-qa-volume-cell="${testVolume.id}"]`));
//     });
// });
