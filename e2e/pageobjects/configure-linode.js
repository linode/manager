import Page from './page';

class ConfigureLinode extends Page {
    get createHeader() { return $('[data-qa-create-linode-header]'); }
    
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
    generic() {
        this.images[0].click();
        this.regions[0].click();
        this.plans[0].click();
        this.label.setValue(`Test-Linode${new Date().getTime()}`);
        this.password.setValue('Testing1234#');
        this.addons[0].click();
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

    selectPlan(plan) {

    }


}
export default new ConfigureLinode();
