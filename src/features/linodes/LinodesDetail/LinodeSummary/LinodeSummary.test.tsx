import { shallow } from 'enzyme';
import * as React from 'react';
import { linodes } from 'src/__data__/linodes';

import { LinodeSummary } from './LinodeSummary';

describe('LinodeSummary', () => {
  const wrapper = shallow(
    <LinodeSummary
      linodeCreated="2018-11-01T00:00:00"
      linodeId={1234}
      linodeData={linodes[0]}
      classes={{
        main: '',
        sidebar: '',
        headerWrapper: '',
        chart: '',
        leftLegend: '',
        bottomLegend: '',
        graphControls: '',
        graphTitle: '',
        graphSelectTitle: '',
        totalTraffic: ''
      }}
      typesData={[]}
    />
  );

  it('should include "Last 24 Hours" as the first option', () => {
    expect(
      wrapper
        .find('WithStyles(MenuItem)')
        .at(0)
        .children()
        .text()
    ).toBe('Last 24 Hours');
    expect(
      wrapper
        .find('WithStyles(MenuItem)')
        .at(0)
        .props().value
    ).toBe('24');
  });

  it('should include "Last 30 Days" as the second option', () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const paddedCurrentMonth = currentMonth.toString().padStart(2, '0');

    expect(
      wrapper
        .find('WithStyles(MenuItem)')
        .at(1)
        .children()
        .text()
    ).toBe('Last 30 Days');
    expect(
      wrapper
        .find('WithStyles(MenuItem)')
        .at(1)
        .props().value
    ).toBe(`${currentYear} ${paddedCurrentMonth}`);
  });
});
