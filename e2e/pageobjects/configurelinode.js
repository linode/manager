import Page from './page';

class ConfigureLinode extends Page {
    get createHeader() { return $('[data-qa-create-linode-header]'); }
    get orderSummary() { return $('[data-qa-order-summary'); }
    get costSummary() { return $('[data-qa-total-price]'); }
    get deploy() { return $('[data-qa-deploy-linode]'); }
    
    get selectImageHeader() { return $('[data-qa-tp-title="Select Image Type"]'); }
    get imageTabs() { return  $$('[data-qa-tp-title="Select Image Type"] [data-qa-tab]'); }
    get images() { return $$('[data-qa-tp-title="Select Image Type"] [data-qa-selection-card]'); }
    get showOlderImages() { return $('[data-qa-show-more-expanded]'); }
    
    get selectRegionHeader() { return $('[data-qa-tp-title="Region"]'); }
    get regionTabs() { return $$('[data-qa-tp-title="Region"] [data-qa-tab]'); }
    get regions() { return $$('[data-qa-tp-title="Region"] [data-qa-selection-card]'); }

    get planHeader() { return $('[data-qa-tp-title="Linode Plan"]'); }
    get planTabs() { return $$('[data-qa-tp-title="Linode Plan"] [data-qa-tab]'); }
    get plans() { return $$('[data-qa-tp-title="Linode Plan"] [data-qa-selection-card]'); }

    get labelHeader() { return $('[data-qa-label-header]'); }
    get label() { return $('[data-qa-label-header] input'); }

    get passwordHeader() { return $('[data-qa-password-input]'); }
    get password() { return $('[data-qa-password-input] input'); }

    get addonsHeader() { return $('[data-qa-add-ons]'); }
    get addons() { return $$('[data-qa-add-ons] [data-qa-checked]')  }

    elementsDisplay() {
        expect(this.createHeader.waitForVisible()).toBe(true);
        expect(this.orderSummary.isVisible()).toBe(true);
        expect(this.costSummary.isVisible()).toBe(true);
        expect(this.deploy.isVisible()).toBe(true);

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
}
export default new ConfigureLinode();
