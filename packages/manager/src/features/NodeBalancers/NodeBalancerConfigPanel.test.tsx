import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  LEAST_CONNECTIONS_ALGORITHM_HELPER_TEXT,
  NodeBalancerConfigPanel,
  ROUND_ROBIN_ALGORITHM_HELPER_TEXT,
  SOURCE_ALGORITHM_HELPER_TEXT,
} from './NodeBalancerConfigPanel';

import type {
  NodeBalancerConfigNodeFields,
  NodeBalancerConfigPanelProps,
} from './types';

beforeEach(() => {
  vi.resetAllMocks();
});

const node: NodeBalancerConfigNodeFields = {
  address: '',
  label: '',
  mode: 'accept',
  modifyStatus: 'new',
  port: 80,
  weight: 100,
};

export const nbConfigPanelMockPropsForTest: NodeBalancerConfigPanelProps = {
  addNode: vi.fn(),
  algorithm: 'roundrobin',
  checkBody: '',
  checkPassive: true,
  checkPath: '',
  configIdx: 0,
  disabled: false,
  healthCheckAttempts: 2,
  healthCheckInterval: 5,
  healthCheckTimeout: 3,
  healthCheckType: 'none',
  nodes: [node],
  onAlgorithmChange: vi.fn(),
  onCheckBodyChange: vi.fn(),
  onCheckPassiveChange: vi.fn(),
  onCheckPathChange: vi.fn(),
  onDelete: vi.fn(),
  onHealthCheckAttemptsChange: vi.fn(),
  onHealthCheckIntervalChange: vi.fn(),
  onHealthCheckTimeoutChange: vi.fn(),
  onHealthCheckTypeChange: vi.fn(),
  onNodeAddressChange: vi.fn(),
  onNodeLabelChange: vi.fn(),
  onNodePortChange: vi.fn(),
  onNodeWeightChange: vi.fn(),
  onPortChange: vi.fn(),
  onPrivateKeyChange: vi.fn(),
  onProtocolChange: vi.fn(),
  onProxyProtocolChange: vi.fn(),
  onSave: vi.fn(),
  onSessionStickinessChange: vi.fn(),
  onSslCertificateChange: vi.fn(),
  port: 80,
  privateKey: '',
  protocol: 'http',
  proxyProtocol: 'none',
  removeNode: vi.fn(),
  sessionStickiness: 'table',
  sslCertificate: '',
};

const activeHealthChecks = ['Interval', 'Timeout', 'Attempts'];

describe('NodeBalancerConfigPanel', () => {
  it('renders the NodeBalancerConfigPanel', () => {
    const {
      getByLabelText,
      getByText,
      queryByLabelText,
      queryByTestId,
    } = renderWithTheme(
      <NodeBalancerConfigPanel {...nbConfigPanelMockPropsForTest} />
    );

    expect(getByLabelText('Protocol')).toBeVisible();
    expect(getByLabelText('Algorithm')).toBeVisible();
    expect(getByLabelText('Session Stickiness')).toBeVisible();
    expect(getByLabelText('Type')).toBeVisible();
    expect(getByLabelText('Label')).toBeVisible();
    expect(getByLabelText('IP Address')).toBeVisible();
    expect(getByLabelText('Weight')).toBeVisible();
    expect(getByLabelText('Port')).toBeVisible();
    expect(getByText('Listen on this port.')).toBeVisible();
    expect(getByText('Active Health Checks')).toBeVisible();
    expect(
      getByText(
        'Route subsequent requests from the client to the same backend.'
      )
    ).toBeVisible();
    expect(
      getByText(
        'Enable passive checks based on observing communication with back-end nodes.'
      )
    ).toBeVisible();
    expect(
      getByText(
        "Active health checks proactively check the health of back-end nodes. 'HTTP Valid Status' requires a 2xx or 3xx response from the backend node. 'HTTP Body Regex' uses a regex to match against an expected result body."
      )
    ).toBeVisible();
    expect(getByText('Add a Node')).toBeVisible();
    expect(getByText('Backend Nodes')).toBeVisible();

    activeHealthChecks.forEach((type) => {
      expect(queryByLabelText(type)).not.toBeInTheDocument();
    });
    expect(queryByTestId('ssl-certificate')).not.toBeInTheDocument();
    expect(queryByTestId('private-key')).not.toBeInTheDocument();
    expect(queryByTestId('http-path')).not.toBeInTheDocument();
    expect(queryByTestId('http-body')).not.toBeInTheDocument();
    expect(queryByLabelText('Proxy Protocol')).not.toBeInTheDocument();
  });

  it('renders form fields specific to the HTTPS protocol', () => {
    const { getByTestId, queryByLabelText } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        protocol="https"
      />
    );

    expect(getByTestId('ssl-certificate')).toBeVisible();
    expect(getByTestId('private-key')).toBeVisible();
    expect(queryByLabelText('Proxy Protocol')).not.toBeInTheDocument();
  });

  it('renders form fields specific to the TCP protocol', () => {
    const { getByLabelText, queryByTestId } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        protocol="tcp"
      />
    );

    expect(getByLabelText('Proxy Protocol')).toBeVisible();
    expect(queryByTestId('ssl-certificate')).not.toBeInTheDocument();
    expect(queryByTestId('private-key')).not.toBeInTheDocument();
  });

  it('renders fields specific to the Active Health Check type of TCP Connection', () => {
    const { getByLabelText, queryByTestId } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        healthCheckType="connection"
      />
    );

    activeHealthChecks.forEach((type) => {
      expect(getByLabelText(type)).toBeVisible();
    });
    expect(queryByTestId('http-path')).not.toBeInTheDocument();
    expect(queryByTestId('http-body')).not.toBeInTheDocument();
  });

  it('renders fields specific to the Active Health Check type of HTTP Status', () => {
    const { getByLabelText, getByTestId, queryByTestId } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        healthCheckType="http"
      />
    );

    activeHealthChecks.forEach((type) => {
      expect(getByLabelText(type)).toBeVisible();
    });
    expect(getByTestId('http-path')).toBeVisible();
    expect(queryByTestId('http-body')).not.toBeInTheDocument();
  });

  it('renders fields specific to the Active Health Check type of HTTP Body', () => {
    const { getByLabelText, getByTestId } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        healthCheckType="http_body"
      />
    );

    activeHealthChecks.forEach((type) => {
      expect(getByLabelText(type)).toBeVisible();
    });
    expect(getByTestId('http-path')).toBeVisible();
    expect(getByTestId('http-body')).toBeVisible();
  });

  it('renders the relevant helper text for the Round Robin algorithm', () => {
    const { getByText, queryByText } = renderWithTheme(
      <NodeBalancerConfigPanel {...nbConfigPanelMockPropsForTest} />
    );

    expect(getByText(ROUND_ROBIN_ALGORITHM_HELPER_TEXT)).toBeVisible();
    expect(
      queryByText(LEAST_CONNECTIONS_ALGORITHM_HELPER_TEXT)
    ).not.toBeInTheDocument();
    expect(queryByText(SOURCE_ALGORITHM_HELPER_TEXT)).not.toBeInTheDocument();
  });

  it('renders the relevant helper text for the Least Connections algorithm', () => {
    const { getByText, queryByText } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        algorithm={'leastconn'}
      />
    );

    expect(getByText(LEAST_CONNECTIONS_ALGORITHM_HELPER_TEXT)).toBeVisible();
    expect(queryByText(SOURCE_ALGORITHM_HELPER_TEXT)).not.toBeInTheDocument();
    expect(
      queryByText(ROUND_ROBIN_ALGORITHM_HELPER_TEXT)
    ).not.toBeInTheDocument();
  });

  it('renders the relevant helper text for the Source algorithm', () => {
    const { getByText, queryByText } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        algorithm={'source'}
      />
    );

    expect(getByText(SOURCE_ALGORITHM_HELPER_TEXT)).toBeVisible();
    expect(
      queryByText(ROUND_ROBIN_ALGORITHM_HELPER_TEXT)
    ).not.toBeInTheDocument();
    expect(
      queryByText(LEAST_CONNECTIONS_ALGORITHM_HELPER_TEXT)
    ).not.toBeInTheDocument();
  });

  it('adds another backend node', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerConfigPanel {...nbConfigPanelMockPropsForTest} />
    );

    const addNodeButton = getByText('Add a Node');
    fireEvent.click(addNodeButton);
    expect(nbConfigPanelMockPropsForTest.addNode).toHaveBeenCalled();
  });

  it('cannot remove a backend node if there is only one node', () => {
    const { queryByText } = renderWithTheme(
      <NodeBalancerConfigPanel {...nbConfigPanelMockPropsForTest} />
    );

    expect(queryByText('Remove')).not.toBeInTheDocument();
  });

  it('removes a backend node', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        nodes={[{ ...node }, node]}
      />
    );

    const removeNodeButton = getByText('Remove');
    fireEvent.click(removeNodeButton);
    expect(nbConfigPanelMockPropsForTest.removeNode).toHaveBeenCalled();
  });

  it('deletes the configuration panel', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerConfigPanel {...nbConfigPanelMockPropsForTest} />
    );

    const deleteConfigButton = getByText('Delete');
    fireEvent.click(deleteConfigButton);
    expect(nbConfigPanelMockPropsForTest.onDelete).toHaveBeenCalled();
  });

  it('saves the input after editing the configuration', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        forEdit={true}
      />
    );

    const editConfigButton = getByText('Save');
    fireEvent.click(editConfigButton);
    expect(nbConfigPanelMockPropsForTest.onSave).toHaveBeenCalled();
  });
});
