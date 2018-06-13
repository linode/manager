import * as React from 'react';
import { equals } from 'ramda';
import { withStyles, StyleRulesCallback, WithStyles, Theme, Divider, MenuItem } from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Delete from 'material-ui-icons/Delete';
import FormControlLabel from 'material-ui/Form/FormControlLabel';

import Button from 'src/components/Button';
import { FormHelperText } from 'material-ui/Form';
import IconButton from 'src/components/IconButton';
import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import ActionsPanel from 'src/components/ActionsPanel';

type ClassNames = 'root'
  | 'inner'
  | 'divider'
  | 'suffix'
  | 'backendIPAction';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
  },
  inner: {},
  divider: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
  },
  suffix: {
    marginRight: theme.spacing.unit * 2,
  },
  backendIPAction: {
    paddingLeft: theme.spacing.unit * 2,
    marginLeft: -theme.spacing.unit,
    marginTop: theme.spacing.unit * 3,
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props {
  errors?: Linode.ApiFieldError[];

  forEdit?: boolean;
  submitting?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;

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

  nodes: Linode.NodeBalancerConfigNode[];
  addNode: (nodeIdx?: number) => void;
  removeNode: (configId: number) => void;
  onUpdateNode?: (idx: number) => void;
  onNodeLabelChange: (idx: number, value: string) => void;
  onNodeAddressChange: (idx: number, value: string) => void;
  onNodePortChange: (idx: number, value: string) => void;
  onNodeWeightChange: (idx: number, value: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class NodeBalancerConfigPanel extends React.Component<CombinedProps> {

  static defaultProps: Partial<Props> = {
  };

  onAlgorithmChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onAlgorithmChange(e.target.value)

  onCheckPassiveChange = (e: React.ChangeEvent<HTMLInputElement>, value: boolean) =>
    this.props.onCheckPassiveChange(value)

  onCheckBodyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onCheckBodyChange(e.target.value)

  onCheckPathChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onCheckPathChange(e.target.value)

  onHealthCheckAttemptsChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onHealthCheckAttemptsChange(e.target.value)

  onHealthCheckIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onHealthCheckIntervalChange(e.target.value)

  onHealthCheckTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onHealthCheckTimeoutChange(e.target.value)

  onHealthCheckTypeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onHealthCheckTypeChange(e.target.value)

  onPortChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onPortChange(e.target.value)

  onPrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onPrivateKeyChange(e.target.value)

  onProtocolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { healthCheckType } = this.props;
    const { target: { value: protocol } } = e;

    this.props.onProtocolChange(e.target.value);

    if (protocol === 'tcp' && (healthCheckType === 'http' || healthCheckType === 'http_body')) {
      this.props.onHealthCheckTypeChange('connection');
    }
    if (protocol === 'http' && healthCheckType === 'connection') {
      this.props.onHealthCheckTypeChange('http');
    }
    if (protocol === 'https' && healthCheckType === 'connection') {
      this.props.onHealthCheckTypeChange('http');
    }
  }

  onSessionStickinessChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onSessionStickinessChange(e.target.value)

  onSslCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onSslCertificateChange(e.target.value)

  onNodeLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const configIdx = e.currentTarget.getAttribute('data-config-idx');
    if (configIdx) {
      this.props.onNodeLabelChange(
        +configIdx,
        e.target.value,
      );
    }
  }

  onNodeAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const configIdx = e.currentTarget.getAttribute('data-config-idx');
    if (configIdx) {
      this.props.onNodeAddressChange(
        +configIdx,
        e.target.value,
      );
    }
  }

  onNodePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const configIdx = e.currentTarget.getAttribute('data-config-idx');
    if (configIdx) {
      this.props.onNodePortChange(
        +configIdx,
        e.target.value,
      );
    }
  }

  onNodeWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const configIdx = e.currentTarget.getAttribute('data-config-idx');
    if (configIdx) {
      this.props.onNodeWeightChange(
        +configIdx,
        e.target.value,
      );
    }
  }

  addNode = (e: React.MouseEvent<HTMLElement>) => {
    const configIdx: string | null = e.currentTarget.getAttribute('data-config-idx');
    if (configIdx) {
      this.props.addNode(+configIdx);
    }
  }

  onUpdateNode = (e: React.MouseEvent<HTMLElement>) => {
    const configIdx: string | null = e.currentTarget.getAttribute('data-config-idx');
    const { onUpdateNode } = this.props;
    if (onUpdateNode && configIdx) {
      return onUpdateNode(+configIdx);
    }
  }

  removeNode = (e: React.MouseEvent<HTMLElement>) => {
    const configIdx: string | null = e.currentTarget.getAttribute('data-config-idx');
    const { removeNode } = this.props;
    if (removeNode && configIdx) {
      return removeNode(+configIdx);
    }
  }

  onSave = this.props.onSave;

  onCancel = this.props.onCancel;

  onDelete = this.props.onDelete;

  shouldComponentUpdate(nextProps: Props) {
    return this.props.forEdit !== nextProps.forEdit
      || this.props.submitting !== nextProps.submitting
      || this.props.algorithm !== nextProps.algorithm
      || this.props.checkPassive !== nextProps.checkPassive
      || this.props.checkBody !== nextProps.checkBody
      || this.props.checkPath !== nextProps.checkPath
      || this.props.port !== nextProps.port
      || this.props.protocol !== nextProps.protocol
      || this.props.healthCheckType !== nextProps.healthCheckType
      || this.props.healthCheckAttempts !== nextProps.healthCheckAttempts
      || this.props.healthCheckInterval !== nextProps.healthCheckInterval
      || this.props.healthCheckTimeout !== nextProps.healthCheckTimeout
      || this.props.sessionStickiness !== nextProps.sessionStickiness
      || this.props.sslCertificate !== nextProps.sslCertificate
      || this.props.privateKey !== nextProps.privateKey
      || !equals(this.props.nodes, nextProps.nodes)
      || !equals(this.props.errors, nextProps.errors);
  }

  render() {
    const {
      algorithm,
      checkBody,
      checkPassive,
      checkPath,
      classes,
      errors,
      forEdit,
      healthCheckAttempts,
      healthCheckInterval,
      healthCheckTimeout,
      healthCheckType,
      nodes,
      port,
      privateKey,
      protocol,
      sessionStickiness,
      sslCertificate,
      submitting,
    } = this.props;

    const hasErrorFor = getAPIErrorFor({
      algorithm: 'Algorithm',
      check_attempts: 'Check attempts',
      check_body: 'Check body',
      check_interval: 'Check interval',
      check_passive: 'Passive check',
      check_path: 'Check path',
      check_timeout: 'Check timeout',
      check: 'Check type',
      cipher_suite: 'Cipher suite',
      port: 'Port',
      protocol: 'Protocol',
      ssl_cert: 'SSL certificate',
      ssl_key: 'SSL private key',
      stickiness: 'Session stickiness',
      nodes: 'Nodes',
    }, errors);

    return (
      <Grid item xs={12}>
        <Paper className={classes.root} data-qa-label-header>
          <div className={classes.inner}>
            <Grid
              updateFor={[
                port,
                protocol,
                hasErrorFor('port'),
                hasErrorFor('protocol'),
              ]}
              container
            >
              <Grid item xs={12}>
                <Typography variant="title">Port Configuration</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  type="number"
                  label="Port"
                  required
                  value={port}
                  onChange={this.onPortChange}
                  errorText={hasErrorFor('port')}
                  data-qa-port
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Protocol"
                  value={protocol}
                  select
                  onChange={this.onProtocolChange}
                  errorText={hasErrorFor('protocol')}
                  data-qa-protocol-select
                >
                  <MenuItem
                    value="tcp"
                    data-qa-option="tcp"
                  >
                    TCP
                  </MenuItem>
                  <MenuItem
                    value="http"
                    data-qa-option="http"
                  >
                    HTTP
                  </MenuItem>
                  <MenuItem
                    value="https"
                    data-qa-option="https"
                  >
                    HTTPS
                  </MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {
              protocol === 'https' &&
              <Grid
                updateFor={[
                  sslCertificate,
                  protocol,
                  hasErrorFor('ssl_cert'),
                  privateKey,
                  hasErrorFor('ssl_key'),
                ]}
                container
              >
                <Grid item xs={12} md={6}>
                  <TextField
                    multiline
                    rows={3}
                    label="SSL Certificate"
                    value={sslCertificate}
                    onChange={this.onSslCertificateChange}
                    required={protocol === 'https'}
                    errorText={hasErrorFor('ssl_cert')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    multiline
                    rows={3}
                    label="Private Key"
                    value={privateKey}
                    onChange={this.onPrivateKeyChange}
                    required={protocol === 'https'}
                    errorText={hasErrorFor('ssl_key')}
                  />
                </Grid>
              </Grid>
            }

            <Grid
              updateFor={[
                algorithm,
                hasErrorFor('algorithm'),
              ]}
              container
            >
              <Grid item xs={12} md={4}>
                <TextField
                  label="Algorithm"
                  value={algorithm}
                  select
                  onChange={this.onAlgorithmChange}
                  errorText={hasErrorFor('algorithm')}
                  data-qa-algorithm-select
                >
                  <MenuItem value="roundrobin" data-qa-option="roundrobin">
                    Round Robin
                  </MenuItem>
                  <MenuItem value="leastconn" data-qa-option="leastconn">
                    Least Connections
                  </MenuItem>
                  <MenuItem value="source" data-qa-option="source">
                    Source
                  </MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Grid
              updateFor={[
                sessionStickiness,
                hasErrorFor('stickiness'),
              ]}
              container
            >
              <Grid item xs={12} md={4}>
                <TextField
                  label="Session Stickiness"
                  value={sessionStickiness}
                  select
                  onChange={this.onSessionStickinessChange}
                  errorText={hasErrorFor('stickiness')}
                  data-qa-session-stickiness-select
                >
                  <MenuItem
                    value="none"
                    data-qa-option="none"
                  >
                    None
                  </MenuItem>
                  <MenuItem
                    value="table"
                    data-qa-option="table"
                  >
                    Table
                  </MenuItem>
                  <MenuItem
                    value="http_cookie"
                    data-qa-option="http_cookie"
                  >
                    HTTP Cookie
                  </MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Divider className={classes.divider} />
              </Grid>
            </Grid>

            <Grid container>
              <Grid
                updateFor={[]} // never update after initial render
                item
                xs={12}
              >
                <Typography
                  variant="title"
                  data-qa-active-checks-header
                >
                  Active Health Checks
                </Typography>
              </Grid>
              <Grid
                updateFor={[
                  protocol,
                  healthCheckType,
                  hasErrorFor('check'),
                ]}
                item
                xs={12}
              >
                <Grid item xs={12} lg={4}>
                  <TextField
                    label="Type"
                    value={healthCheckType}
                    select
                    onChange={this.onHealthCheckTypeChange}
                    errorText={hasErrorFor('check')}
                    data-qa-active-check-select
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem
                      value="connection"
                      disabled={protocol === 'http' || protocol === 'https'}
                    >
                      TCP Connection
                    </MenuItem>

                    <MenuItem
                      value="http"
                      disabled={protocol === 'tcp'}
                    >
                      HTTP Status
                      </MenuItem>

                    <MenuItem
                      value="http_body"
                      disabled={protocol === 'tcp'}
                    >
                      HTTP Body
                    </MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              {
                healthCheckType !== 'none' &&
                <React.Fragment>
                  <Grid
                    updateFor={[
                      healthCheckInterval,
                      hasErrorFor('check_interval'),
                    ]}
                    item
                    xs={12}
                    lg={4}
                  >
                    <TextField
                      type="number"
                      label="Interval"
                      InputProps={{
                        'aria-label': 'Active Health Check Interval',
                        endAdornment: <Typography
                          variant="caption"
                          component="span"
                          className={classes.suffix}>
                          seconds
                        </Typography>,
                      }}
                      value={healthCheckInterval}
                      onChange={this.onHealthCheckIntervalChange}
                      errorText={hasErrorFor('check_interval')}
                      data-qa-active-check-interval
                    />
                  </Grid>
                  <Grid
                    updateFor={[
                      healthCheckTimeout,
                      hasErrorFor('check_timeout'),
                    ]}
                    item
                    xs={12}
                    lg={4}
                  >
                    <TextField
                      type="number"
                      label="Timeout"
                      InputProps={{
                        'aria-label': 'Active Health Check Timeout',
                        endAdornment: <Typography
                          variant="caption"
                          component="span"
                          className={classes.suffix}>
                          seconds
                        </Typography>,
                      }}
                      value={healthCheckTimeout}
                      onChange={this.onHealthCheckTimeoutChange}
                      errorText={hasErrorFor('check_timeout')}
                      data-qa-active-check-timeout
                    />
                  </Grid>
                  <Grid
                    updateFor={[
                      healthCheckAttempts,
                      hasErrorFor('check_attempts'),
                    ]}
                    item
                    xs={12}
                    lg={3}
                  >
                    <TextField
                      type="number"
                      label="Attempts"
                      value={healthCheckAttempts}
                      onChange={this.onHealthCheckAttemptsChange}
                      errorText={hasErrorFor('check_attempts')}
                      InputProps={{
                        'aria-label': 'Active Health Check Attempts',
                      }}
                      data-qa-active-check-attempts
                    />
                  </Grid>
                  {
                    ['http', 'http_body'].includes(healthCheckType) &&
                    <Grid
                      updateFor={[
                        checkPath,
                        healthCheckType,
                        hasErrorFor('check_path'),
                      ]}
                      item
                      xs={12}
                      md={4}
                    >
                      <TextField
                        label="Check HTTP Path"
                        value={checkPath}
                        onChange={this.onCheckPathChange}
                        required={['http', 'http_body'].includes(healthCheckType)}
                        errorText={hasErrorFor('check_path')}
                      />
                    </Grid>
                  }
                  {
                    healthCheckType === 'http_body' &&
                    <Grid
                      updateFor={[
                        checkBody,
                        healthCheckType,
                        hasErrorFor('check_body'),
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
                      />
                    </Grid>
                  }
                </React.Fragment>
              }
              <Grid
                updateFor={[]} // never update after initial render
                item
                xs={12}
              >
                <Divider className={classes.divider} />
              </Grid>
            </Grid>

            <Grid
              updateFor={[checkPassive]}
              container
            >
              <Grid item xs={12}>
                <Typography
                  variant="title"
                  data-qa-passive-checks-header
                >
                  Passive Checks
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Toggle
                      checked={checkPassive}
                      onChange={this.onCheckPassiveChange}
                      data-qa-passive-checks-toggle
                    />
                  }
                  label="Passive Checks"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider className={classes.divider} />
              </Grid>
            </Grid>

            {forEdit &&
              <Grid
                updateFor={[submitting]}
                container
                justify="space-between"
                alignItems="center"
              >
                <Grid item
                  style={{ marginLeft: -16 }}
                >
                  <ActionsPanel>
                    <Button
                      variant="raised"
                      type="primary"
                      onClick={this.onSave}
                      loading={submitting}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={this.onCancel}
                    >
                      Cancel
                    </Button>
                  </ActionsPanel>
                </Grid>
                <Grid item xs={12}>
                  <Divider className={classes.divider} />
                </Grid>
              </Grid>
            }

            <Grid
              updateFor={[
                nodes,
                errors,
              ]}
              container
            >
              <Grid item xs={12}>
                <Typography
                  variant="title"
                  data-qa-backend-ip-header
                >
                  Choose Backend IPs
                </Typography>
                {hasErrorFor('nodes') &&
                  <FormHelperText error>{hasErrorFor('nodes')}</FormHelperText>
                }
              </Grid>
              <Grid item xs={12} style={{ paddingBottom: 24 }}>
                {
                  nodes && nodes.map((node, idx) => {
                    const hasErrorFor = getAPIErrorFor({
                      label: 'label',
                      address: 'address',
                      weight: 'weight',
                      port: 'port',
                    }, node.errors);

                    return (
                      <Grid
                        key={idx}
                        updateFor={[
                          nodes.length,
                          node,
                          errors,
                        ]}
                        container
                      >
                        {idx !== 0 &&
                          <Grid item xs={12}>
                            <Divider style={{ marginTop: 24 }} />
                          </Grid>
                        }
                        <Grid item xs={11} lg={2}>
                          <TextField
                            label="Label"
                            value={node.label}
                            inputProps={{ 'data-config-idx': idx }}
                            onChange={this.onNodeLabelChange}
                            errorText={hasErrorFor('label')}
                            data-qa-backend-ip-label
                          />
                        </Grid>
                        <Grid item xs={11} lg={3}>
                          <TextField
                            label="Address"
                            value={node.address}
                            inputProps={{ 'data-config-idx': idx }}
                            onChange={this.onNodeAddressChange}
                            errorText={hasErrorFor('address')}
                            data-qa-backend-ip-address
                          />
                        </Grid>
                        <Grid item xs={11} lg={2}>
                          <TextField
                            label="Port"
                            value={node.port}
                            inputProps={{ 'data-config-idx': idx }}
                            onChange={this.onNodePortChange}
                            errorText={hasErrorFor('port')}
                            data-qa-backend-ip-port
                          />
                        </Grid>
                        <Grid item xs={11} lg={2}>
                          <TextField
                            label="Weight"
                            value={node.weight}
                            inputProps={{ 'data-config-idx': idx }}
                            onChange={this.onNodeWeightChange}
                            errorText={hasErrorFor('weight')}
                            data-qa-backend-ip-weight
                          />
                        </Grid>
                        <ActionsPanel className={classes.backendIPAction}>
                          {(forEdit && (idx !== (nodes.length - 1))) &&
                            <Button
                              type="primary"
                              data-config-idx={idx}
                              onClick={this.onUpdateNode}
                              loading={node.updating}
                            >
                              Update
                            </Button>
                          }
                          {(idx === (nodes.length - 1)) &&
                            <Button
                              data-config-idx={idx}
                              type="primary"
                              onClick={this.addNode}
                              data-qa-add-node
                            >
                              Add
                            </Button>
                          }
                          {(idx !== (nodes.length - 1)) &&
                            <IconButton
                              data-config-idx={idx}
                              onClick={this.removeNode}
                              destructive
                              data-qa-remove-node
                            >
                              <Delete />
                            </IconButton>
                          }
                        </ActionsPanel>
                      </Grid>
                    );
                  })
                }
              </Grid>

              <Grid updateFor={[]} item xs={12}>
                <Divider className={classes.divider} />
              </Grid>

              <Grid updateFor={[]} item xs={12}>
                <Button
                  onClick={this.onDelete}
                  type="secondary"
                  destructive
                >
                  Delete
                </Button>
              </Grid>

            </Grid>
          </div>
        </Paper>
      </Grid>
    );
  }
}

export default styled<Props>(NodeBalancerConfigPanel);
