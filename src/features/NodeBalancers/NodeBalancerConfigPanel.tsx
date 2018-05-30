import * as React from 'react';
import { reduce, compose, isEmpty, not, when } from 'ramda';
import { withStyles, StyleRulesCallback, WithStyles, Theme, Divider, MenuItem } from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import PlusSquare from 'src/assets/icons/plus-square.svg';
import IconTextLink from 'src/components/IconTextLink';
import Button from 'src/components/Button';
import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';
import CheckBox from 'src/components/CheckBox';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

const parseFormNumber: (s: string) => (string | number) =
  when(compose(not, isEmpty), (v: string) => +v);

type ClassNames = 'root' | 'inner' | 'divider' | 'suffix';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.color.white,
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
  addNode: () => void;
  removeNode: (configId: number) => void;
  onNodeLabelChange: (idx: number, value: string) => void;
  onNodeAddressChange: (idx: number, value: string) => void;
  onNodeWeightChange: (idx: number, value: number) => void;
  onNodeModeChange: (idx: number, value: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class NodeBalancerConfigPanel extends React.Component<CombinedProps> {

  static defaultProps: Partial<Props> = {
  };

  render() {
    const {
      classes,

      errors,

      algorithm,
      onAlgorithmChange,

      checkBody,
      onCheckBodyChange,

      checkPath,
      onCheckPathChange,

      checkPassive,
      onCheckPassiveChange,

      healthCheckAttempts,
      onHealthCheckAttemptsChange,

      healthCheckInterval,
      onHealthCheckIntervalChange,

      healthCheckTimeout,
      onHealthCheckTimeoutChange,

      healthCheckType,
      onHealthCheckTypeChange,

      port,
      onPortChange,

      privateKey,
      onPrivateKeyChange,

      protocol,
      onProtocolChange,

      sessionStickiness,
      onSessionStickinessChange,

      sslCertificate,
      onSslCertificateChange,

      nodes,
      addNode,
      removeNode,
      onNodeLabelChange,
      onNodeAddressChange,
      onNodeWeightChange,
      onNodeModeChange,
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
      <Paper className={classes.root} data-qa-label-header>
        <div className={classes.inner}>

          <Grid container>
            <Grid item xs={12}>
              <Typography variant="title">Select Port</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                type="number"
                label="Port"
                value={port}
                onChange={e => onPortChange(parseFormNumber(e.target.value))}
                errorText={hasErrorFor('port')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Protocol"
                value={protocol}
                select
                onChange={e => onProtocolChange(e.target.value)}
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
            <Grid container>
              <Grid item xs={12}>
                <Typography variant="title">SSL Settings</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  multiline
                  rows={3}
                  label="SSL Certificate"
                  value={sslCertificate}
                  onChange={e => onSslCertificateChange(e.target.value)}
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
                  onChange={e => onPrivateKeyChange(e.target.value)}
                  required={protocol === 'https'}
                  errorText={hasErrorFor('ssl_key')}
                />
              </Grid>
              <Grid item>
                <Divider className={classes.divider} />
              </Grid>
            </Grid>
          }

          <Grid container>
            <Grid item xs={12}>
              <Typography variant="title">Algorithm</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Algorithm"
                value={algorithm}
                select
                onChange={e => onAlgorithmChange(e.target.value)}
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

          <Grid container>
            <Grid item xs={12}>
              <Typography variant="title">Session Stickiness</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Session Stickiness"
                value={sessionStickiness}
                select
                onChange={e => onSessionStickinessChange(e.target.value)}
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
            <Grid item xs={12}>
              <Typography variant="title">Active Health Checks</Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Active Health Check Type"
                  value={healthCheckType}
                  select
                  onChange={e => onHealthCheckTypeChange(e.target.value)}
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
                <Grid item xs={12} md={4}>
                  <TextField
                    type="number"
                    label="Health Check Interval"
                    InputProps={{
                      endAdornment: <Typography
                        variant="caption"
                        component="span"
                        className={classes.suffix}>
                        / second
                      </Typography>,
                    }}
                    value={healthCheckInterval}
                    onChange={e => onHealthCheckIntervalChange(parseFormNumber(e.target.value))}
                    errorText={hasErrorFor('check_interval')}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    type="number"
                    label="Health Check Timeout"
                    InputProps={{
                      endAdornment: <Typography
                        variant="caption"
                        component="span"
                        className={classes.suffix}>
                        / second
                      </Typography>,
                    }}
                    value={healthCheckTimeout}
                    onChange={e => onHealthCheckTimeoutChange(parseFormNumber(e.target.value))}
                    errorText={hasErrorFor('check_timeout')}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    type="number"
                    label="Health Check Attempts"
                    value={healthCheckAttempts}
                    onChange={e => onHealthCheckAttemptsChange(parseFormNumber(e.target.value))}
                    errorText={hasErrorFor('check_attempts')}
                  />
                </Grid>
                {
                  ['http', 'http_body'].includes(healthCheckType) &&
                  <React.Fragment>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Check HTTP Path"
                        value={checkPath}
                        onChange={e => onCheckPathChange(e.target.value)}
                        required={['http', 'http_body'].includes(healthCheckType)}
                        errorText={hasErrorFor('check_path')}
                      />
                    </Grid>
                  </React.Fragment>
                }
                {
                  healthCheckType === 'http_body' &&
                  <React.Fragment>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Expected HTTP Body"
                        value={checkBody}
                        onChange={e => onCheckBodyChange(e.target.value)}
                        required={healthCheckType === 'http_body'}
                        errorText={hasErrorFor('check_body')}
                      />
                    </Grid>
                  </React.Fragment>
                }
              </React.Fragment>
            }
            <Grid item xs={12}>
              <Divider className={classes.divider} />
            </Grid>
          </Grid>

          <Grid container>
            <Grid item xs={12}>
              <Typography variant="title">Passive Checks</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <CheckBox
                checked={checkPassive}
                onChange={(e, value) => onCheckPassiveChange(value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider className={classes.divider} />
            </Grid>
          </Grid>

          <Grid container>
            <Grid item xs={12}>
              <Typography variant="title">Choose Backend IPs</Typography>
            </Grid>
            <Grid item xs={12}>
              {
                nodes.map((node, idx) => {
                  const hasErrorFor = getAPIErrorFor({
                    label: 'label',
                    address: 'address',
                    weight: 'weight',
                    mode: 'mode',
                  }, filterErrors(idx)(errors || []));

                  return (
                    <Grid key={idx} container>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Label"
                          value={node.label}
                          onChange={e => onNodeLabelChange(idx, e.target.value)}
                          errorText={hasErrorFor('label')}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Address"
                          value={node.address}
                          onChange={e => onNodeAddressChange(idx, e.target.value)}
                          errorText={hasErrorFor('address')}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Weight"
                          type="number"
                          value={node.weight}
                          onChange={e => onNodeWeightChange(idx, e.target.valueAsNumber)}
                          errorText={hasErrorFor('weight')}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Mode"
                          value={node.mode}
                          select
                          onChange={e => onNodeModeChange(idx, e.target.value)}
                          errorText={hasErrorFor('mode')}
                        >
                          <MenuItem value="accept">Accept</MenuItem>
                          <MenuItem value="reject">Reject</MenuItem>
                          <MenuItem value="drain">Drain</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        {idx !== 0 && <Button onClick={() => removeNode(idx)}>Delete</Button>}
                      </Grid>
                    </Grid>
                  );
                })
              }
            </Grid>
            <Grid item xs={12}>
              <IconTextLink
                SideIcon={PlusSquare}
                onClick={addNode}
                title="Add a Node"
                text="Add a Node"
              >
                Add a Node
            </IconTextLink>
            </Grid>
          </Grid>
        </div>
      </Paper>
    );
  }
}

export default styled<Props>(NodeBalancerConfigPanel);
