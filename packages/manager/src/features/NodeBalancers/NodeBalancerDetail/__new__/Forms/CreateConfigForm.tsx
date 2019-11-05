import {
  Algorithm,
  Check,
  NodeBalancerConfig,
  Protocol,
  Stickiness
} from 'linode-js-sdk/lib/nodebalancers';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { compose } from 'recompose';

import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import { Item } from 'src/components/EnhancedSelect/Select';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';

import AlgorithmField from './Fields/Algorithm';
import CheckField from './Fields/Check';
import CheckAttemptsField from './Fields/CheckAttempts';
import CheckBodyField from './Fields/CheckBody';
import CheckIntervalField from './Fields/CheckInterval';
import CheckPassiveField from './Fields/CheckPassive';
import CheckPathField from './Fields/CheckPath';
import CheckTimeoutField from './Fields/CheckTimeout';
import PortField from './Fields/Port';
import ProtocolField from './Fields/Protocol';
import SSLCertField from './Fields/SSLCert';
import SSLKeyField from './Fields/SSLKey';
import StickinessField from './Fields/Stickiness';

import { getErrorMap } from 'src/utilities/errorUtils';

import ActionsPanel from './ActionsPanel';
import useFormStyles from './form.styles';

import { CreateNodeBalancerConfigParams } from 'src/store/nodeBalancerConfig/nodeBalancerConfig.actions';

interface Props {
  userCannotCreateNodeBalancerConfig: boolean;
  createConfig: (
    payload: CreateNodeBalancerConfigParams
  ) => Promise<NodeBalancerConfig>;
  deleteConfig: () => void;
  onSuccessfulCreate: () => void;
  nodeBalancerID: number;
}

type CombinedProps = Props;

const CreateConfigForm: React.FC<CombinedProps> = props => {
  const classes = useFormStyles();

  const { userCannotCreateNodeBalancerConfig } = props;

  const [port, setPort] = React.useState<number>(80);
  const [protocol, setProtocol] = React.useState<Protocol>('http');
  const [algorithm, setAlgorithm] = React.useState<Algorithm>('roundrobin');
  const [stickiness, setStickiness] = React.useState<Stickiness>('table');
  const [checkAttempts, setCheckAttempts] = React.useState<number>(2);
  const [checkInterval, setCheckInterval] = React.useState<number>(5);
  const [checkPassive, setCheckPassive] = React.useState<boolean>(true);
  const [checkTimeout, setCheckTimeout] = React.useState<number>(3);
  const [check, setCheck] = React.useState<Check>('none');
  const [sslCert, setSSLCert] = React.useState<string>('');
  const [sslKey, setSSLKey] = React.useState<string>('');
  const [checkBody, setCheckBody] = React.useState<string>('');
  const [checkPath, setCheckPath] = React.useState<string>('');

  /** @todo we don't let the user edit this - find out why and document here */
  // const [cipherSuite, setCipherSuite] = React.useState<CipherSuite>('recommended');

  const [isCreatingConfig, setCreatingConfig] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>();

  const _createConfig = () => {
    setCreatingConfig(true);

    const basePayload: CreateNodeBalancerConfigParams = {
      port,
      nodeBalancerId: props.nodeBalancerID,
      stickiness,
      protocol,
      algorithm,
      ssl_cert: sslCert,
      ssl_key: sslKey,
      check,
      check_attempts: checkAttempts,
      check_body: checkBody,
      check_passive: checkPassive,
      check_path: checkPath,
      check_interval: checkInterval,
      check_timeout: checkTimeout
    };

    /**
     * optional pieces that can be deleted from the payload if empty
     */
    if (!checkPassive) {
      delete basePayload.check_passive;
    }

    if (!checkPath) {
      delete basePayload.check_path;
    }

    if (!checkInterval) {
      delete basePayload.check_interval;
    }

    if (!checkTimeout) {
      delete basePayload.check_timeout;
    }

    return props
      .createConfig(basePayload)
      .then(config => {
        setCreatingConfig(false);
        props.onSuccessfulCreate();
        return config;
      })
      .catch(e => {
        setErrors(e);
        setCreatingConfig(false);
      });
  };

  const errorMap = getErrorMap(
    [
      'port',
      'protocol',
      'algorithm',
      'stickiness',
      'check_attempts',
      'check_interval',
      'check_passive',
      'check_timeout',
      'check',
      'ssl_cert',
      'ssl_key',
      'check_body',
      'check_path',
      'cipher_suite'
    ],
    errors
  );

  return (
    <ExpansionPanel heading={`Port ${port}`} defaultExpanded>
      <Paper data-qa-label-header>
        {errorMap.none && <Notice error text={errorMap.none} />}
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="h2" data-qa-port-config-header>
              Port Configuration
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <PortField
              value={port}
              onChange={e => setPort(+e.target.value)}
              errorText={errorMap.port}
              disabled={userCannotCreateNodeBalancerConfig}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <ProtocolField
              value={protocol}
              onChange={(e: Item<Protocol>) => setProtocol(e.value)}
              errorText={errorMap.protocol}
              disabled={userCannotCreateNodeBalancerConfig}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <AlgorithmField
              value={algorithm}
              onChange={(e: Item<Algorithm>) => setAlgorithm(e.value)}
              errorText={errorMap.algorithm}
              disabled={userCannotCreateNodeBalancerConfig}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <StickinessField
              value={stickiness}
              onChange={(e: Item<Stickiness>) => setStickiness(e.value)}
              errorText={errorMap.stickiness}
              disabled={userCannotCreateNodeBalancerConfig}
            />
          </Grid>

          {protocol === 'https' && (
            /** when the user has an https protocol, we ask for the SSL cert and key */
            <Grid item xs={12}>
              <Grid item xs={12}>
                <SSLCertField
                  value={sslCert}
                  onChange={e => setSSLCert(e.target.value)}
                  errorText={errorMap.ssl_cert}
                  disabled={userCannotCreateNodeBalancerConfig}
                />
              </Grid>
              <Grid item xs={12}>
                <SSLKeyField
                  value={sslKey}
                  onChange={e => setSSLKey(e.target.value)}
                  errorText={errorMap.ssl_key}
                  disabled={userCannotCreateNodeBalancerConfig}
                />
              </Grid>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider type="landingHeader" className={classes.divider} />
          </Grid>

          <Grid item xs={12} md={6} className={classes.checkGrid}>
            <Typography
              variant="h2"
              data-qa-active-checks-header
              className={classes.checksHeaders}
            >
              Active Health Checks
            </Typography>

            <Grid item xs={12}>
              <CheckField
                value={check}
                onChange={(e: Item<Check>) => setCheck(e.value)}
                errorText={errorMap.check}
                disabled={userCannotCreateNodeBalancerConfig}
                protocol={protocol}
              />
            </Grid>

            {check !== 'none' && (
              <React.Fragment>
                <Grid item xs={12}>
                  <CheckIntervalField
                    value={checkInterval}
                    onChange={e => setCheckInterval(+e.target.value)}
                    errorText={errorMap.check}
                    disabled={userCannotCreateNodeBalancerConfig}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CheckTimeoutField
                    value={checkTimeout}
                    onChange={e => setCheckTimeout(+e.target.value)}
                    errorText={errorMap.check_timeout}
                    disabled={userCannotCreateNodeBalancerConfig}
                    small
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <CheckAttemptsField
                    value={checkAttempts}
                    errorText={errorMap.check_attempts}
                    onChange={e => setCheckAttempts(+e.target.value)}
                    disabled={userCannotCreateNodeBalancerConfig}
                  />
                </Grid>
                {(check === 'http' || check === 'http_body') && (
                  <Grid item xs={12} lg={6}>
                    <CheckPathField
                      value={checkPath}
                      onChange={e => setCheckPath(e.target.value)}
                      errorText={errorMap.check_path}
                      disabled={userCannotCreateNodeBalancerConfig}
                    />
                  </Grid>
                )}
                {check === 'http_body' && (
                  <Grid item xs={12} lg={6}>
                    <CheckBodyField
                      value={checkBody}
                      onChange={e => setCheckBody(e.target.value)}
                      errorText={errorMap.check_body}
                      disabled={userCannotCreateNodeBalancerConfig}
                    />
                  </Grid>
                )}
              </React.Fragment>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              data-qa-passive-checks-header
              className={classes.checksHeaders}
            >
              Passive Checks
            </Typography>
            <CheckPassiveField
              checked={checkPassive}
              onChange={() => setCheckPassive(!checkPassive)}
              data-qa-passive-checks-toggle={checkPassive}
              disabled={userCannotCreateNodeBalancerConfig}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider type="landingHeader" className={classes.divider} />
          </Grid>

          <Grid item xs={12}>
            <ActionsPanel
              userCannotCreateConfig={userCannotCreateNodeBalancerConfig}
              onSubmit={_createConfig}
              onDelete={props.deleteConfig}
              isSubmitting={isCreatingConfig}
            />
          </Grid>
        </Grid>
      </Paper>
    </ExpansionPanel>
  );
};

export default compose<CombinedProps, Props>(React.memo)(CreateConfigForm);
