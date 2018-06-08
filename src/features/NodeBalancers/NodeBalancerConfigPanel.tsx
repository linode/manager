import * as React from 'react';
import { equals, reduce } from 'ramda';
import { withStyles, StyleRulesCallback, WithStyles, Theme, Divider, MenuItem } from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import Delete from 'material-ui-icons/Delete';
import FormControlLabel from 'material-ui/Form/FormControlLabel';

import Button from 'src/components/Button';
import PlusSquare from 'src/assets/icons/plus-square.svg';
import IconTextLink from 'src/components/IconTextLink';
import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import ActionsPanel from 'src/components/ActionsPanel';

type ClassNames = 'root' | 'inner' | 'divider' | 'suffix';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
  divider: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
  },
  suffix: {
    marginRight: theme.spacing.unit * 2,
  },
});

const styled = withStyles(styles, { withTheme: true });

const filterErrors = (idx: number) => reduce((
    prev: Linode.ApiFieldError[],
    next: Linode.ApiFieldError): Linode.ApiFieldError[] => {
  const t = new RegExp(`nodes_${idx}_`);
  return t.test(next.field)
    ? [...prev, { ...next, field: next.field.replace(t, '') }]
    : prev;
}, []);

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
  onNodeWeightChange: (idx: number, value: string) => void;
  onNodeModeChange: (idx: number, value: string) => void;
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

  onProtocolChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onProtocolChange(e.target.value)

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

  onNodeWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const configIdx = e.currentTarget.getAttribute('data-config-idx');
    if (configIdx) {
      this.props.onNodeWeightChange(
        +configIdx,
        e.target.value,
      );
    }
  }

  onNodeModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const configIdx = e.currentTarget.getAttribute('data-config-idx');
    if (configIdx) {
      this.props.onNodeModeChange(
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
      addNode,
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
                <Typography variant="title">Select Port</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  type="number"
                  label="Port"
                  value={port}
                  onChange={this.onPortChange}
                  errorText={hasErrorFor('port')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Protocol"
                  value={protocol}
                  select
                  onChange={this.onProtocolChange}
                  errorText={hasErrorFor('protocol')}
                >
                  <MenuItem value="http">HTTP</MenuItem>
                  <MenuItem value="https">HTTPS</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Divider className={classes.divider} />
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
                <Grid item xs={12}>
                  <Typography variant="title">SSL Settings</Typography>
                </Grid>
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
                <Grid item>
                  <Divider className={classes.divider} />
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
              <Grid item xs={12}>
                <Typography variant="title">Algorithm</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Algorithm"
                  value={algorithm}
                  select
                  onChange={this.onAlgorithmChange}
                  errorText={hasErrorFor('algorithm')}
                >
                  <MenuItem value="roundrobin">Round Robin</MenuItem>
                  <MenuItem value="leastconn">Least Connections</MenuItem>
                  <MenuItem value="source">Source</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Divider className={classes.divider} />
              </Grid>
            </Grid>

            <Grid
              updateFor={[
                sessionStickiness,
                hasErrorFor('stickiness'),
              ]}
              container
            >
              <Grid item xs={12}>
                <Typography variant="title">Session Stickiness</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Session Stickiness"
                  value={sessionStickiness}
                  select
                  onChange={this.onSessionStickinessChange}
                  errorText={hasErrorFor('stickiness')}
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="table">Table</MenuItem>
                  <MenuItem value="http_cookie">HTTP Cookie</MenuItem>
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
                <Typography variant="title">Active Health Checks</Typography>
              </Grid>
              <Grid
                updateFor={[
                  healthCheckType,
                  hasErrorFor('check'),
                ]}
                item
                xs={12}
              >
                <Grid item xs={12} lg={4}>
                  <TextField
                    label="Active Health Check Type"
                    value={healthCheckType}
                    select
                    onChange={this.onHealthCheckTypeChange}
                    errorText={hasErrorFor('check')}
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="connection">TCP Connection</MenuItem>
                    <MenuItem value="http">HTTP Status</MenuItem>
                    <MenuItem value="http_body">HTTP Body</MenuItem>
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
                      label="Health Check Interval"
                      InputProps={{
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
                      label="Health Check Timeout"
                      InputProps={{
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
                      label="Health Check Attempts"
                      value={healthCheckAttempts}
                      onChange={this.onHealthCheckAttemptsChange}
                      errorText={hasErrorFor('check_attempts')}
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
                        md={6}
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
                        md={6}
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
                <Typography variant="title">Passive Checks</Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Toggle
                      checked={checkPassive}
                      onChange={this.onCheckPassiveChange}
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
                <Grid item>
                  <Button
                    onClick={this.onDelete}
                    type="secondary"
                    destructive
                  >
                    Delete
                  </Button>
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
                <Typography variant="title">Choose Backend IPs</Typography>
              </Grid>
              <Grid item xs={12}>
                {
                  nodes && nodes.map((node, idx) => {
                    const hasErrorFor = getAPIErrorFor({
                      label: 'label',
                      address: 'address',
                      weight: 'weight',
                      mode: 'mode',
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
                        alignItems="flex-end"
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
                          />
                        </Grid>
                        <Grid item xs={11} lg={3}>
                          <TextField
                            label="Address"
                            value={node.address}
                            inputProps={{ 'data-config-idx': idx }}
                            onChange={this.onNodeAddressChange}
                            errorText={hasErrorFor('address')}
                          />
                        </Grid>
                        <Grid item xs={11} lg={forEdit ? 2 : 3}>
                          <TextField
                            label="Weight"
                            value={node.weight}
                            inputProps={{ 'data-config-idx': idx }}
                            onChange={this.onNodeWeightChange}
                            errorText={hasErrorFor('weight')}
                          />
                        </Grid>
                        <Grid item xs={11} lg={forEdit ? 2 : 3}>
                          <TextField
                            label="Mode"
                            value={node.mode}
                            select
                            inputProps={{ 'data-config-idx': idx }}
                            onChange={this.onNodeModeChange}
                            errorText={hasErrorFor('mode')}
                          >
                            <MenuItem value="accept">Accept</MenuItem>
                            <MenuItem value="reject">Reject</MenuItem>
                            <MenuItem value="drain">Drain</MenuItem>
                          </TextField>
                        </Grid>
                        {(forEdit && idx !== (nodes.length - 1)) &&
                          <Grid item xs={5} lg={2}>
                            <Button
                              type="primary"
                              data-config-idx={idx}
                              onClick={this.onUpdateNode}
                              loading={node.updating}
                            >
                              Update
                            </Button>
                          </Grid>
                        }
                        {(forEdit && idx === (nodes.length - 1)) &&
                          <Grid item xs={5} lg={2}>
                            <Button
                              data-config-idx={idx}
                              type="primary"
                              onClick={this.addNode}
                            >
                              Add
                            </Button>
                          </Grid>
                        }
                        <Grid item xs={5} lg={1}>
                          {/**
                            * Show the delete button for index 0 if we are
                            * editing the Config. Don't show the delete button
                            * for the final index if we are editing the Config.
                            **/}
                          {(forEdit ? idx !== (nodes.length - 1) : idx !== 0) &&
                            <IconButton data-config-idx={idx} onClick={this.removeNode}>
                              <Delete />
                            </IconButton>
                          }
                        </Grid>
                      </Grid>
                    );
                  })
                }
              </Grid>
              {/* Adding nodes is done in-line when editing the Config */}
              {!forEdit &&
                <Grid
                  updateFor={[]} // never update after the initial render
                  item xs={12}
                >
                  <IconTextLink
                    SideIcon={PlusSquare}
                    onClick={addNode}
                    title="Add a Node"
                    text="Add a Node"
                  >
                    Add a Node
                  </IconTextLink>
                </Grid>
              }
            </Grid>
          </div>
        </Paper>
      </Grid>
    );
  }
}

export default styled<Props>(NodeBalancerConfigPanel);
