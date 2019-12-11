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
    const { queryByTestId } = renderWithTheme(<Graphs {...baseProps} />);

    expect(queryByTestId('inodes-graph')).toBeInTheDocument();
    expect(queryByTestId('space-graph')).toBeInTheDocument();
    expect(queryByTestId('diskio-graph')).toBeInTheDocument();
  });

  it('should render warning text for swap disks', () => {
    const { getByText, queryByTestId } = renderWithTheme(
      <Graphs {...baseProps} isSwap />
    );

    /* only diskio graph shows */
    expect(queryByTestId('inodes-graph')).toBeNull();
    expect(queryByTestId('space-graph')).toBeNull();
    expect(queryByTestId('diskio-graph')).toBeInTheDocument();

    expect(getByText(/gather space and inode data/gim));
  });

  it('should not render Disk I/O graph for OpenVZ Configs', () => {
    const { getByText, queryByTestId } = renderWithTheme(
      <Graphs {...baseProps} sysInfoType="openvz" />
    );

    /* diskio graph doesn't show */
    expect(queryByTestId('space-graph')).toBeInTheDocument();
    expect(queryByTestId('inodes-graph')).toBeInTheDocument();
    expect(queryByTestId('diskio-graph')).toBeNull();

    expect(getByText(/gather Disk I\/O on OpenVZ Linodes/gim));
  });

  it('should render warning text for ChildOf Disks', () => {
    const { getByText, queryByTestId } = renderWithTheme(
      <Graphs {...baseProps} childOf />
    );

    /* no graphs show */
    expect(queryByTestId('inodes-graph')).toBeNull();
    expect(queryByTestId('space-graph')).toBeNull();
    expect(queryByTestId('diskio-graph')).toBeNull();

    expect(getByText(/doesn't gather data on this type of device/gim));
  });

  it('should render warning text for unmounted disks', () => {
    const { getByText, queryByTestId } = renderWithTheme(
      <Graphs {...baseProps} isMounted={false} />
    );

    /* only diskio graph shows */
    expect(queryByTestId('inodes-graph')).toBeNull();
    expect(queryByTestId('space-graph')).toBeNull();
    expect(queryByTestId('diskio-graph')).toBeInTheDocument();

    expect(getByText(/gather Space and Inode data on unmounted disks/gim));
  });
});
