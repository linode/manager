/**
 * @file Integration tests for Managed contacts.
 */

import { visitUrlWithManagedEnabled } from 'support/api/managed';
import {
  mockCreateContact,
  mockDeleteContact,
  mockGetContacts,
  mockUpdateContact,
} from 'support/intercepts/managed';
import { ui } from 'support/ui';
import { randomPhoneNumber, randomString } from 'support/util/random';

import { contactFactory } from 'src/factories/managed';

// Message that's shown when there are no Managed contacts.
const noContactsMessage = "You don't have any Contacts on your account.";

describe('Managed Contacts tab', () => {
  /**
   * - Confirms that Managed contacts are listed in the table.
   * - Confirms that a message is shown when there are no contacts.
   */
  it('shows a list of Managed contacts', () => {
    const contactIds = [1, 2, 3, 4, 5];
    const contacts = contactIds.map((id) => {
      return contactFactory.build({
        email: `contact-email-${id}@example.com`,
        id,
        name: `Managed Contact ${id}`,
      });
    });

    mockGetContacts(contacts).as('getContacts');
    visitUrlWithManagedEnabled('/managed/contacts');
    cy.wait('@getContacts');

    // Confirm that each contact name and email is listed.
    contactIds.forEach((id) => {
      cy.findByText(`Managed Contact ${id}`).should('be.visible');
      cy.findByText(`contact-email-${id}@example.com`).should('be.visible');
    });

    // Reset mocks and reload page.
    // Confirm that a message is shown when there are no Managed contacts.
    mockGetContacts([]).as('getContacts');
    visitUrlWithManagedEnabled('/managed/contacts');
    cy.wait('@getContacts');
    cy.findByText(noContactsMessage).should('be.visible');
  });

  /*
   * - Confirms UI flow for adding a Managed contact.
   * - Confirms that new contact is listed in the table.
   */
  it('can add Managed contacts', () => {
    const contactId = 1;
    const contactName = randomString(12);
    const contactPrimaryPhone = randomPhoneNumber();
    const contactEmail = `${contactName}@example.com`;
    const contact = contactFactory.build({
      email: contactEmail,
      id: contactId,
      name: contactName,
      phone: {
        primary: contactPrimaryPhone,
        secondary: null,
      },
    });

    mockGetContacts([]).as('getContacts');
    mockCreateContact(contact).as('createContact');
    visitUrlWithManagedEnabled('/managed/contacts');
    cy.wait('@getContacts');

    ui.button
      .findByTitle('Add Contact')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Fill out and submit Add Contact form.
    ui.drawer
      .findByTitle('Add Contact')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Name', { exact: false })
          .should('be.visible')
          .click();
        cy.focused().type(contactName);

        cy.findByLabelText('E-mail', { exact: false })
          .should('be.visible')
          .click();
        cy.focused().type(contactEmail);

        cy.findByLabelText('Primary Phone').should('be.visible').click();
        cy.focused().type(contactPrimaryPhone);

        ui.buttonGroup
          .findButtonByTitle('Add Contact')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that new contact is listed in the table.
    cy.wait('@createContact');
    cy.findByText(contactName)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(contactEmail).should('be.visible');
        cy.findByText(contactPrimaryPhone).should('be.visible');
      });
  });

  /*
   * - Confirms UI flow for updating a Managed contact.
   * - Confirms that contact info is updated in table.
   */
  it('can update Managed contacts', () => {
    const contactId = 1;
    const contactOldName = randomString();
    const contactOldEmail = `${contactOldName}@example.com`;
    const contactOldPrimaryPhone = randomPhoneNumber();
    const contactNewName = randomString();
    const contactNewEmail = `${contactNewName}@example.com`;
    const contactNewPrimaryPhone = randomPhoneNumber();

    const contact = contactFactory.build({
      email: contactOldEmail,
      id: contactId,
      name: contactOldName,
      phone: {
        primary: contactOldPrimaryPhone,
      },
    });

    const updatedContact = {
      ...contact,
      email: contactNewEmail,
      name: contactNewName,
      phone: {
        ...contact.phone,
        primary: contactNewPrimaryPhone,
      },
    };

    mockGetContacts([contact]).as('getContacts');
    mockUpdateContact(contactId, updatedContact).as('updateContact');
    visitUrlWithManagedEnabled('/managed/contacts');
    cy.wait('@getContacts');

    // Find contact and click "Edit".
    cy.findByText(contactOldName)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Edit')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Fill out and submit "Edit Contact" form.
    ui.drawer
      .findByTitle('Edit Contact')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Name', { exact: false })
          .should('be.visible')
          .click();
        cy.focused().clear();
        cy.focused().type(contactNewName);

        cy.findByLabelText('E-mail', { exact: false })
          .should('be.visible')
          .click();
        cy.focused().clear();
        cy.focused().type(contactNewEmail);

        cy.findByLabelText('Primary Phone').should('be.visible').click();
        cy.focused().clear();
        cy.focused().type(contactNewPrimaryPhone);

        ui.buttonGroup
          .findButtonByTitle('Save Changes')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that contact information is updated in table.
    cy.wait('@updateContact');
    cy.findByText(contactNewName)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(contactNewEmail).should('be.visible');
        cy.findByText(contactNewPrimaryPhone).should('be.visible');
      });
  });

  /*
   * - Confirms UI flow for deleting a Managed contact.
   * - Confirms that contact is removed from the table upon deletion.
   */
  it('can delete Managed contacts', () => {
    const contactId = 1;
    const contactName = randomString();
    const contact = contactFactory.build({
      id: contactId,
      name: contactName,
    });

    mockGetContacts([contact]).as('getContacts');
    mockDeleteContact(contactId).as('deleteContact');
    visitUrlWithManagedEnabled('/managed/contacts');
    cy.wait('@getContacts');

    // Find contact and click "Delete".
    cy.findByText(contactName)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Fill out and submit type-to-confirm.
    ui.dialog
      .findByTitle(`Delete Contact ${contactName}?`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Contact Name:').should('be.visible').click();
        cy.focused().type(contactName);

        ui.buttonGroup
          .findButtonByTitle('Delete Contact')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that toast notification is shown, and contact is removed from table.
    cy.wait('@deleteContact');
    ui.toast.assertMessage('Contact deleted successfully.');
    cy.findByText(noContactsMessage).should('be.visible');
  });
});
