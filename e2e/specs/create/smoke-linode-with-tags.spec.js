const { constants } = require('../../constants');

import { timestamp, apiDeleteAllLinodes } from '../../utils/common';
import ListLinodes from '../../pageobjects/list-linodes';
import LinodeDetail from '../../pageobjects/linode-detail/linode-detail.page';
import ConfigureLinode from '../../pageobjects/configure-linode';

describe('Create Linode from Image - With Tags Suite', () => {
    let availableTagName, addedTags = [];
    const customTagName = `foo-${timestamp()}`;
    const linodeName = `Lin-${timestamp()}`;

    const assertTagsDisplay = (tags) => {
        ConfigureLinode.tag.waitForVisible(constants.wait.normal);

        const displayedTags = ConfigureLinode.tags.map(t => t.getText());

        tags.forEach(t => expect(displayedTags).toContain(t));
    }

    beforeAll(() => {
        browser.url(constants.routes.create.linode);
        ConfigureLinode.baseDisplay();
    });

    afterAll(() => {
        apiDeleteAllLinodes();
    });

    it('should display the tags multi select', () => {
        expect(ConfigureLinode.multiSelect.isVisible()).toBe(true);
        // Make this assertion generic, in case the copy changes
        expect(ConfigureLinode.multiSelect.getAttribute('data-qa-multi-select')).toContain('tag');
    });

    it('should add a custom tag', () => {
        ConfigureLinode.multiSelect.$('..').$('input').setValue(customTagName);
        ConfigureLinode.selectOption.waitForVisible(constants.wait.normal);
        ConfigureLinode.selectOption.click();

        ConfigureLinode.multiOption.waitForVisible(constants.wait.normal);
        expect(ConfigureLinode.multiOption.getText()).toBe(customTagName);;
    });

    it('should select an available tag', () => {
        ConfigureLinode.multiOption.click();
        availableTagName = $$('[data-qa-option]')[0].getText();

        // Put our added tags into the addedTags array for later useage
        addedTags.push(availableTagName);
        addedTags.push(customTagName);

        ConfigureLinode.selectOptions[0].click();

        ConfigureLinode.selectOption.waitForVisible(constants.wait.normal, true);
        ConfigureLinode.multiOption.waitForVisible(constants.wait.normal);

        const selectedTags = $$(ConfigureLinode.multiOption.selector).map( tag => tag.getText());

        expect(selectedTags).toContain(availableTagName);
        expect(selectedTags).toContain(customTagName);
    });

    it('should deploy the tagged linode', () => {
        ConfigureLinode.generic(linodeName);
        ConfigureLinode.deploy.click();
        ListLinodes.waitUntilBooted(linodeName);
    });

    describe('List Linodes - Tags Suite', () => {
        it('should display the linode with tags on the grid view', () => {
            assertTagsDisplay(addedTags);
        });

        it('should display the linode with tags on list view', () => {
            ListLinodes.listToggle.click();
            ListLinodes.rebootButton.waitForVisible(constants.wait.normal, true);
            assertTagsDisplay(addedTags);
        });
    });

    describe('Linode Detail - Tags Suite', () => {
        beforeAll(() => {
            // It should navigate to Linode detail page
            ListLinodes.navigateToDetail($(`[data-qa-linode="${linodeName}"]`));
            LinodeDetail.landingElemsDisplay();
        });

        it('should display tags on linode detail', () => {
            assertTagsDisplay(addedTags);
        });

        it('should add a new tag', () => {
            const linodeDetailTag = `new${timestamp()}`;
            const expectedDetailTags = [...addedTags, linodeDetailTag];

            LinodeDetail.addTag.click();
            LinodeDetail.multiSelect.waitForVisible(constants.wait.normal);
            LinodeDetail.multiSelect.$('..').$('input').setValue(linodeDetailTag);
            LinodeDetail.selectOptions[0].click();

            browser.waitUntil(function() {
                return $$('[data-qa-tag]').length === 3;
            }, constants.wait.normal);

            assertTagsDisplay(expectedDetailTags);
        });

        it('should remove a tag', () => {
            LinodeDetail.removeTag(customTagName);
        });
    });
});
