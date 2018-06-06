import * as React from 'react';
import { shallow } from 'enzyme';
import { LinodeCreate } from './LinodesCreate';

import { images, ExtendedType, LinodesWithBackups } from 'src/__data__/index';

import { RouteComponentProps, MemoryRouter } from 'react-router';

const dummyProps = {
  types: ExtendedType,
  regions: [],
  images: {
    response: images,
  },
  linodes: {
    response: LinodesWithBackups,
  },
};

describe('FromImageContent', () => {
  const component = shallow(
    <MemoryRouter initialEntries={['/']}>
      <LinodeCreate
        {...({} as RouteComponentProps<any>)}
        classes={{
          root: '',
          main: '',
          sidebar: '',
        }}
        {...dummyProps}
      />
    </MemoryRouter>,
  );

  it('renders without error', () => {
    console.log(component.debug());
    expect(component.find('LinodeCreate')).toHaveLength(1);
  });
});
