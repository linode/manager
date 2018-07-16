import { shallow } from 'enzyme';
import * as React from 'react';

import { SummaryPanel } from './SummaryPanel';

describe('SummaryPanel', () => {
  const component = shallow(
    <SummaryPanel
      classes={{
        root: '',
      }}
      company=''
      name=''
      email=''
      address1=''
      address2=''
      cc_exp=''
      cc_lastfour=''
      phone=''
    />
  )
  it('should first render a headline of "Summary"', () => {
    expect(component.find('WithStyles(Typography)[variant="headline"]')
      .first().children().text()).toBe('Summary');
  });
});