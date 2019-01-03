import Page from '../page';

class Resize extends Page {
    get title() { return this.pageTitle; }
    get description() { return $('[data-qa-description]'); }
    get currentHeader() { return $('[data-qa-current-header]'); }
    get currentSelection() { return $('[data-qa-current-container] [data-qa-selection-card]'); }
    get tierTabs() { return $$('[data-qa-tab]'); }
    get planCards() { return $$('[data-qa-tp="Linode Plan"] [data-qa-selection-card]'); }
    get submit() { return this.submitButton; }

    landingElemsDisplay() {
        const subHeader = 'Current Plan';
        const selectedPlanTab = this.tierTabs.filter(tier => tier.getAttribute('aria-selected').includes('true') && !tier.getText().includes('Resize'));
        const checkedCards = $$('[data-qa-checked] > svg');

        expect(this.title.getText()).toBe('Resize');
        expect(this.description.isVisible()).toBe(true);
        expect(this.currentHeader.getText()).toBe(subHeader);
        expect(this.currentSelection.isVisible()).toBe(true);
        expect(this.submit.isVisible()).toBe(true);
        expect(this.planCards.length).toBeGreaterThan(0);
        expect(checkedCards.length).toBe(0);
        expect(selectedPlanTab[0].getAttribute('data-qa-tab')).toBe('Standard');
    }
}

export default new Resize();
