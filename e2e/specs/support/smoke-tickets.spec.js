const { constants } = require('../../constants');

import SupportTickets from '../../pageobjects/support/tickets.page.js';

describe('Support - Tickets Suite', () => {
    beforeAll(() => {
        browser.url(constants.routes.support.tickets);
    });

    it('should display ticket page base elements', () => {
        SupportTickets.baseElemsDisplay();
    });

    it('should display the ticket create drawer', () => {
        SupportTickets.openCreateTicketDrawer();
    });
});
