const { constants } = require('../../constants');

import {
    timestamp,
    apiDeleteAllLinodes,
    waitForLinodeStatus,
} from '../../utils/common';
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
        ConfigureLinode.multiSelect.waitForVisible(constants.wait.normal);
        expect(ConfigureLinode.tagsMultiSelect.isVisible()).toBe(true);
        // Make this assertion generic, in case the copy changes
        expect(ConfigureLinode.tagsMultiSelect.getText()).toContain('tag');
    });

    it('should add a custom tag', () => {
        ConfigureLinode.addTagToTagInput(customTagName);
    });

    it('should select an available tag', () => {
        ConfigureLinode.multiOption.click();
        const selectOptions = ConfigureLinode.selectOptions
        availableTagName = selectOptions[selectOptions.length - 1].getText();

        // Put our added tags into the addedTags array for later useage
        addedTags.push(customTagName);
        addedTags.push(availableTagName);

        selectOptions[selectOptions.length - 1].click();

        ConfigureLinode.selectOption.waitForVisible(constants.wait.normal, true);
        ConfigureLinode.multiOption.waitForVisible(constants.wait.normal);

        const selectedTags = $$(ConfigureLinode.multiOption.selector).map( tag => tag.getText());

        expect(selectedTags).toContain(availableTagName);
        expect(selectedTags).toContain(customTagName);
    });

    it('should successfully remove the tag', () => {
        /** 
         * remove the available tag name from context 
         * because it's possbile this available tag might keep us
         * from deploying a Linode successfully
         */
        addedTags.pop();
        $$('.react-select__multi-value__remove')[1].click();

        const selectedTags = $$(ConfigureLinode.multiOption.selector)
            .map(tag => tag.getText());

        expect(selectedTags).not.toContain(availableTagName);
    });

    it('should deploy the tagged linode', () => {
        ConfigureLinode.generic(linodeName);
        ConfigureLinode.deploy.click();
        $('[data-qa-editable-text]').waitForVisible();
        expect($('[data-qa-editable-text]').getText()).toBe(linodeName)
    });

    describe('List Linodes - Tags Suite', () => {
        it('should display the linode with tags on the grid view', () => {
            /** 
             * we should now be on the Linodes detail screen 
             * so we need to navigate to the landing page
             */
            browser.url(constants.routes.linodes)
            $('[data-qa-label]').waitForVisible();

            /** make sure we're on the grid view */
            ListLinodes.gridToggle.click();
            ListLinodes.rebootButton.waitForVisible(constants.wait.normal);

            assertTagsDisplay(addedTags);
        });

        it('should display the linode with tags on list view', () => {
            ListLinodes.listToggle.click();
            ListLinodes.rebootButton.waitForVisible(constants.wait.normal, true);
            ListLinodes.hoverLinodeTags(linodeName);
            assertTagsDisplay(addedTags);
        });
    });

    describe('Linode Detail - Tags Suite', () => {
        it('should navigate to linode detail', () => {
            ListLinodes.navigateToDetail();
            LinodeDetail.landingElemsDisplay();
        });

        it('should display tags on linode detail', () => {
            assertTagsDisplay(addedTags);
        });

        it('should add a new tag', () => {
            const linodeDetailTag = `new${timestamp()}`;
            const expectedDetailTags = [...addedTags, linodeDetailTag];
            LinodeDetail.addTagToTagPanel(linodeDetailTag);
            assertTagsDisplay(expectedDetailTags);
        });

        it('should remove a tag', () => {
            LinodeDetail.removeTag(customTagName);
        });
    });
});
