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
        }}
        {...dummyProps}
      />
    </MemoryRouter>,
  );

  it('renders without error', () => {
    expect(component.find('LinodeCreate')).toHaveLength(1);
  });
});

/*
@TODO figure out a way to dive into the LinodeCreate

Currently, LinodeCreate has functions, such as updateStateFromQuerystring()
that relies on location.search so being able to mount the component while
being able to pass down the Router components would be huge
*/
