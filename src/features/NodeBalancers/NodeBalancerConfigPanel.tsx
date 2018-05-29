import * as React from 'react';
import {
  compose,
  isEmpty,
  not,
  when,
} from 'ramda';
import { withStyles, StyleRulesCallback, WithStyles, Theme, Divider, MenuItem } from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';
import CheckBox from 'src/components/CheckBox';

const parseFormNumber: (s: string) => (string | number) =
  when(compose(not, isEmpty), (v: string) => +v);

type ClassNames = 'root' | 'inner' | 'divider';

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
});

const styled = withStyles(styles, { withTheme: true });

interface Props {
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
}

type CombinedProps = Props & WithStyles<ClassNames>;

class NodeBalancerConfigPanel extends React.Component<CombinedProps> {

  static defaultProps: Partial<Props> = {
  };

  render() {
    const {
      classes,

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
    } = this.props;

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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Protocol"
                value={protocol}
                select
                onChange={e => onProtocolChange(e.target.value)}
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
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  multiline
                  rows={3}
                  label="Private Key"
                  value={privateKey}
                  onChange={e => onPrivateKeyChange(e.target.value)}
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
                    value={healthCheckInterval}
                    onChange={e => onHealthCheckIntervalChange(parseFormNumber(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    type="number"
                    label="Health Check Timeout"
                    value={healthCheckTimeout}
                    onChange={e => onHealthCheckTimeoutChange(parseFormNumber(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    type="number"
                    label="Health Check Attempts"
                    value={healthCheckAttempts}
                    onChange={e => onHealthCheckAttemptsChange(parseFormNumber(e.target.value))}
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
        </div>
      </Paper>
    );
  }
}

export default styled<Props>(NodeBalancerConfigPanel);
