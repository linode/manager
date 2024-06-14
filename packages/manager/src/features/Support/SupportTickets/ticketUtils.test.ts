import { formatDescription } from './ticketUtils';

import type { EntityType, TicketType } from './SupportTicketDialog';

const mockSupportTicketFormFields = {
  description: 'Mock description.',
  entityId: '',
  entityInputValue: '',
  entityType: 'general' as EntityType,
  files: [],
  selectedSeverity: undefined,
  summary: 'My Summary',
  ticketType: 'general' as TicketType,
};

const mockSupportTicketCustomFormFields = {
  companyName: undefined,
  customerName: 'Jane Doe',
};

describe('formatDescription', () => {
  it('returns the original description if there are no custom fields in the payload', () => {
    expect(formatDescription(mockSupportTicketFormFields, 'general')).toEqual(
      mockSupportTicketFormFields.description
    );
  });

  it('returns the formatted description if there are custom fields in the payload', () => {
    const expectedFormattedDescription = `**Business or company name**\nNo response\n\n**First and last name**\nJane Doe`;

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
