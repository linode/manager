const { constants } = require('../../constants');

import Page from '../page';

export class Display extends Page {
    get emailAnchor() { return $('[data-qa-email]'); }
    get userName() { return $('[data-qa-username] input'); }
    get userEmail() { return $(`${this.emailAnchor.selector} input`); }
    get invalidEmailWarning() { return $(`${this.emailAnchor.selector} p`); }
    get saveTimeZone() { return $('[data-qa-tz-submit]'); }
    get timeZoneSelect() { return $(`[data-qa-enhanced-select="Choose a timezone."] ${this.multiSelect.selector}`); }

    baseElementsDisplay(){
        this.userMenu.waitForVisible(constants.wait.normal);
        this.userEmail.waitForVisible(constants.wait.normal);

        expect(this.submitButton.isVisible()).toBe(true);
        expect(this.cancelButton.isVisible()).toBe(true);
        expect(this.saveTimeZone.isVisible()).toBe(true);
        expect(this.timeZoneSelect.isVisible()).toBe(true);
    }
}

export default new Display();
