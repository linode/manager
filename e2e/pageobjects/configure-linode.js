import Page from './page';

class ConfigureLinode extends Page {
    get createHeader() { return $('[data-qa-create-linode-header]'); }
    get createFromImage() { return $('[data-qa-create-from="Create from Image"]'); }
    get createFromBackup() { return $('[data-qa-create-from="Create from Backup"]'); }
    get createFromExisting() { return $('[data-qa-create-from="Clone From Existing"]'); }
    
    // get selectLinodePanel() {}

    get selectLinodeHeader() { return $('[data-qa-select-linode-header]'); }
    get selectImageHeader() { return $('[data-qa-tp="Select Image Type"]'); }
    get imageTabs() { return  $$('[data-qa-tp="Select Image Type"] [data-qa-tab]'); }
    get images() { return $$('[data-qa-tp="Select Image Type"] [data-qa-selection-card]'); }
    get showOlderImages() { return $('[data-qa-show-more-expanded]'); }
    
    get selectRegionHeader() { return $('[data-qa-tp="Region"]'); }
    get regionTabs() { return $$('[data-qa-tp="Region"] [data-qa-tab]'); }
    get regions() { return $$('[data-qa-tp="Region"] [data-qa-selection-card]'); }

    get planHeader() { return $('[data-qa-tp="Linode Plan"]'); }
    get planTabs() { return $$('[data-qa-tp="Linode Plan"] [data-qa-tab]'); }
    get plans() { return $$('[data-qa-tp="Linode Plan"] [data-qa-selection-card]'); }

    get labelHeader() { return $('[data-qa-label-header]'); }
    get label() { return $('[data-qa-label-header] input'); }

    get passwordHeader() { return $('[data-qa-password-input]'); }
    get password() { return $('[data-qa-password-input] input'); }

    get addonsHeader() { return $('[data-qa-add-ons]'); }
    get addons() { return $$('[data-qa-add-ons] [data-qa-checked]');  }

    get orderSummary() { return $('[data-qa-order-summary]'); }
    get total() { return $('[data-qa-total-price]'); }
    get deploy() { return $('[data-qa-deploy-linode]'); }

    cloneBaseElemsDisplay() {
        this.notice.waitForVisible();
        const notices = $$(this.notice.selector);

        const cloneSLA = 'This newly created Linode wil be created with the same password as the original Linode';
        const cloneFromHeader = 'Select Linode to Clone From';
        const selectLinodePanelText = $$('[data-qa-select-linode-header]').map(h => h.getText());

        expect(notices.map(n => n.getText())).toContain(cloneSLA);
        expect($$('[data-qa-select-linode-header]').length).toBe(1);
        expect(selectLinodePanelText).toContain(cloneFromHeader);
        expect(this.total.isVisible()).toBe(true);
        expect(this.total.getText()).toBe('$0.00 /mo');
        expect(this.deploy.isVisible()).toBe(true);
    }

    baseDisplay() {
        expect(this.createHeader.waitForVisible()).toBe(true);

        expect(this.selectImageHeader.isVisible()).toBe(true);
        this.imageTabs.forEach(tab => expect(tab.isVisible()).toBe(true));
        this.images.forEach(i => expect(i.isVisible()).toBe(true));
        expect(this.showOlderImages.isVisible()).toBe(true);
        
        expect(this.selectRegionHeader.isVisible()).toBe(true);
        this.regionTabs.forEach(tab => expect(tab.isVisible()).toBe(true));
        this.regions.forEach(r => expect(r.isVisible()).toBe(true));

        expect(this.planHeader.isVisible()).toBe(true);
        this.planTabs.forEach(tab => expect(tab.isVisible()).toBe(true));
        this.plans.forEach(p => expect(p.isVisible()).toBe(true));

        expect(this.labelHeader.isVisible()).toBe(true);
        expect(this.label.isVisible()).toBe(true);

        expect(this.passwordHeader.isVisible()).toBe(true);
        expect(this.password.isVisible()).toBe(true);
        
        expect(this.addonsHeader.isVisible()).toBe(true);
        this.addons.forEach(a => expect(a.isVisible()).toBe(true));
    }
    // Configure a basic linode, selecting all the default options
    generic(label=`Test-Linode${new Date().getTime()}`) {
        this.images[0].click();
        this.regions[0].click();
        this.plans[0].click();
        this.label.setValue(label);
        this.password.setValue(`SomeTimeStamp${new Date().getTime()}`);
    }

    selectRegion(region) {
        this.generic();
        browser.click(`[data-qa-tp="Region"] [data-qa-tab="${region}"]`);

        // Select first available location in region
        this.regions[0].click();
    }

    selectImage(imageName) {
        const requestedImage = $(`[data-qa-select-card-heading="${imageName}"]`);
        requestedImage.click();
    }

    selectPlanTab(planType) {
        const initialPlans = this.plans.length;

        this.planHeader.$(`[data-qa-tab="${planType}"]`).click();

        browser.waitUntil(function() {
            return $$('[data-qa-tp="Linode Plan"] [data-qa-selection-card]').length !== initialPlans;
        }, 5000);
    }

    selectPlan(planIndex=0) {
        const planElement = this.plans[planIndex];
        planElement.click();
        browser.waitUntil(function() {
            return planElement.getAttribute('class').includes('checked');
        }, 5000, 'Failed to select plan');
    }

    cloneSelectSource(linodeLabel) {
        const sourceSection = $$('[data-qa-select-linode-panel]')
            .filter(s => s.$('[data-qa-select-linode-header]').getText() === 'Select Linode to Clone From');
        // const targetSection = $$('[data-qa-select-linode-panel]')
            // .filter(s => s.$('[data-qa-select-linode-header]').getText() === 'Select Target Linode');

        let linodes = sourceSection[0].$$('[data-qa-selection-card]');
        let sourceLinode = linodes[0];
        let sourceLabel = sourceLinode.$('[data-qa-select-card-heading]').getText();
        sourceLinode.click();

        // let targetLinodeCard = targetSection[0].$$('[data-qa-selection-card]')
            // .filter(c => c.$('[data-qa-select-card-heading]').getText() === sourceLabel);
        // expect(targetLinodeCard[0].getAttribute('class')).toContain('disabled');

        if (linodeLabel) {
            linodes = sourceSection[0].$$('[data-qa-selection-card]')
                .filter(l => l.$('[data-qa-select-card-heading]').getText() === linodeLabel);
            sourceLinode = linodes[0];
            sourceLabel = sourceLinode.$('[data-qa-select-card-heading]').getText();

            sourceLinode.click();
            
            // targetLinodeCard = targetSection[0].$$('[data-qa-selection-card]')
                // .filter(c => c.$('[data-qa-select-card-heading]').getText() === sourceLabel);

            // expect(targetLinodeCard[0].getAttribute('class')).toContain('disabled');
        }
    }

    cloneSelectTarget(linodeLabel) {
        if (linodeLabel) {
            const targetSection = $$('[data-qa-select-linode-panel]').filter(s => s.$('[data-qa-select-linode-header]').getText() === 'Select Target Linode');
            const linodes = targetSection[0].$$('[data-qa-selection-card]')
                .filter(l => l.$('[data-qa-select-card-heading]').getText() === linodeLabel);
            linodes[0].click();
        } else {
            const cloneToNewCard = $('[data-qa-select-card-heading="New Linode"]');
            cloneToNewCard.click();
            browser.waitForVisible('[data-qa-tp="Region"]');
            browser.waitForVisible('[data-qa-tp="Linode Plan"]');
            browser.waitForVisible('[data-qa-label-header]');
        }
    }
}
export default new ConfigureLinode();
