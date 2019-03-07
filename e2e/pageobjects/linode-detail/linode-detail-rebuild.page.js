const { constants } = require('../../constants');

import Page from '../page';

class Rebuild extends Page {
    get title() { return this.pageTitle; }
    get description() { return $('[data-qa-rebuild-desc]'); }
    get imageSelectSelector() { return 'div>div[data-qa-enhanced-select]';}
    get rebuildSelect() { return $(`${this.imageSelectSelector}>div>div`); }
    get password() { return $('[data-qa-hide] input'); }
    get submit() { return $('[data-qa-rebuild]'); }
    get imageSelectHeader() { return $('[data-qa-select-header]'); }
    get imageOption() { return $('[data-qa-image-option]'); }
    get imageOptions() { return $$(this.imageOption.selector); }
    get imageError() { return $(`${this.imageSelectSelector}>p`); }
    get rebuildDescriptionText() { return $('[data-qa-rebuild-desc]'); }

    assertElemsDisplay() {
        this.rebuildDescriptionText.waitForVisible(constants.wait.normal);
        this.rebuildSelect.waitForVisible(constants.wait.normal);
        browser.waitUntil(() => {
            return this.images.length !== 0;
        });
    }

    selectImage(label) {
        if (label) {
          const targetImage =
              this.imageNames
                  .find(option => option.getText().includes(label));
          targetImage.click();
        }else{
            this.imageNames[0].click();
        }
    }

    rebuild() {
        const toastMessage = 'Linode rebuild started.';
        browser.jsClick(this.submit.selector);
        this.toastDisplays('Linode rebuild started');
    }
}

export default new Rebuild();
