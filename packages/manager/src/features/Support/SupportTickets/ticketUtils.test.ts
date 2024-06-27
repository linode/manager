import { SMTP_FIELD_NAME_TO_LABEL_MAP } from './constants';
import { formatDescription } from './ticketUtils';

import type { SupportTicketFormFields } from './SupportTicketDialog';
import type { SMTPCustomFields } from './SupportTicketSMTPFields';

const mockSupportTicketFormFields: SupportTicketFormFields = {
  description: 'Mock description.',
  entityId: '',
  entityInputValue: '',
  entityType: 'general',
  selectedSeverity: undefined,
  summary: 'My Summary',
  ticketType: 'general',
};

const mockSupportTicketCustomFormFields: SMTPCustomFields = {
  companyName: undefined,
  customerName: 'Jane Doe',
  emailDomains: 'test@akamai.com',
  publicInfo: 'public info',
  useCase: 'use case',
};

describe('formatDescription', () => {
  it('returns the original description if there are no custom fields in the payload', () => {
    expect(formatDescription(mockSupportTicketFormFields, 'general')).toEqual(
      mockSupportTicketFormFields.description
    );
  });

  it('returns the formatted description if there are custom fields in the payload', () => {
    const expectedFormattedDescription = `**${SMTP_FIELD_NAME_TO_LABEL_MAP['companyName']}**\nNo response\n\n\
**${SMTP_FIELD_NAME_TO_LABEL_MAP['customerName']}**\n${mockSupportTicketCustomFormFields.customerName}\n\n\
**${SMTP_FIELD_NAME_TO_LABEL_MAP['emailDomains']}**\n${mockSupportTicketCustomFormFields.emailDomains}\n\n\
**${SMTP_FIELD_NAME_TO_LABEL_MAP['publicInfo']}**\n${mockSupportTicketCustomFormFields.publicInfo}\n\n\
**${SMTP_FIELD_NAME_TO_LABEL_MAP['useCase']}**\n${mockSupportTicketCustomFormFields.useCase}`;

    expect(
      formatDescription(
        {
          ...mockSupportTicketFormFields,
          ...mockSupportTicketCustomFormFields,
        },
        'smtp'
      )
    ).toEqual(expectedFormattedDescription);
  });
});
