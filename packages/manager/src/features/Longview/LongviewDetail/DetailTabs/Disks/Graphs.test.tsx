import { cleanup } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import Graphs, { formatINodes, formatSpace, Props } from './Graphs';

afterEach(cleanup);

afterAll(async done => {
  done();
});

const baseProps: Props = {
  isSwap: false,
  childOf: false,
  timezone: 'GMT',
  sysInfoType: 'helloworld',
  iFree: [],
  isMounted: true,
  iTotal: [],
  total: [],
  free: [],
  diskLabel: 'helloworld',
  startTime: 0,
  endTime: 0
};

describe('Utility Functions', () => {
  it('formats INodes correctly', () => {
    const result = formatINodes([{ x: 2, y: 3 }], [{ x: 2, y: 5 }]);
    expect(result).toEqual([[2000, 2]]);
  });

  it('formats Space correctly', () => {
    const result = formatSpace([{ x: 2, y: 1000 }], [{ x: 2, y: 68719477736 }]);
    expect(result).toEqual([[2000, 64]]);
  });
});

describe('UI', () => {
  it('should render graphs normally', () => {
    const { queryByText } = renderWithTheme(<Graphs {...baseProps} />);

    expect(queryByText('Inodes')).toBeInTheDocument();
    expect(queryByText('Space')).toBeInTheDocument();
    expect(queryByText('Disk I/O')).toBeInTheDocument();
  });

  it('should render warning text for swap disks', () => {
    const { getByText, queryByText } = renderWithTheme(
      <Graphs {...baseProps} isSwap />
    );

    expect(queryByText('Inodes')).toBeNull();
    expect(queryByText('Space')).toBeNull();
    expect(queryByText('Disk I/O')).toBeNull();

    expect(getByText(/doesn't gather data on swap/)).toBeInTheDocument();
  });

  it('should not render Disk I/O graph for OpenVZ Configs', () => {
    const { getByText, queryByText } = renderWithTheme(
      <Graphs {...baseProps} sysInfoType="openvz" />
    );

    expect(getByText('Inodes')).toBeInTheDocument();
    expect(getByText('Space')).toBeInTheDocument();
    expect(queryByText('Disk I/O')).toBeNull();
  });

  it('should render warning text for ChildOf Disks', () => {
    const { getByText, queryByText } = renderWithTheme(
      <Graphs {...baseProps} childOf />
    );

    expect(queryByText('Inodes')).toBeNull();
    expect(queryByText('Space')).toBeNull();
    expect(queryByText('Disk I/O')).toBeNull();

    expect(
      getByText(/doesn't gather data on this type of device/)
    ).toBeInTheDocument();
  });

  it('should render warning text for unmounted disks', () => {
    const { getByText, queryByText } = renderWithTheme(
      <Graphs {...baseProps} isMounted={false} />
    );

    expect(queryByText('Inodes')).toBeNull();
    expect(queryByText('Space')).toBeNull();
    expect(queryByText('Disk I/O')).toBeNull();

    expect(getByText(/data on Disks that are not mounted/)).toBeInTheDocument();
  });
});
