const { constants } = require('../../constants');

import Page from '../page';

export class SupportTickets extends Page {
    get openTicketsTab() { return $('[data-qa-tab="Open Tickets"]'); }
    get closedTicketsTab() { return $('[data-qa-tab="Closed Tickets"]'); }
    get supportHeader() { return $(this.breadcrumbStaticText.selector); }
    get openTicketButton() { return this.addIcon('Open New Ticket'); }

    get supportCreateDateHeader() { return $('[data-qa-support-date-header]'); }
    get supportSubjectHeader() { return $('[data-qa-support-subject-header]'); }
    get supportIdHeader() { return $('[data-qa-support-id-header]'); }
    get supportEntityHeader() { return $('[data-qa-support-regarding-header]'); }
    get supportUpdateHeader() { return $('[data-qa-support-updated-header]'); }

    get supportTicket() { return $('[data-qa-support-ticket]'); }
    get supportTickets() { return $$('[data-qa-support-ticket]'); }
    get supportSubject() { return $('[data-qa-support-subject]'); }
    get supportId() { return $('[data-qa-support-id]'); }
    get supportEntity() { return $('[data-qa-support-entity]'); }
    get supportCreateDate() { return $('[data-qa-support-date]'); }
    get supportUpdateDate() { return $('[data-qa-support-updated]'); }

    get ticketHelpText() { return $('[data-qa-support-ticket-helper-text]'); }
    get ticketEntityType() { return $('[data-qa-ticket-entity-type]'); }
    get ticketSummary() { return $('[data-qa-ticket-summary] input'); }
    get ticketDescription() { return $('[data-qa-ticket-description] textarea'); }

    get submit() { return $(this.submitButton.selector); }
    get cancel() { return $(this.cancelButton.selector); }

    baseElemsDisplay() {
        this.supportHeader.waitForVisible(constants.wait.normal);
        this.openTicketsTab.waitForVisible(constants.wait.normal);

        expect(this.closedTicketsTab.isVisible()).toBe(true);
        expect(this.openTicketButton.isVisible()).toBe(true);
        expect(this.supportCreateDateHeader.isVisible()).toBe(true);
        expect(this.supportSubjectHeader.isVisible()).toBe(true);
        expect(this.supportIdHeader.isVisible()).toBe(true);
        expect(this.supportEntityHeader.isVisible()).toBe(true);
        expect(this.supportUpdateHeader.isVisible()).toBe(true);
    }

    openCreateTicketDrawer() {
        this.openTicketButton.click();
        this.drawerTitle.waitForVisible(constants.wait.normal);
        this.ticketHelpText.waitForVisible(constants.wait.normal);

        expect(this.ticketEntityType.isVisible()).toBe(true);
        expect(this.ticketSummary.isVisible()).toBe(true);
        expect(this.ticketDescription.isVisible()).toBe(true);
        expect(this.submit.isVisible()).toBe(true);
        expect(this.cancel.isVisible()).toBe(true);
    }

    openTicket(ticketObj) {
        this.ticketEntityType.click();
        browser.waitForVisible('[data-value]', constants.wait.normal);
        browser.click(`[data-value="${ticketObj.entity}"]`);
        browser.waitForVisible('[data-value]', constants.wait.normal, true);

        this.ticketSummary.setValue(ticketObj.summary);
        this.ticketDescription.setValue(ticketObj.description);

        this.submit.click();
    }
}
export default new SupportTickets();
