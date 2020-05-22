import { shallow } from 'enzyme';
import {DateTime} from 'luxon'
import * as React from 'react';

import { DateTimeDisplay } from './DateTimeDisplay';

const APIDate = '2018-07-20T04:23:17';

const component = shallow(<DateTimeDisplay value={APIDate} />);

describe('DateTimeDisplay component', () => {
  describe('Non-humanized dates', () => {
    it('should be displayed in 24-hour ISO format', () => {
      component.setProps({ value: APIDate, humanizeCutoff: undefined });
      expect(
        component
          .find('WithStyles(ForwardRef(Typography))')
          .children()
          .text()
      ).toContain('2018-07-20 04:23:17');
    });
  });

  describe('Humanized dates', () => {
    it('should output humanized strings if the date is earlier than the cutoff', () => {
      component.setProps({
        value: DateTime.local().minus({minutes:5}),
        humanizeCutoff: 'day'
      });
      expect(
        component
          .find('WithStyles(ForwardRef(Typography))')
          .children()
          .text()
      ).toContain('5 minutes ago');
    });
    it('should output ISO strings if the date is older than the cutoff', () => {
      const almostOneWeek = DateTime.local().minus({days:6});
      component.setProps({
        value: almostOneWeek,
        humanizeCutoff: 'month'
      });
      expect(
        component
          .find('WithStyles(ForwardRef(Typography))')
          .children()
          .text()
      ).toContain('6 days ago');
      component.setProps({ humanizeCutoff: 'day' });
      expect(
        component
          .find('WithStyles(ForwardRef(Typography))')
          .children()
          .text()
      ).toContain(almostOneWeek.year);
    });
    it('should always output formatted text if humanizedCutoff is set to never', () => {
      const aLongTimeAgo = DateTime.local().minus({years:10});
      component.setProps({
        value: aLongTimeAgo,
        humanizeCutoff: 'never'
      });
      expect(
        component
          .find('WithStyles(ForwardRef(Typography))')
          .children()
          .text()
      ).toContain('10 years ago');
    });
  });
});
