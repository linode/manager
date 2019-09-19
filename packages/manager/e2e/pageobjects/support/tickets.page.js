const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import Page from '../page';

export class SupportTickets extends Page {
  get openTicketsTab() {
    return $('[data-qa-tab="Open Tickets"]');
  }
  get closedTicketsTab() {
    return $('[data-qa-tab="Closed Tickets"]');
  }
  get supportHeader() {
    return $(this.breadcrumbStaticText.selector);
  }
  get openTicketButton() {
    return this.addIcon('Open New Ticket');
  }

  get supportCreateDateHeader() {
    return $('[data-qa-support-date-header]');
  }
  get supportSubjectHeader() {
    return $('[data-qa-support-subject-header]');
  }
  get supportIdHeader() {
    return $('[data-qa-support-id-header]');
  }
  get supportEntityHeader() {
    return $('[data-qa-support-regarding-header]');
  }
  get supportUpdateHeader() {
    return $('[data-qa-support-updated-header]');
  }

  get supportTicket() {
    return $('[data-qa-support-ticket]');
  }
  get supportTickets() {
    return $$('[data-qa-support-ticket]');
  }
  get supportSubject() {
    return $('[data-qa-support-subject]');
  }
  get supportId() {
    return $('[data-qa-support-id]');
  }
  get supportEntity() {
    return $('[data-qa-support-entity]');
  }
  get supportCreateDate() {
    return $('[data-qa-support-date]');
  }
  get supportUpdateDate() {
    return $('[data-qa-support-updated]');
  }

  get ticketHelpText() {
    return $('[data-qa-support-ticket-helper-text]');
  }
  get ticketEntityType() {
    return $('[data-qa-ticket-entity-type]');
  }
  get ticketSummary() {
    return $('[data-qa-ticket-summary] input');
  }
  get ticketDescription() {
    return $('[data-qa-ticket-description] textarea');
  }

  get submit() {
    return $(this.submitButton.selector);
  }
  get cancel() {
    return $(this.cancelButton.selector);
  }

  baseElemsDisplay() {
    this.supportHeader.waitForDisplayed(constants.wait.normal);
    this.openTicketsTab.waitForDisplayed(constants.wait.normal);

    expect(this.closedTicketsTab.isDisplayed())
      .withContext(
        `"${this.closedTicketsTab.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.openTicketButton.isDisplayed())
      .withContext(
        `"${this.openTicketButton.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.supportCreateDateHeader.isDisplayed())
      .withContext(
        `"${this.supportCreateDateHeader.selector}" selector ${
          assertLog.displayed
        }`
      )
      .toBe(true);
    expect(this.supportSubjectHeader.isDisplayed())
      .withContext(
        `"${this.supportSubjectHeader.selector}" selector ${
          assertLog.displayed
        }`
      )
      .toBe(true);
    expect(this.supportIdHeader.isDisplayed())
      .withContext(
        `"${this.supportIdHeader.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.supportEntityHeader.isDisplayed())
      .withContext(
        `"${this.supportEntityHeader.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.supportUpdateHeader.isDisplayed())
      .withContext(
        `"${this.supportUpdateHeader.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
  }

  openCreateTicketDrawer() {
    this.openTicketButton.click();
    this.drawerTitle.waitForDisplayed(constants.wait.normal);
    this.ticketHelpText.waitForDisplayed(constants.wait.normal);

    expect(this.ticketEntityType.isDisplayed())
      .withContext(
        `"${this.ticketEntityType.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.ticketSummary.isDisplayed())
      .withContext(
        `"${this.ticketSummary.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.ticketDescription.isDisplayed())
      .withContext(
        `"${this.ticketDescription.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.submit.isDisplayed())
      .withContext(`"${this.submit.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.cancel.isDisplayed())
      .withContext(`"${this.cancel.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
  }

  openTicket(ticketObj) {
    this.ticketEntityType.click();
    $('[data-value]').waitForDisplayed(constants.wait.normal);
    $(`[data-value="${ticketObj.entity}"]`).click();
    $('[data-value]').waitForDisplayed(constants.wait.normal, true);

    this.ticketSummary.setValue(ticketObj.summary);
    this.ticketDescription.setValue(ticketObj.description);

    this.submit.click();
  }
}
export default new SupportTickets();
