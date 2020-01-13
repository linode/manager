import { shallow } from 'enzyme';
import * as React from 'react';
import { CombinedProps, RestoreToLinodeDrawer } from './RestoreToLinodeDrawer';

describe('RestoreToLinodeDrawer', () => {
  const props: CombinedProps = {
    open: true,
    linodeID: 1234,
    linodeRegion: 'us-east',
    backupCreated: '12 hours ago',
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    linodesData: [],
    linodesLastUpdated: 0,
    linodesLoading: false,
    getLinodes: jest.fn(),
    linodesResults: []
  };

  const wrapper = shallow<RestoreToLinodeDrawer>(
    <RestoreToLinodeDrawer {...props} />
  );

  it('renders without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });
});
