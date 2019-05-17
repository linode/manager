const { constants } = require('../../../constants');

import { apiCreateLinode, apiDeleteAllLinodes } from '../../../utils/common';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';
import Networking from '../../../pageobjects/linode-detail/linode-detail-networking.page';

describe('Linode Detail - Ip Transfer Suite', () => {
	let linodeA, linodeB, singlePublicIpError;

	beforeAll(() => {
		linodeA = apiCreateLinode(false, true);
		linodeB = apiCreateLinode(false, true);
		browser.url(`${constants.routes.linodes}/${linodeA.id}/networking`);
	});

	afterAll(() => {
		apiDeleteAllLinodes();
	});

	it('should display ip transfer configuration', () => {
		Networking.networkActionsTitle.waitForVisible(constants.wait.normal);
		Networking.expandPanels(2);
		expect(Networking.networkingActionsSubheading.isVisible()).toBe(true);
		expect(Networking.ipTransferSubheading.isVisible()).toBe(true);
		Networking.ipTransferActionMenu.waitForVisible(constants.wait.normal);
		expect(Networking.ipTransferActionMenus.length).toBe(2);
	});

	it('should display swap and move to transfer actions', () => {
		Networking.ipTransferActionMenus[0].click();

		Networking.moveIpButton.waitForVisible(constants.wait.normal);
		expect(Networking.swapIpButton.isVisible()).toBe(true);
	});

	it('should display an error on move to linode', () => {
		singlePublicIpError = `${linodeA.id} must have at least one public IP after assignment`;
		Networking.moveIpButton.click();
		Networking.moveIpButton.waitForVisible(constants.wait.normal, true);
		Networking.ipTransferSave.click();
		Networking.waitForNotice(singlePublicIpError);
	});

	it('should dismiss error on cancel', () => {
		Networking.ipTransferCancel.click();
		Networking.waitForNotice(singlePublicIpError, constants.wait.normal, true);
	});

	it('should display swap ip action elements', () => {
		Networking.ipTransferActionMenu.waitForVisible(constants.wait.normal);
		Networking.ipTransferActionMenus[0].click();
		Networking.swapIpButton.waitForVisible();
		Networking.swapIpButton.click();
		Networking.swapIpButton.waitForVisible(constants.wait.normal, true);
		Networking.swapIpActionMenu.waitForVisible();
		Networking.swapIpActionMenu.click();
		browser.waitForVisible('[data-qa-swap-with]');

		expect(Networking.swapWithIps.length).toBeGreaterThan(1);
	});

	it('should fail to swap public to private ips', () => {
		const errorMsg = `${linodeA.id} must have no more than one private IP after assignment.`;
		const privateIps =
			Networking.swapWithIps
				.filter(ip => !!ip.getText().match(/^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/))
		privateIps[0].click();

		browser.waitForVisible('[data-qa-swap-with]', constants.wait.normal, true);

		Networking.ipTransferSave.click();
		Networking.waitForNotice(errorMsg);
	});

	it('should successfully swap ips on a valid ip selection', () => {
		Networking.swapIpActionMenu.click();
		browser.waitForVisible('[data-qa-swap-with]');

		const publicIps =
			Networking.swapWithIps
				.filter(ip => !!!ip.getText().match(/^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/));
		publicIps[0].click();
		browser.waitForVisible('[data-qa-swap-with]', constants.wait.normal, true);
		Networking.ipTransferSave.click();
	});
});
