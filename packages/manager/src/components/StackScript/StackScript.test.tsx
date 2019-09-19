import { shallow } from 'enzyme';
import * as React from 'react';

import { _StackScript } from './StackScript';

describe('StackScript', () => {
  it('should render script code', () => {
    const component = shallow(
      <_StackScript
        imagesData={{}}
        imagesLoading={false}
        data={{
          id: 1,
          label: 'MySQL',
          images: [],
          user_defined_fields: [],
          is_public: true,
          user_gravatar_id: 'ead4da00f4fe6a4bd0b4f11a510c031d',
          username: 'Linode',
          deployments_total: 2,
          deployments_active: 1,
          description: 'Some test script for fun',
          script: 'sudo rm -rf /etc',
          created: '2010-12-31T23:59:58',
          updated: '2010-12-31T23:59:59',
          rev_note: 'Initial import.',
          ordinal: 1, // default value
          logo_url: '' // default value
        }}
        classes={{
          root: '',
          deployments: '',
          author: '',
          description: '',
          scriptHeading: '',
          descriptionText: '',
          deploymentSection: '',
          dateTimeDisplay: '',
          compatibleImages: '',
          divider: ''
        }}
      />
    );

    expect(component.find('WithStyles(ScriptCode)')).toHaveLength(1);
  });
});
