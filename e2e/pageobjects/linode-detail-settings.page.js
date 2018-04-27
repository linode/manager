import Page from './page';

class Settings extends Page {
    get delete() { return $('[data-qa-delete-linode]'); }
    get deleteDialogTitle() { return $('[data-qa-dialog-title]'); }
    get deleteDialogContent() { return $('[data-qa-dialog-content]'); }
    get confirm() { return $('[data-qa-confirm-delete]'); }
    get cancel() { return $('[data-qa-cancel-delete]'); }

    remove() {
        const linodeLabel = browser.getText('[data-qa-label]');
        const confirmTitle = 'Confirm Deletion';
        const confirmContent = 'Deleting a Linode will result in permenant data loss. Are you sure?';
        this.delete.click();
        this.deleteDialogTitle.waitForText();
        this.deleteDialogContent.waitForText();
        this.confirm.waitForVisible();
        this.cancel.waitForVisible();

        expect(this.confirm.getAttribute('class')).toContain('destructive');
        expect(this.deleteDialogTitle.getText()).toBe(confirmTitle);
        expect(this.deleteDialogContent.getText()).toBe(confirmContent);

        this.confirm.click();
        browser.waitForVisible('[data-qa-circle-progress]', 15000, true);
        try {
            browser.waitForVisible('[data-qa-label]');
            const labels = $$('[data-qa-label]').map(l => l.getText());
            expect(labels).not.toContain(linodeLabel);
        } catch (e) {
            const placeholderDisplays = browser.waitForVisible('[data-qa-placeholder-title]');
            if (!placeholderDisplays) {
                throw new Error(e)
            }
        }
    }
}

export default new Settings();
