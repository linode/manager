const { assertLog } = require('../../utils/assertionLog');

import Page from '../page';

class Resize extends Page {
  get title() {
    return this.pageTitle;
  }
  get description() {
    return $('[data-qa-description]');
  }
  get currentHeader() {
    return $('[data-qa-current-header]');
  }
  get currentSelection() {
    return $('[data-qa-current-container] [data-qa-selection-card]');
  }
  get tierTabs() {
    return $$('[data-qa-tab]');
  }
  get planCards() {
    return $$('[data-qa-tp="Linode Plan"] [data-qa-selection-card]');
  }
  get submit() {
    return this.submitButton;
  }

  landingElemsDisplay() {
    const subHeader = 'Current Plan';
    const selectedPlanTab = this.tierTabs.filter(
      tier =>
        tier.getAttribute('aria-selected').includes('true') &&
        !tier.getText().includes('Resize')
    );
    const checkedCards = $$('[data-qa-checked] > svg');

    expect(this.title.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.title.selector}" selector`
      )
      .toBe('Resize');
    expect(this.description.isDisplayed())
      .withContext(
        `"${this.description.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.currentHeader.getText())
      .withContext(
        `${assertLog.incorrectText} for "${
          this.currentHeader.selector
        }" selector`
      )
      .toBe(subHeader);
    expect(this.currentSelection.isDisplayed())
      .withContext(
        `"${this.currentSelection.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.submit.isDisplayed())
      .withContext(`"${this.submit.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.planCards.length)
      .withContext(
        `${assertLog.incorrectNum} for "${this.planCards.selector}" selector`
      )
      .toBeGreaterThan(0);
    expect(checkedCards.length)
      .withContext(
        `${assertLog.incorrectNum} for "${this.checkedCards.selector}" selector`
      )
      .toBe(0);
    expect(selectedPlanTab[0].getAttribute('data-qa-tab'))
      .withContext(
        `${assertLog.incorrectAttr} for "${
          this.selectedPlanTab.selector
        }" selector`
      )
      .toBe('Standard');
  }
}

export default new Resize();
