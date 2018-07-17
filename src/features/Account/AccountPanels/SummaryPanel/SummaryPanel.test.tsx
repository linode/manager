import { shallow } from 'enzyme';
import * as React from 'react';

import { SummaryPanel } from './SummaryPanel';

describe('SummaryPanel', () => {
  const dummyProps = {
    classes: {
      root: '',
      expired: '',
    },
    company: '',
    name: '',
    email: '',
    address1: '',
    address2: '',
    cc_lastfour: '',
    phone: '',
    city: '',
    state: '',
    zip: '',
  }

  const componentExpiredCC = shallow(
    <SummaryPanel
      {...dummyProps}
      cc_exp='02/2012'
    />
  );

  const componentValidCC = shallow(
    <SummaryPanel
      {...dummyProps}
      cc_exp='02/2020'
    />
  );

  it('should first render a headline of "Summary"', () => {
    expect(componentExpiredCC.find('WithStyles(Typography)[variant="headline"]')
      .first().children().text()).toBe('Summary');
  });

  it('should render "Expired" text next to the CC expiration if has an old date', () => {
    expect(componentExpiredCC.find('span')
      .filterWhere((n) => {
        return n.childAt(0).text() === 'Expired'
      })).toHaveLength(1);
  });

  it('should not render "Expired" text next to the CC expiration if has an future date', () => {
    expect(componentValidCC.find('span')
      .filterWhere((n) => {
        return n.childAt(0).text() === 'Expired'
      })).toHaveLength(0);
  });
});