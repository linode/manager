import { NodeBalancerProxyProtocol } from '@linode/api-v4/lib/nodebalancers/types';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Divider from 'src/components/core/Divider';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';
import { getErrorMap } from 'src/utilities/errorUtils';
import NodeBalancerConfigNode from './NodeBalancerConfigNode';
import { NodeBalancerConfigNodeFields } from './types';

type ClassNames = 'passiveChecks' | 'actionsPanel';

const styles = (theme: Theme) =>
  createStyles({
    passiveChecks: {
      marginTop: 4,
    },
    actionsPanel: {
      paddingBottom: 0,
      paddingRight: `${theme.spacing()}px !important`,
    },
  });

const styled = withStyles(styles);

interface Props {
  nodeBalancerRegion?: string;
  errors?: APIError[];
  nodeMessage?: string;
  configIdx?: number;

  forEdit?: boolean;
  submitting?: boolean;
  onSave?: () => void;
  onDelete?: any;

  algorithm: 'roundrobin' | 'leastconn' | 'source';
  onAlgorithmChange: (v: string) => void;

  checkPassive: boolean;
  onCheckPassiveChange: (v: boolean) => void;

  checkBody: string;
  onCheckBodyChange: (v: string) => void;

  checkPath: string;
  onCheckPathChange: (v: string) => void;

  port: number;
  onPortChange: (v: string | number) => void;

  protocol: 'http' | 'https' | 'tcp';
  onProtocolChange: (v: string) => void;

  proxyProtocol: NodeBalancerProxyProtocol;
  onProxyProtocolChange: (v: string) => void;

  healthCheckType: 'none' | 'connection' | 'http' | 'http_body';
  onHealthCheckTypeChange: (v: string) => void;

  healthCheckAttempts: number;
  onHealthCheckAttemptsChange: (v: string | number) => void;

  healthCheckInterval: number;
  onHealthCheckIntervalChange: (v: string | number) => void;

  healthCheckTimeout: number;
  onHealthCheckTimeoutChange: (v: string | number) => void;

  sessionStickiness: 'none' | 'table' | 'http_cookie';
  onSessionStickinessChange: (v: string) => void;

  sslCertificate: string;
  onSslCertificateChange: (v: string) => void;

  privateKey: string;
  onPrivateKeyChange: (v: string) => void;

  nodes: NodeBalancerConfigNodeFields[];
  disabled?: boolean;
  addNode: (nodeIdx?: number) => void;
  removeNode: (nodeIdx: number) => void;
  onNodeLabelChange: (nodeIdx: number, value: string) => void;
  onNodeAddressChange: (nodeIdx: number, value: string) => void;
  onNodePortChange: (nodeIdx: number, value: string) => void;
  onNodeWeightChange: (nodeIdx: number, value: string) => void;
  onNodeModeChange?: (nodeIdx: number, value: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

interface State {
  currentNodeAddressIndex: number | null;
}

const DATA_NODE = 'data-node-idx';

class NodeBalancerConfigPanel extends React.Component<CombinedProps> {
  state: State = {
    currentNodeAddressIndex: null,
  };

  static defaultProps: Partial<Props> = {};

  onAlgorithmChange = (e: Item<string>) =>
    this.props.onAlgorithmChange(e.value);

  onCheckPassiveChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: boolean
  ) => this.props.onCheckPassiveChange(value);

  onCheckBodyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onCheckBodyChange(e.target.value);

  onCheckPathChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onCheckPathChange(e.target.value);

  onHealthCheckAttemptsChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onHealthCheckAttemptsChange(e.target.value);

  onHealthCheckIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onHealthCheckIntervalChange(e.target.value);

  onHealthCheckTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onHealthCheckTimeoutChange(e.target.value);

  onHealthCheckTypeChange = (e: Item<string>) =>
    this.props.onHealthCheckTypeChange(e.value);

  onPortChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onPortChange(e.target.value);

  onPrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onPrivateKeyChange(e.target.value);

  onProtocolChange = (e: Item<string>) => {
    const { healthCheckType } = this.props;
    const { value: protocol } = e;

    this.props.onProtocolChange(e.value);

    if (
      protocol === 'tcp' &&
      (healthCheckType === 'http' || healthCheckType === 'http_body')
    ) {
      this.props.onHealthCheckTypeChange('connection');
    }
    if (protocol === 'http' && healthCheckType === 'connection') {
      this.props.onHealthCheckTypeChange('http');
    }
    if (protocol === 'https' && healthCheckType === 'connection') {
      this.props.onHealthCheckTypeChange('http');
    }
  };

  onProxyProtocolChange = (e: Item<string>) => {
    this.props.onProxyProtocolChange(e.value);
  };

  onSessionStickinessChange = (e: Item<string>) =>
    this.props.onSessionStickinessChange(e.value);

  onSslCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onSslCertificateChange(e.target.value);

  onNodeLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute(DATA_NODE);
    if (nodeIdx) {
      this.props.onNodeLabelChange(+nodeIdx, e.target.value);
    }
  };

  onNodePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute(DATA_NODE);
    if (nodeIdx) {
      this.props.onNodePortChange(+nodeIdx, e.target.value);
    }
  };

  onNodeWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute(DATA_NODE);
    if (nodeIdx) {
      this.props.onNodeWeightChange(+nodeIdx, e.target.value);
    }
  };

  onNodeModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute(DATA_NODE);
    if (nodeIdx) {
      this.props.onNodeModeChange!(+nodeIdx, e.target.value);
    }
  };

  addNode = () => {
    if (this.props.disabled) {
      return;
    }
    this.props.addNode();
  };

  removeNode = (e: React.MouseEvent<HTMLElement>) => {
    if (this.props.disabled) {
      return;
    }
    const nodeIdx: string | null = e.currentTarget.getAttribute(DATA_NODE);
    const { removeNode } = this.props;
    if (removeNode && nodeIdx) {
      return removeNode(+nodeIdx);
    }
  };

  displayProtocolText = (p: string) => {
    if (p === 'tcp') {
      return `'TCP Connection' requires a successful TCP handshake.`;
    }
    if (p === 'http' || p === 'https') {
      return `'HTTP Valid Status' requires a 2xx or 3xx response from the backend node. 'HTTP Body Regex' uses a regex to match against an expected result body.`;
    }
    return undefined;
  };

  onSave = this.props.onSave;

  renderActiveCheck(errorMap: Record<string, string | undefined>) {
    const {
      checkBody,
      checkPath,
      configIdx,
      forEdit,
      healthCheckAttempts,
      healthCheckInterval,
      healthCheckTimeout,
      healthCheckType,
      protocol,
      disabled,
      classes,
    } = this.props;

    const conditionalText = this.displayProtocolText(protocol);

    const typeOptions = [
      {
        label: 'None',
        value: 'none',
      },
      {
        label: 'TCP Connection',
        value: 'connection',
      },
      {
        label: 'HTTP Status',
        value: 'http',
        disabled: protocol === 'tcp',
      },
      {
        label: 'HTTP Body',
        value: 'http_body',
        disabled: protocol === 'tcp',
      },
    ];

    const defaultType = typeOptions.find((eachType) => {
      return eachType.value === healthCheckType;
    });

    return (
      <Grid item xs={12} md={6}>
        <Grid container>
          <Grid
            updateFor={[classes]} // never update after initial render
            item
            xs={12}
          >
            <Typography variant="h2" data-qa-active-checks-header>
              Active Health Checks
            </Typography>
          </Grid>
          <Grid
            updateFor={[
              protocol,
              healthCheckType,
              errorMap.check,
              configIdx,
              classes,
            ]}
            item
            xs={12}
          >
            <Grid item xs={12}>
              <Select
                options={typeOptions}
                label="Type"
                inputId={`type-${configIdx}`}
                value={defaultType || typeOptions[0]}
                onChange={this.onHealthCheckTypeChange}
                errorText={errorMap.check}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                textFieldProps={{
                  dataAttrs: {
                    'data-qa-active-check-select': true,
                  },
                }}
                small
                disabled={disabled}
                isClearable={false}
                noMarginTop
              />
              <FormHelperText>
                Active health checks proactively check the health of back-end
                nodes. {conditionalText}
              </FormHelperText>
            </Grid>
          </Grid>
          {healthCheckType !== 'none' && (
            <React.Fragment>
              <Grid
                updateFor={[
                  healthCheckInterval,
                  errorMap.check_interval,
                  configIdx,
                  classes,
                ]}
                item
                xs={12}
              >
                <TextField
                  type="number"
                  label="Interval"
                  InputProps={{
                    'aria-label': 'Active Health Check Interval',
                    endAdornment: (
                      <InputAdornment position="end">seconds</InputAdornment>
                    ),
                  }}
                  value={healthCheckInterval}
                  onChange={this.onHealthCheckIntervalChange}
                  errorText={errorMap.check_interval}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  data-qa-active-check-interval
                  disabled={disabled}
                  small
                />
                <FormHelperText>
                  Seconds between health check probes
                </FormHelperText>
              </Grid>
              <Grid
                updateFor={[
                  healthCheckTimeout,
                  errorMap.check_timeout,
                  configIdx,
                  classes,
                ]}
                item
                xs={12}
              >
                <TextField
                  type="number"
                  label="Timeout"
                  InputProps={{
                    'aria-label': 'Active Health Check Timeout',
                    endAdornment: (
                      <InputAdornment position="end">seconds</InputAdornment>
                    ),
                  }}
                  value={healthCheckTimeout}
                  onChange={this.onHealthCheckTimeoutChange}
                  errorText={errorMap.check_timeout}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  data-qa-active-check-timeout
                  disabled={disabled}
                  small
                />
                <FormHelperText>
                  Seconds to wait before considering the probe a failure. 1-30.
                  Must be less than check_interval.
                </FormHelperText>
              </Grid>
              <Grid
                updateFor={[
                  healthCheckAttempts,
                  errorMap.check_attempts,
                  configIdx,
                  classes,
                ]}
                item
                xs={12}
                lg={6}
              >
                <TextField
                  type="number"
                  label="Attempts"
                  value={healthCheckAttempts}
                  onChange={this.onHealthCheckAttemptsChange}
                  errorText={errorMap.check_attempts}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  InputProps={{
                    'aria-label': 'Active Health Check Attempts',
                  }}
                  data-qa-active-check-attempts
                  disabled={disabled}
                  small
                />
                <FormHelperText>
                  Number of failed probes before taking a node out of rotation.
                  1-30
                </FormHelperText>
              </Grid>
              {['http', 'http_body'].includes(healthCheckType) && (
                <Grid
                  updateFor={[
                    checkPath,
                    healthCheckType,
                    errorMap.check_path,
                    configIdx,
                    classes,
                  ]}
                  item
                  xs={12}
                  lg={6}
                >
                  <TextField
                    label="Check HTTP Path"
                    value={checkPath || ''}
                    onChange={this.onCheckPathChange}
                    required={['http', 'http_body'].includes(healthCheckType)}
                    errorText={errorMap.check_path}
                    errorGroup={forEdit ? `${configIdx}` : undefined}
                    disabled={disabled}
                    small
                  />
                </Grid>
              )}
              {healthCheckType === 'http_body' && (
                <Grid
                  updateFor={[
                    checkBody,
                    healthCheckType,
                    errorMap.check_body,
                    configIdx,
                    classes,
                  ]}
                  item
                  xs={12}
                  md={4}
                >
                  <TextField
                    label="Expected HTTP Body"
                    value={checkBody}
                    onChange={this.onCheckBodyChange}
                    required={healthCheckType === 'http_body'}
                    errorText={errorMap.check_body}
                    errorGroup={forEdit ? `${configIdx}` : undefined}
                    disabled={disabled}
                    small
                  />
                </Grid>
              )}
            </React.Fragment>
          )}
        </Grid>
      </Grid>
    );
  }

  renderPassiveCheck() {
    const { checkPassive, classes, disabled } = this.props;

    return (
      <Grid item xs={12} md={6}>
        <Grid updateFor={[checkPassive, classes]} container>
          <Grid item xs={12}>
            <Typography variant="h2" data-qa-passive-checks-header>
              Passive Checks
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              className={classes.passiveChecks}
              control={
                <Toggle
                  checked={checkPassive}
                  onChange={this.onCheckPassiveChange}
                  data-qa-passive-checks-toggle={checkPassive}
                  disabled={disabled}
                />
              }
              label="Passive Checks"
            />
            <FormHelperText>
              Enable passive checks based on observing communication with
              back-end nodes.
            </FormHelperText>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  render() {
    const {
      algorithm,
      classes,
      configIdx,
      errors,
      forEdit,
      nodes,
      nodeMessage,
      port,
      privateKey,
      protocol,
      proxyProtocol,
      sessionStickiness,
      sslCertificate,
      submitting,
      disabled,
    } = this.props;

    // We don't want to end up with nodes[3].ip_address as errorMap.none
    const filteredErrors = errors
      ? errors.filter(
          (thisError) =>
            !thisError.field || !thisError.field.match(/nodes\[[0-9+]\]/)
        )
      : [];

    const errorMap = getErrorMap(
      [
        'algorithm',
        'check_attempts',
        'check_body',
        'check_interval',
        'check_path',
        'check_timeout',
        'check',
        'configs',
        'port',
        'protocol',
        'proxy_protocol',
        'ssl_cert',
        'ssl_key',
        'stickiness',
        'nodes',
      ],
      filteredErrors
    );

    const globalFormError = errorMap.none;

    const protocolOptions = [
      { label: 'TCP', value: 'tcp' },
      { label: 'HTTP', value: 'http' },
      { label: 'HTTPS', value: 'https' },
    ];

    const proxyProtocolOptions = [
      { label: 'None', value: 'none' },
      { label: 'v1', value: 'v1' },
      { label: 'v2', value: 'v2' },
    ];

    const defaultProtocol = protocolOptions.find((eachProtocol) => {
      return eachProtocol.value === protocol;
    });

    const selectedProxyProtocol = proxyProtocolOptions.find(
      (eachProxyProtocol) => {
        return eachProxyProtocol.value === proxyProtocol;
      }
    );

    const algOptions = [
      { label: 'Round Robin', value: 'roundrobin' },
      { label: 'Least Connections', value: 'leastconn' },
      { label: 'Source', value: 'source' },
    ];

    const defaultAlg = algOptions.find((eachAlg) => {
      return eachAlg.value === algorithm;
    });

    const sessionOptions = [
      { label: 'None', value: 'none' },
      { label: 'Table', value: 'table' },
      { label: 'HTTP Cookie', value: 'http_cookie' },
    ];

    const defaultSession = sessionOptions.find((eachSession) => {
      return eachSession.value === sessionStickiness;
    });

    const tcpSelected = protocol === 'tcp';

    return (
      <Grid item xs={12} data-qa-label-header>
        {globalFormError && (
          <Notice
            className={`error-for-scroll-${configIdx}`}
            text={globalFormError}
            error
          />
        )}
        <Grid
          updateFor={[
            port,
            errorMap.port,
            errorMap.configs,
            protocol,
            errorMap.protocol,
            proxyProtocol,
            errorMap.proxy_protocol,
            algorithm,
            errorMap.algorithm,
            sessionStickiness,
            errorMap.stickiness,
            errorMap.ssl_cert,
            errorMap.ssl_key,
            configIdx,
            sslCertificate,
            privateKey,
            classes,
          ]}
          container
        >
          <Grid item xs={12}>
            <Typography variant="h2" data-qa-port-config-header>
              Port Configuration
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              type="number"
              label="Port"
              required
              value={port || ''}
              onChange={this.onPortChange}
              errorText={errorMap.port || errorMap.configs}
              errorGroup={forEdit ? `${configIdx}` : undefined}
              data-qa-port
              small
              disabled={disabled}
              noMarginTop
              InputProps={{ id: `port-${configIdx}` }}
            />
            <FormHelperText>Listen on this port</FormHelperText>
          </Grid>
          <Grid item xs={6} md={3}>
            <Select
              options={protocolOptions}
              label="Protocol"
              inputId={`protocol-${configIdx}`}
              value={defaultProtocol || protocolOptions[0]}
              onChange={this.onProtocolChange}
              errorText={errorMap.protocol}
              errorGroup={forEdit ? `${configIdx}` : undefined}
              textFieldProps={{
                dataAttrs: {
                  'data-qa-protocol-select': true,
                },
              }}
              disabled={disabled}
              noMarginTop
              small
              isClearable={false}
            />
          </Grid>

          {protocol === 'https' && (
            <Grid item xs={12}>
              <Grid
                updateFor={[
                  sslCertificate,
                  protocol,
                  errorMap.ssl_cert,
                  privateKey,
                  errorMap.ssl_key,
                  configIdx,
                  classes,
                ]}
                container
              >
                <Grid item xs={12}>
                  <TextField
                    multiline
                    rows={3}
                    label="SSL Certificate"
                    value={sslCertificate || ''}
                    onChange={this.onSslCertificateChange}
                    required={protocol === 'https'}
                    errorText={errorMap.ssl_cert}
                    errorGroup={forEdit ? `${configIdx}` : undefined}
                    data-qa-cert-field
                    small
                    disabled={disabled}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    multiline
                    rows={3}
                    label="Private Key"
                    value={privateKey || ''}
                    onChange={this.onPrivateKeyChange}
                    required={protocol === 'https'}
                    errorText={errorMap.ssl_key}
                    errorGroup={forEdit ? `${configIdx}` : undefined}
                    data-qa-private-key-field
                    small
                    disabled={disabled}
                  />
                </Grid>
              </Grid>
            </Grid>
          )}

          {tcpSelected && (
            <Grid item xs={6} md={3}>
              <Select
                options={proxyProtocolOptions}
                label="Proxy Protocol"
                inputId={`proxy-protocol-${configIdx}`}
                value={selectedProxyProtocol || proxyProtocolOptions[0]}
                onChange={this.onProxyProtocolChange}
                errorText={errorMap.proxy_protocol}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                textFieldProps={{
                  dataAttrs: {
                    'data-qa-proxy-protocol-select': true,
                  },
                }}
                disabled={disabled}
                noMarginTop
                small
                isClearable={false}
              />
              <FormHelperText>
                Proxy Protocol preserves initial TCP connection information.
                Please consult{' '}
                <Link to="https://www.linode.com/docs/platform/nodebalancer/nodebalancer-proxypass-configuration/">
                  our Proxy Protocol guide
                </Link>
                {` `}
                for information on the differences between each option.
              </FormHelperText>
            </Grid>
          )}

          <Grid item xs={6} md={tcpSelected ? 6 : 3}>
            <Select
              options={algOptions}
              label="Algorithm"
              inputId={`algorithm-${configIdx}`}
              value={defaultAlg || algOptions[0]}
              onChange={this.onAlgorithmChange}
              errorText={errorMap.algorithm}
              errorGroup={forEdit ? `${configIdx}` : undefined}
              textFieldProps={{
                dataAttrs: {
                  'data-qa-algorithm-select': true,
                },
              }}
              small
              disabled={disabled}
              isClearable={false}
              noMarginTop
            />
            <FormHelperText>
              Roundrobin. Least connections assigns connections to the backend
              with the least connections. Source uses the client&#39;s IPv4
              address
            </FormHelperText>
          </Grid>

          <Grid item xs={6} md={3}>
            <Select
              options={sessionOptions}
              label="Session Stickiness"
              inputId={`session-stickiness-${configIdx}`}
              value={defaultSession || sessionOptions[1]}
              onChange={this.onSessionStickinessChange}
              errorText={errorMap.stickiness}
              errorGroup={forEdit ? `${configIdx}` : undefined}
              textFieldProps={{
                dataAttrs: {
                  'data-qa-session-stickiness-select': true,
                },
              }}
              small
              disabled={disabled}
              isClearable={false}
              noMarginTop
            />
            <FormHelperText>
              Route subsequent requests from the client to the same backend
            </FormHelperText>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
        </Grid>
        <Grid container>
          {this.renderActiveCheck(errorMap)}
          {this.renderPassiveCheck()}
          <Grid item xs={12}>
            <Divider />
          </Grid>
        </Grid>

        <Grid
          updateFor={[
            nodes,
            errors,
            nodeMessage,
            classes,
            errorMap.nodes,
            this.props.nodeBalancerRegion,
          ]}
          container
        >
          <Grid item xs={12}>
            <Grid updateFor={[nodeMessage, classes]} item xs={12}>
              {nodeMessage && <Notice text={nodeMessage} success />}
            </Grid>
            <Typography variant="h2" data-qa-backend-ip-header>
              Backend Nodes
            </Typography>
            {errorMap.nodes && (
              <FormHelperText error>{errorMap.nodes}</FormHelperText>
            )}
          </Grid>
          <Grid item xs={12} style={{ paddingBottom: 24 }}>
            <Grid container>
              {nodes &&
                nodes.map((node, nodeIdx) => (
                  <NodeBalancerConfigNode
                    key={`nb-node-${nodeIdx}`}
                    forEdit={Boolean(forEdit)}
                    node={node}
                    idx={nodeIdx}
                    configIdx={configIdx}
                    nodeBalancerRegion={this.props.nodeBalancerRegion}
                    onNodeLabelChange={this.onNodeLabelChange}
                    onNodeAddressChange={this.props.onNodeAddressChange}
                    onNodeModeChange={this.onNodeModeChange}
                    onNodeWeightChange={this.onNodeWeightChange}
                    onNodePortChange={this.onNodePortChange}
                    disabled={Boolean(disabled)}
                    removeNode={this.removeNode}
                  />
                ))}
              <Grid
                item
                xs={12}
                updateFor={[classes]}
                // is the Save/Delete ActionsPanel showing?
                style={
                  forEdit || configIdx !== 0
                    ? { marginTop: 0, marginBottom: -16 }
                    : { marginTop: 16 }
                }
              >
                <Button
                  buttonType="outlined"
                  disabled={disabled}
                  onClick={this.addNode}
                >
                  Add a Node
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {(forEdit || configIdx !== 0) && (
          <React.Fragment>
            <Grid updateFor={[classes]} item xs={12}>
              <Divider />
            </Grid>
            <Grid
              updateFor={[submitting, classes]}
              container
              justify="flex-end"
              alignItems="center"
            >
              <ActionsPanel className={classes.actionsPanel}>
                {(forEdit || configIdx !== 0) && (
                  <Button
                    buttonType="secondary"
                    onClick={this.props.onDelete}
                    disabled={disabled}
                    data-qa-delete-config
                  >
                    Delete
                  </Button>
                )}
                {forEdit && (
                  <Button
                    buttonType="primary"
                    onClick={this.onSave}
                    disabled={disabled}
                    loading={submitting}
                    data-qa-save-config
                  >
                    Save
                  </Button>
                )}
              </ActionsPanel>
            </Grid>
          </React.Fragment>
        )}
      </Grid>
    );
  }
}

export default styled(NodeBalancerConfigPanel) as React.ComponentType<Props>;
