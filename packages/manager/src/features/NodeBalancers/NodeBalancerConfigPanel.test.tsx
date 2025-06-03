import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerConfigPanel } from './NodeBalancerConfigPanel';

import type {
  NodeBalancerConfigNodeFields,
  NodeBalancerConfigPanelProps,
} from './types';

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn().mockReturnValue({ id: undefined }),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

const node: NodeBalancerConfigNodeFields = {
  address: '',
  label: '',
  mode: 'accept',
  modifyStatus: 'new',
  port: '80',
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
  onUdpCheckPortChange: vi.fn(),
  port: 80,
  privateKey: '',
  protocol: 'http',
  proxyProtocol: 'none',
  removeNode: vi.fn(),
  sessionStickiness: 'table',
  sslCertificate: '',
  udpCheckPort: 80,
};

const activeHealthChecksFormInputs = ['Interval', 'Timeout', 'Attempts'];

const activeHealthChecksHelperText = [
  'Seconds (2-3600) between health check probes.',
  'Seconds to wait (1-30) before considering the probe a failure. Must be less than Interval.',
  'Number of failed probes (1-30) before taking a node out of rotation.',
];

const sslCertificate = 'ssl-certificate';
const privateKey = 'private-key';
const proxyProtocol = 'Proxy Protocol';

describe('NodeBalancerConfigPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useParams.mockReturnValue({ id: undefined });
  });
  it('renders the NodeBalancerConfigPanel', () => {
    const {
      getByLabelText,
      getByText,
      queryByLabelText,
      queryByTestId,
      queryByText,
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
    expect(
      getByText(
        'The unique inbound port that this NodeBalancer configuration will listen on.'
      )
    ).toBeVisible();
    expect(getByText('Active Health Checks')).toBeVisible();
    expect(
      getByText(
        'Routes subsequent requests from the client to the same backend.'
      )
    ).toBeVisible();
    expect(
      getByText(
        "When enabled, the NodeBalancer monitors requests to backends. If a request times out, returns a 5xx response (except 501/505), or fails to connect, the backend is marked 'down' and removed from rotation."
      )
    ).toBeVisible();
    expect(
      getByText(
        "Monitors backends to ensure they’re 'up' and handling requests."
      )
    ).toBeVisible();
    expect(getByText('Add a Node')).toBeVisible();
    expect(getByText('Backend Nodes')).toBeVisible();

    activeHealthChecksFormInputs.forEach((formLabel) => {
      expect(queryByLabelText(formLabel)).not.toBeInTheDocument();
    });
    activeHealthChecksHelperText.forEach((helperText) => {
      expect(queryByText(helperText)).not.toBeInTheDocument();
    });
    expect(queryByTestId(sslCertificate)).not.toBeInTheDocument();
    expect(queryByTestId(privateKey)).not.toBeInTheDocument();
    expect(queryByTestId('http-path')).not.toBeInTheDocument();
    expect(queryByTestId('http-body')).not.toBeInTheDocument();
    expect(queryByLabelText(proxyProtocol)).not.toBeInTheDocument();
  });

  it('renders form fields specific to the HTTPS protocol', () => {
    const { getByTestId, queryByLabelText } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        protocol="https"
      />
    );

    expect(getByTestId(sslCertificate)).toBeVisible();
    expect(getByTestId(privateKey)).toBeVisible();
    expect(queryByLabelText(proxyProtocol)).not.toBeInTheDocument();
  });

  it('renders form fields specific to the TCP protocol', () => {
    const { getByLabelText, queryByTestId } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        protocol="tcp"
      />
    );

    expect(getByLabelText(proxyProtocol)).toBeVisible();
    expect(queryByTestId(sslCertificate)).not.toBeInTheDocument();
    expect(queryByTestId(privateKey)).not.toBeInTheDocument();
  });

  it('renders fields specific to the Active Health Check type of TCP Connection', () => {
    const { getByLabelText, getByText, queryByTestId } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        healthCheckType="connection"
      />
    );

    activeHealthChecksFormInputs.forEach((formLabel) => {
      expect(getByLabelText(formLabel)).toBeVisible();
    });
    activeHealthChecksHelperText.forEach((helperText) => {
      expect(getByText(helperText)).toBeVisible();
    });
    expect(queryByTestId('http-path')).not.toBeInTheDocument();
    expect(queryByTestId('http-body')).not.toBeInTheDocument();
  });

  it('renders fields specific to the Active Health Check type of HTTP Status', () => {
    const { getByLabelText, getByTestId, getByText, queryByTestId } =
      renderWithTheme(
        <NodeBalancerConfigPanel
          {...nbConfigPanelMockPropsForTest}
          healthCheckType="http"
        />
      );

    activeHealthChecksFormInputs.forEach((formLabel) => {
      expect(getByLabelText(formLabel)).toBeVisible();
    });
    activeHealthChecksHelperText.forEach((helperText) => {
      expect(getByText(helperText)).toBeVisible();
    });
    expect(getByTestId('http-path')).toBeVisible();
    expect(queryByTestId('http-body')).not.toBeInTheDocument();
  });

  it('renders fields specific to the Active Health Check type of HTTP Body', () => {
    const { getByLabelText, getByTestId, getByText } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        healthCheckType="http_body"
      />
    );

    activeHealthChecksFormInputs.forEach((formLabel) => {
      expect(getByLabelText(formLabel)).toBeVisible();
    });
    activeHealthChecksHelperText.forEach((helperText) => {
      expect(getByText(helperText)).toBeVisible();
    });
    expect(getByTestId('http-path')).toBeVisible();
    expect(getByTestId('http-body')).toBeVisible();
  });

  it('adds another backend node', async () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerConfigPanel {...nbConfigPanelMockPropsForTest} />
    );

    const addNodeButton = getByText('Add a Node');
    await userEvent.click(addNodeButton);
    expect(nbConfigPanelMockPropsForTest.addNode).toHaveBeenCalled();
  });

  it('cannot remove a backend node if there is only one node', () => {
    const { queryByText } = renderWithTheme(
      <NodeBalancerConfigPanel {...nbConfigPanelMockPropsForTest} />
    );

    expect(queryByText('Remove')).not.toBeInTheDocument();
  });

  it('removes a backend node', async () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        nodes={[{ ...node }, node]}
      />
    );

    const removeNodeButton = getByText('Remove');
    await userEvent.click(removeNodeButton);
    expect(nbConfigPanelMockPropsForTest.removeNode).toHaveBeenCalled();
  });

  it('deletes the configuration panel', async () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerConfigPanel {...nbConfigPanelMockPropsForTest} />
    );

    const deleteConfigButton = getByText('Delete');
    await userEvent.click(deleteConfigButton);
    expect(nbConfigPanelMockPropsForTest.onDelete).toHaveBeenCalled();
  });

  it('saves the input after editing the configuration', async () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        forEdit={true}
      />
    );

    const editConfigButton = getByText('Save');
    await userEvent.click(editConfigButton);
    expect(nbConfigPanelMockPropsForTest.onSave).toHaveBeenCalled();
  });

  it('does not show the passive checks option for the UDP protocol', () => {
    const { queryByText } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        protocol="udp"
      />
    );

    expect(queryByText('Passive Checks')).not.toBeInTheDocument();
  });

  it('shows correct algorithm options for the UDP protocol', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        protocol="udp"
      />
    );

    const algorithmField = getByLabelText('Algorithm');

    expect(algorithmField).toBeVisible();

    await userEvent.click(algorithmField);

    for (const algorithm of ['Round Robin', 'Least Connections', 'Ring Hash']) {
      expect(getByText(algorithm)).toBeVisible();
    }
  });

  it('shows correct session stickiness options for the UDP protocol', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        protocol="udp"
      />
    );

    const sessionStickinessField = getByLabelText('Session Stickiness');

    expect(sessionStickinessField).toBeVisible();

    await userEvent.click(sessionStickinessField);

    for (const algorithm of ['None', 'Session', 'Source IP']) {
      expect(getByText(algorithm)).toBeVisible();
    }
  });

  it('shows a "Health Check Port" field when health checks are enabled', async () => {
    const onChange = vi.fn();

    const { getByLabelText } = renderWithTheme(
      <NodeBalancerConfigPanel
        {...nbConfigPanelMockPropsForTest}
        healthCheckType="connection"
        onUdpCheckPortChange={onChange}
        protocol="udp"
      />,
      { flags: { udp: true } }
    );

    const checkPortField = getByLabelText('Health Check Port');

    expect(checkPortField).toBeVisible();

    await userEvent.type(checkPortField, '8080');

    expect(onChange).toHaveBeenCalledWith(8080);
  });
});
