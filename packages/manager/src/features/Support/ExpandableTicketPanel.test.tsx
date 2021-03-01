import { screen } from '@testing-library/react';
import { DateTime } from 'luxon';
import * as React from 'react';
import { ISO_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import { supportReplyFactory } from 'src/factories/support';
import { renderWithTheme } from 'src/utilities/testHelpers';
import ExpandableTicketPanel, { Props } from './ExpandableTicketPanel';
import { shouldRenderHively } from './Hively';

const recent = DateTime.utc()
  .minus({ days: 6 })
  .toFormat(ISO_DATETIME_NO_TZ_FORMAT);
const old = DateTime.utc()
  .minus({ months: 3 })
  .toFormat(ISO_DATETIME_NO_TZ_FORMAT);
const user = 'Linode';

const reply = supportReplyFactory.build();

const props: Props = {
  reply: { ...reply, gravatarUrl: '' },
  isCurrentUser: false,
};

describe('Expandable ticket panel', () => {
  describe('Panel component', () => {
    it('should display "Linode Expert" if the ticket or reply has from_linode', () => {
      renderWithTheme(<ExpandableTicketPanel {...props} />);
      expect(screen.getByText('Linode Expert')).toBeInTheDocument();
    });

    it('should not display "Linode Expert" if the reply is from the Linode account', () => {
      const replyFromLinode = {
        ...supportReplyFactory.build({
          created_by: 'Linode',
          from_linode: true,
        }),
        gravatarUrl: '',
      };
      renderWithTheme(
        <ExpandableTicketPanel {...props} reply={replyFromLinode} />
      );
      expect(screen.queryByText('Linode Expert')).toBeNull();
    });

    it('should not display "Linode Expert" if the reply is from the Linode Trust & Safety account', () => {
      const replyFromLinode = {
        ...supportReplyFactory.build({
          created_by: 'Linode Trust & Safety',
          from_linode: true,
        }),
        gravatarUrl: '',
      };
      renderWithTheme(
        <ExpandableTicketPanel {...props} reply={replyFromLinode} />
      );
      expect(screen.queryByText('Linode Expert')).toBeNull();
    });
  });
  describe('shouldRenderHively function', () => {
    it('should return true if an improperly formatted date is passed', () => {
      expect(shouldRenderHively(true, 'blah')).toBeTruthy();
    });
    it('should return true if the date is now', () => {
      expect(
        shouldRenderHively(
          true,
          DateTime.utc().toFormat(ISO_DATETIME_NO_TZ_FORMAT)
        )
      ).toBeTruthy();
    });
    it('should return true if the date is within the past 7 days', () => {
      expect(shouldRenderHively(true, recent)).toBeTruthy();
    });
    it('should return false for dates older than 7 days', () => {
      expect(shouldRenderHively(true, old)).toBeFalsy();
    });
    it('should return false if the fromLinode parameter is false', () => {
      expect(shouldRenderHively(false, recent)).toBeFalsy();
    });
    it('should return false if the user is Linode', () => {
      expect(shouldRenderHively(false, recent, user)).toBeFalsy();
    });
    it('should return false if the user is Linode Trust & Safety', () => {
      expect(
        shouldRenderHively(false, recent, 'Linode Trust & Safety')
      ).toBeFalsy();
    });
  });
});
