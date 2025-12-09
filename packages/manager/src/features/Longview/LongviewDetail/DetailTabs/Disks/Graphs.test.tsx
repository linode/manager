import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Graphs } from './Graphs';

import type { GraphProps } from './Graphs';

const baseProps: GraphProps = {
  childOf: false,
  diskLabel: 'helloworld',
  endTime: 0,
  free: [],
  iFree: [],
  iTotal: [],
  isMounted: true,
  isSwap: false,
  loading: false,
  reads: [],
  startTime: 0,
  sysInfoType: 'helloworld',
  timezone: 'GMT',
  total: [],
  writes: [],
};

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

    expect(getByText(/gather space and inode data/im));
  });

  it('should not render Disk I/O graph for OpenVZ Configs', () => {
    const { getByText, queryByTestId } = renderWithTheme(
      <Graphs {...baseProps} sysInfoType="openvz" />
    );

    /* diskio graph doesn't show */
    expect(queryByTestId('space-graph')).toBeInTheDocument();
    expect(queryByTestId('inodes-graph')).toBeInTheDocument();
    expect(queryByTestId('diskio-graph')).toBeNull();

    expect(getByText(/gather Disk I\/O on OpenVZ Linodes/im));
  });

  it('should render warning text for ChildOf Disks', () => {
    const { getByText, queryByTestId } = renderWithTheme(
      <Graphs {...baseProps} childOf />
    );

    /* no graphs show */
    expect(queryByTestId('inodes-graph')).toBeNull();
    expect(queryByTestId('space-graph')).toBeNull();
    expect(queryByTestId('diskio-graph')).toBeNull();

    expect(getByText(/doesn't gather data on this type of device/im));
  });

  it('should render warning text for unmounted disks', () => {
    const { getByText, queryByTestId } = renderWithTheme(
      <Graphs {...baseProps} isMounted={false} />
    );

    /* only diskio graph shows */
    expect(queryByTestId('inodes-graph')).toBeNull();
    expect(queryByTestId('space-graph')).toBeNull();
    expect(queryByTestId('diskio-graph')).toBeInTheDocument();

    expect(getByText(/gather Space and Inode data on unmounted disks/im));
  });
});
