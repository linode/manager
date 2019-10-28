import { NodeBalancerConfigNodeFields } from 'linode-js-sdk/lib/nodebalancers';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import Chip from 'src/components/core/Chip';
import Divider from 'src/components/core/Divider';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import MenuItem from 'src/components/core/MenuItem';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

import SelectIP from './ConfigNodeIPSelect';

type ClassNames =
  | 'divider'
  | 'backendIPAction'
  | 'suggestionsParent'
  | 'suggestions'
  | 'suggestionItem'
  | 'chip-UP'
  | 'chip-DOWN'
  | 'selectedSuggestionItem'
  | 'statusHeader'
  | 'statusChip'
  | 'passiveChecks';

const styles = (theme: Theme) =>
  createStyles({
    divider: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    },
    backendIPAction: {
      display: 'flex',
      alignItems: 'flex-end',
      paddingLeft: theme.spacing(2),
      marginLeft: -theme.spacing(1),
      [theme.breakpoints.down('md')]: {
        marginTop: -theme.spacing(1)
      },
      [theme.breakpoints.down('xs')]: {
        marginTop: 0
      },
      '& .remove': {
        margin: 0,
        padding: theme.spacing(2.5)
      }
    },
    suggestionsParent: {
      position: 'relative'
    },
    suggestions: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 80,
      padding: 0,
      boxShadow: `0 0 10px ${theme.color.boxShadow}`,
      maxHeight: 150,
      overflowY: 'auto',
      width: '100%',
      maxWidth: 415,
      zIndex: 2
    },
    suggestionItem: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      color: theme.palette.text.primary,
      '&:hover, &:focus': {
        backgroundColor: `${theme.palette.primary.main} !important`,
        color: `white !important`
      },
      '&:last-item': {
        border: 0
      }
    },
    selectedSuggestionItem: {
      backgroundColor: `${theme.palette.primary.main} !important`,
      color: '#fff !important'
    },
    'chip-UP': {
      backgroundColor: theme.color.green
    },
    'chip-DOWN': {
      backgroundColor: theme.color.red
    },
    statusHeader: {
      fontSize: '.9rem',
      color: theme.color.label,
      marginTop: theme.spacing(2) - 4
    },
    statusChip: {
      marginTop: theme.spacing(1),
      color: 'white',
      '&.undefined': {
        backgroundColor: theme.color.grey2,
        color: theme.palette.text.primary
      }
    },
    passiveChecks: {
      marginTop: 4
    }
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

class NodeBalancerConfigPanel extends React.Component<CombinedProps> {
  state: State = {
    currentNodeAddressIndex: null
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

  onSessionStickinessChange = (e: Item<string>) =>
    this.props.onSessionStickinessChange(e.value);

  onSslCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onSslCertificateChange(e.target.value);

  onNodeLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute('data-node-idx');
    if (nodeIdx) {
      this.props.onNodeLabelChange(+nodeIdx, e.target.value);
    }
  };

  onNodeAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute('data-node-idx');
    if (nodeIdx) {
      this.props.onNodeAddressChange(+nodeIdx, e.target.value);
    }
  };

  onNodePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute('data-node-idx');
    if (nodeIdx) {
      this.props.onNodePortChange(+nodeIdx, e.target.value);
    }
  };

  onNodeWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute('data-node-idx');
    if (nodeIdx) {
      this.props.onNodeWeightChange(+nodeIdx, e.target.value);
    }
  };

  onNodeModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute('data-node-idx');
    if (nodeIdx) {
      this.props.onNodeModeChange!(+nodeIdx, e.target.value);
    }
  };

  addNode = (e: React.MouseEvent<HTMLElement>) => {
    if (this.props.disabled) {
      return;
    }
    this.props.addNode();
  };

  removeNode = (e: React.MouseEvent<HTMLElement>) => {
    if (this.props.disabled) {
      return;
    }
    const nodeIdx: string | null = e.currentTarget.getAttribute(
      'data-node-idx'
    );
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
    return;
  };

  onSave = this.props.onSave;

  renderActiveCheck() {
    const {
      checkBody,
      checkPath,
      configIdx,
      errors,
      forEdit,
      healthCheckAttempts,
      healthCheckInterval,
      healthCheckTimeout,
      healthCheckType,
      protocol,
      disabled,
      classes
    } = this.props;

    const hasErrorFor = getAPIErrorFor(
      {
        check_attempts: 'Check attempts',
        check_body: 'Check body',
        check_interval: 'Check interval',
        check_path: 'Check path',
        check_timeout: 'Check timeout',
        check: 'Check type'
      },
      errors
    );

    const conditionalText = this.displayProtocolText(protocol);

    const typeOptions = [
      {
        label: 'None',
        value: 'none'
      },
      {
        label: 'TCP Connection',
        value: 'connection',
        isDisabled: protocol === 'http' || protocol === 'https'
      },
      {
        label: 'HTTP Status',
        value: 'http',
        disabled: protocol === 'tcp'
      },
      {
        label: 'HTTP Body',
        value: 'http_body',
        disabled: protocol === 'tcp'
      }
    ];

    const defaultType = typeOptions.find(eachType => {
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
              hasErrorFor('check'),
              configIdx,
              classes
            ]}
            item
            xs={12}
          >
            <Grid item xs={12}>
              <Select
                options={typeOptions}
                label="Type"
                value={defaultType || typeOptions[0]}
                onChange={this.onHealthCheckTypeChange}
                errorText={hasErrorFor('check')}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                textFieldProps={{
                  dataAttrs: {
                    'data-qa-active-check-select': true
                  }
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
                  hasErrorFor('check_interval'),
                  configIdx,
                  classes
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
                    )
                  }}
                  value={healthCheckInterval}
                  onChange={this.onHealthCheckIntervalChange}
                  errorText={hasErrorFor('check_interval')}
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
                  hasErrorFor('check_timeout'),
                  configIdx,
                  classes
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
                    )
                  }}
                  value={healthCheckTimeout}
                  onChange={this.onHealthCheckTimeoutChange}
                  errorText={hasErrorFor('check_timeout')}
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
                  hasErrorFor('check_attempts'),
                  configIdx,
                  classes
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
                  errorText={hasErrorFor('check_attempts')}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  InputProps={{
                    'aria-label': 'Active Health Check Attempts'
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
                    hasErrorFor('check_path'),
                    configIdx,
                    classes
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
                    errorText={hasErrorFor('check_path')}
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
                    hasErrorFor('check_body'),
                    configIdx,
                    classes
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
                    errorText={hasErrorFor('check_body')}
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
      sessionStickiness,
      sslCertificate,
      submitting,
      disabled
    } = this.props;

    const hasErrorFor = getAPIErrorFor(
      {
        algorithm: 'Algorithm',
        check_attempts: 'Check attempts',
        check_body: 'Check body',
        check_interval: 'Check interval',
        check_passive: 'Passive check',
        check_path: 'Check path',
        check_timeout: 'Check timeout',
        check: 'Check type',
        cipher_suite: 'Cipher suite',
        configs: 'configs',
        port: 'Port',
        protocol: 'Protocol',
        ssl_cert: 'SSL certificate',
        ssl_key: 'SSL private key',
        stickiness: 'Session stickiness',
        nodes: 'Nodes'
      },
      errors
    );

    const globalFormError = hasErrorFor('none');

    const protocolOptions = [
      { label: 'TCP', value: 'tcp' },
      { label: 'HTTP', value: 'http' },
      { label: 'HTTPS', value: 'https' }
    ];

    const defaultProtocol = protocolOptions.find(eachProtocol => {
      return eachProtocol.value === protocol;
    });

    const algOptions = [
      { label: 'Round Robin', value: 'roundrobin' },
      { label: 'Least Connections', value: 'leastconn' },
      { label: 'Source', value: 'source' }
    ];

    const defaultAlg = algOptions.find(eachAlg => {
      return eachAlg.value === algorithm;
    });

    const sessionOptions = [
      { label: 'None', value: 'none' },
      { label: 'Table', value: 'table' },
      { label: 'HTTP Cookie', value: 'http_cookie' }
    ];

    const defaultSession = sessionOptions.find(eachSession => {
      return eachSession.value === sessionStickiness;
    });

    return (
      <Grid item xs={12}>
        <Paper data-qa-label-header>
          <div>
            {globalFormError && (
              <Notice
                className={`error-for-scroll-${configIdx}`}
                text={globalFormError}
                error={true}
              />
            )}
            <Grid
              updateFor={[
                port,
                hasErrorFor('port'),
                protocol,
                hasErrorFor('protocol'),
                algorithm,
                hasErrorFor('algorithm'),
                sessionStickiness,
                hasErrorFor('stickiness'),
                hasErrorFor('ssl_cert'),
                hasErrorFor('ssl_key'),
                configIdx,
                sslCertificate,
                privateKey,
                classes
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
                  errorText={hasErrorFor('port') || hasErrorFor('configs')}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  data-qa-port
                  small
                  disabled={disabled}
                  noMarginTop
                />
                <FormHelperText>Listen on this port</FormHelperText>
              </Grid>
              <Grid item xs={6} md={3}>
                <Select
                  options={protocolOptions}
                  label="Protocol"
                  value={defaultProtocol || protocolOptions[0]}
                  onChange={this.onProtocolChange}
                  errorText={hasErrorFor('protocol')}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  textFieldProps={{
                    dataAttrs: {
                      'data-qa-protocol-select': true
                    }
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
                      hasErrorFor('ssl_cert'),
                      privateKey,
                      hasErrorFor('ssl_key'),
                      configIdx,
                      classes
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
                        errorText={hasErrorFor('ssl_cert')}
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
                        errorText={hasErrorFor('ssl_key')}
                        errorGroup={forEdit ? `${configIdx}` : undefined}
                        data-qa-private-key-field
                        small
                        disabled={disabled}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}

              <Grid item xs={6} md={3}>
                <Select
                  options={algOptions}
                  label="Algorithm"
                  value={defaultAlg || algOptions[0]}
                  onChange={this.onAlgorithmChange}
                  errorText={hasErrorFor('algorithm')}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  textFieldProps={{
                    dataAttrs: {
                      'data-qa-algorithm-select': true
                    }
                  }}
                  small
                  disabled={disabled}
                  isClearable={false}
                  noMarginTop
                />
                <FormHelperText>
                  Roundrobin. Least connections assigns connections to the
                  backend with the least connections. Source uses the client's
                  IPv4 address
                </FormHelperText>
              </Grid>

              <Grid item xs={6} md={3}>
                <Select
                  options={sessionOptions}
                  label="Session Stickiness"
                  value={defaultSession || sessionOptions[1]}
                  onChange={this.onSessionStickinessChange}
                  errorText={hasErrorFor('stickiness')}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  textFieldProps={{
                    dataAttrs: {
                      'data-qa-session-stickiness-select': true
                    }
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
                <Divider className={classes.divider} />
              </Grid>
            </Grid>
            <Grid container>
              {this.renderActiveCheck()}
              {this.renderPassiveCheck()}
              <Grid item xs={12}>
                <Divider className={classes.divider} />
              </Grid>
            </Grid>

            <Grid
              updateFor={[
                nodes,
                errors,
                nodeMessage,
                classes,
                this.props.nodeBalancerRegion
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
                {hasErrorFor('nodes') && (
                  <FormHelperText error>{hasErrorFor('nodes')}</FormHelperText>
                )}
              </Grid>
              <Grid item xs={12} style={{ paddingBottom: 24 }}>
                <Grid container>
                  {nodes &&
                    nodes.map((node, idx) => {
                      if (node.modifyStatus === 'delete') {
                        /* This node has been marked for deletion, don't display it */
                        return null;
                      }

                      const nodesHasErrorFor = getAPIErrorFor(
                        {
                          label: 'label',
                          address: 'address',
                          weight: 'weight',
                          port: 'port',
                          mode: 'mode'
                        },
                        node.errors
                      );

                      return (
                        <React.Fragment key={`nb-node-${idx}`}>
                          <Grid
                            updateFor={[
                              nodes.length,
                              node,
                              errors,
                              configIdx,
                              classes
                            ]}
                            item
                            data-qa-node
                            xs={12}
                          >
                            {idx !== 0 && (
                              <Grid item xs={12}>
                                <Divider
                                  style={{
                                    marginTop: forEdit ? 8 : 24,
                                    marginBottom: 24
                                  }}
                                />
                              </Grid>
                            )}
                            <Grid container>
                              <Grid
                                item
                                xs={6}
                                sm={forEdit ? 4 : 6}
                                lg={forEdit ? 2 : 4}
                              >
                                <TextField
                                  label="Label"
                                  value={node.label}
                                  inputProps={{ 'data-node-idx': idx }}
                                  onChange={this.onNodeLabelChange}
                                  errorText={nodesHasErrorFor('label')}
                                  errorGroup={
                                    forEdit ? `${configIdx}` : undefined
                                  }
                                  data-qa-backend-ip-label
                                  small
                                  disabled={disabled}
                                />
                              </Grid>
                              {node.status && (
                                <Grid item xs={6} sm={4} lg={2}>
                                  <Typography
                                    variant="h3"
                                    data-qa-active-checks-header
                                    className={classes.statusHeader}
                                  >
                                    Status
                                    <div>
                                      <Chip
                                        className={`
                                          ${classes.statusChip}
                                          ${classes[`chip-${node.status}`]}
                                        `}
                                        label={node.status}
                                        component="div"
                                      />
                                    </div>
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </Grid>
                          <Grid item xs={12}>
                            <Grid
                              key={idx}
                              updateFor={[
                                nodes.length,
                                this.props.nodeBalancerRegion,
                                node,
                                errors,
                                configIdx,
                                classes
                              ]}
                              container
                              data-qa-node
                            >
                              <Grid
                                item
                                xs={12}
                                sm={forEdit ? 3 : 3}
                                lg={forEdit ? 2 : 4}
                              >
                                <SelectIP
                                  textfieldProps={{
                                    dataAttrs: {
                                      'data-qa-backend-ip-address': true
                                    }
                                  }}
                                  handleChange={this.props.onNodeAddressChange}
                                  selectedRegion={this.props.nodeBalancerRegion}
                                  nodeIndex={idx}
                                  errorText={nodesHasErrorFor('address')}
                                  nodeAddress={node.address}
                                  workflow={forEdit ? 'edit' : 'create'}
                                />
                              </Grid>
                              <Grid item xs={6} sm={3} lg={2}>
                                <TextField
                                  type="number"
                                  label="Port"
                                  value={node.port}
                                  inputProps={{ 'data-node-idx': idx }}
                                  onChange={this.onNodePortChange}
                                  errorText={nodesHasErrorFor('port')}
                                  errorGroup={
                                    forEdit ? `${configIdx}` : undefined
                                  }
                                  data-qa-backend-ip-port
                                  small
                                  noMarginTop
                                  disabled={disabled}
                                />
                              </Grid>
                              <Grid item xs={6} sm={3} lg={2}>
                                <TextField
                                  type="number"
                                  label="Weight"
                                  value={node.weight}
                                  inputProps={{ 'data-node-idx': idx }}
                                  onChange={this.onNodeWeightChange}
                                  errorText={nodesHasErrorFor('weight')}
                                  errorGroup={
                                    forEdit ? `${configIdx}` : undefined
                                  }
                                  data-qa-backend-ip-weight
                                  small
                                  noMarginTop
                                  disabled={disabled}
                                />
                              </Grid>
                              {forEdit && (
                                <Grid item xs={6} sm={3} lg={2}>
                                  <TextField
                                    label="Mode"
                                    value={node.mode}
                                    select
                                    inputProps={{ 'data-node-idx': idx }}
                                    onChange={this.onNodeModeChange}
                                    errorText={nodesHasErrorFor('mode')}
                                    data-qa-backend-ip-mode
                                    small
                                    disabled={disabled}
                                  >
                                    <MenuItem
                                      value="accept"
                                      data-node-idx={idx}
                                    >
                                      Accept
                                    </MenuItem>
                                    <MenuItem
                                      value="reject"
                                      data-node-idx={idx}
                                    >
                                      Reject
                                    </MenuItem>
                                    <MenuItem
                                      value="backup"
                                      data-node-idx={idx}
                                    >
                                      Backup
                                    </MenuItem>
                                    <MenuItem value="drain" data-node-idx={idx}>
                                      Drain
                                    </MenuItem>
                                  </TextField>
                                </Grid>
                              )}
                              <ActionsPanel className={classes.backendIPAction}>
                                {(forEdit || idx !== 0) && (
                                  <Button
                                    buttonType="remove"
                                    data-node-idx={idx}
                                    onClick={this.removeNode}
                                    data-qa-remove-node
                                    disabled={disabled}
                                  />
                                )}
                              </ActionsPanel>
                            </Grid>
                          </Grid>
                        </React.Fragment>
                      );
                    })}
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
                    <AddNewLink
                      label="Add a Node"
                      onClick={this.addNode}
                      left
                      disabled={disabled}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {(forEdit || configIdx !== 0) && (
              <React.Fragment>
                <Grid updateFor={[classes]} item xs={12}>
                  <Divider className={classes.divider} />
                </Grid>
                <Grid
                  updateFor={[submitting, classes]}
                  container
                  justify="space-between"
                  alignItems="center"
                >
                  <Grid item>
                    <ActionsPanel style={{ paddingLeft: 0 }}>
                      {forEdit && (
                        <Button
                          buttonType="primary"
                          onClick={this.onSave}
                          loading={submitting}
                          data-qa-save-config
                          disabled={disabled}
                        >
                          Save
                        </Button>
                      )}
                      {(forEdit || configIdx !== 0) && (
                        <Button
                          onClick={this.props.onDelete}
                          buttonType="secondary"
                          destructive
                          data-qa-delete-config
                          disabled={disabled}
                        >
                          Delete
                        </Button>
                      )}
                    </ActionsPanel>
                  </Grid>
                </Grid>
              </React.Fragment>
            )}
          </div>
        </Paper>
      </Grid>
    );
  }
}

export default styled(NodeBalancerConfigPanel) as React.ComponentType<Props>;
