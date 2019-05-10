import { shallow } from 'enzyme';
import * as React from 'react';
import { linodes } from 'src/__data__/linodes';

import { LinodeSummary } from './LinodeSummary';

describe('LinodeSummary', () => {
  const wrapper = shallow(
    <LinodeSummary
      mostRecentEventTime=""
      events={[]}
      inProgressEvents={[]}
      linodeCreated="2018-11-01T00:00:00"
      linodeId={1234}
      linodeData={linodes[0]}
      timezone={'America/Los_Angeles'}
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
        totalTraffic: '',
        chartSelect: ''
      }}
      typesData={[]}
    />
  );

  it('should have a select menu for the graphs', () => {
    expect(wrapper.find('[data-qa-item="chartRange"]')).toHaveLength(1);
  });
});
