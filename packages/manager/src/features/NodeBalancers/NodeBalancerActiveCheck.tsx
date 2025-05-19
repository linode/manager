import {
  Autocomplete,
  InputAdornment,
  SelectedIcon,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import {
  CHECK_ATTEMPTS,
  CHECK_INTERVAL,
  CHECK_TIMEOUT,
} from '@linode/validation';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import { HEALTHCHECK_TYPE_OPTIONS } from './constants';
import { setErrorMap } from './utils';

import type { NodeBalancerConfigPanelProps } from './types';

interface ActiveCheckProps extends NodeBalancerConfigPanelProps {
  errorMap: Record<string, string | undefined>;
}

export const ActiveCheck = (props: ActiveCheckProps) => {
  const flags = useFlags();
  const {
    checkBody,
    checkPath,
    configIdx,
    disabled,
    errors,
    forEdit,
    healthCheckAttempts,
    healthCheckInterval,
    healthCheckTimeout,
    healthCheckType,
    protocol,
    udpCheckPort,
  } = props;

  const errorMap = setErrorMap(errors || []);

  const onCheckBodyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onCheckBodyChange(e.target.value);

  const onCheckPathChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onCheckPathChange(e.target.value);

  const onHealthCheckAttemptsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => props.onHealthCheckAttemptsChange(e.target.value);

  const onHealthCheckIntervalChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => props.onHealthCheckIntervalChange(e.target.value);

  const onHealthCheckTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onHealthCheckTimeoutChange(e.target.value);

  const defaultType = HEALTHCHECK_TYPE_OPTIONS.find((eachType) => {
    return eachType.value === healthCheckType;
  });

  return (
    <Grid
      size={{
        md: 6,
        xs: 12,
      }}
    >
      <Grid container spacing={1} sx={{ padding: 1 }}>
        <Grid size={12}>
          <Typography data-qa-active-checks-header variant="h2">
            Active Health Checks
          </Typography>
        </Grid>
        <Grid size={12}>
          <Autocomplete
            autoHighlight
            disableClearable
            disabled={disabled}
            errorText={errorMap.check}
            helperText="Monitors backends to ensure they’re 'up' and handling requests."
            id={`type-${configIdx}`}
            label="Type"
            noMarginTop
            onChange={(_, selected) =>
              props.onHealthCheckTypeChange(selected.value)
            }
            options={HEALTHCHECK_TYPE_OPTIONS}
            renderOption={(props, option, state) => (
              <li {...props}>
                <Stack
                  alignItems="center"
                  direction="row"
                  flexGrow={1}
                  gap={1}
                  justifyContent="space-between"
                >
                  <Stack>
                    <b>{option.label}</b>
                    {option.description}
                  </Stack>
                  {state.selected && <SelectedIcon />}
                </Stack>
              </li>
            )}
            size="small"
            textFieldProps={{
              dataAttrs: {
                'data-qa-active-check-select': true,
              },
              errorGroup: forEdit ? `${configIdx}` : undefined,
            }}
            value={defaultType || HEALTHCHECK_TYPE_OPTIONS[0]}
          />
        </Grid>
        {healthCheckType !== 'none' && (
          <Grid container>
            {['http', 'http_body'].includes(healthCheckType) && (
              <Grid size={12}>
                <TextField
                  data-testid="http-path"
                  disabled={disabled}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  errorText={errorMap.check_path}
                  label="Check HTTP Path"
                  onChange={onCheckPathChange}
                  required={['http', 'http_body'].includes(healthCheckType)}
                  value={checkPath || ''}
                />
              </Grid>
            )}
            {healthCheckType === 'http_body' && (
              <Grid
                size={{
                  md: 12,
                  xs: 12,
                }}
              >
                <TextField
                  data-testid="http-body"
                  disabled={disabled}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  errorText={errorMap.check_body}
                  label="Expected HTTP Body"
                  onChange={onCheckBodyChange}
                  required={healthCheckType === 'http_body'}
                  value={checkBody}
                />
              </Grid>
            )}
            {flags.udp && protocol === 'udp' && (
              <Grid
                size={{
                  lg: 6,
                }}
              >
                <TextField
                  disabled={disabled}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  errorText={errorMap.udp_check_port}
                  helperText="You can specify the Health Check Port that the backend node listens to, which may differ from the UDP port used to serve traffic."
                  label="Health Check Port"
                  max={65535}
                  min={1}
                  onChange={(e) => props.onUdpCheckPortChange(+e.target.value)}
                  type="number"
                  value={udpCheckPort}
                />
              </Grid>
            )}
            <Grid
              size={{
                lg: 6,
                xs: 12,
              }}
            >
              <TextField
                data-qa-active-check-interval
                disabled={disabled}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                errorText={errorMap.check_interval}
                helperText={`Seconds (${CHECK_INTERVAL.MIN}-${CHECK_INTERVAL.MAX}) between health check probes.`}
                InputProps={{
                  'aria-label': 'Active Health Check Interval',
                  endAdornment: (
                    <InputAdornment position="end">seconds</InputAdornment>
                  ),
                }}
                label="Interval"
                max={CHECK_INTERVAL.MAX}
                min={CHECK_INTERVAL.MIN}
                onChange={onHealthCheckIntervalChange}
                type="number"
                value={healthCheckInterval}
              />
            </Grid>
            <Grid
              size={{
                lg: 6,
                xs: 12,
              }}
            >
              <TextField
                data-qa-active-check-timeout
                disabled={disabled}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                errorText={errorMap.check_timeout}
                helperText={`Seconds to wait (${CHECK_TIMEOUT.MIN}-${CHECK_TIMEOUT.MAX}) before considering the probe a failure. Must be less than Interval.`}
                InputProps={{
                  'aria-label': 'Active Health Check Timeout',
                  endAdornment: (
                    <InputAdornment position="end">seconds</InputAdornment>
                  ),
                }}
                label="Timeout"
                max={CHECK_TIMEOUT.MAX}
                min={CHECK_TIMEOUT.MIN}
                onChange={onHealthCheckTimeoutChange}
                type="number"
                value={healthCheckTimeout}
              />
            </Grid>
            <Grid
              size={{
                lg: 6,
                xs: 12,
              }}
            >
              <TextField
                data-qa-active-check-attempts
                disabled={disabled}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                errorText={errorMap.check_attempts}
                helperText={`Number of failed probes (${CHECK_ATTEMPTS.MIN}-${CHECK_ATTEMPTS.MAX}) before taking a node out of rotation.`}
                InputProps={{
                  'aria-label': 'Active Health Check Attempts',
                }}
                label="Attempts"
                max={CHECK_ATTEMPTS.MAX}
                min={CHECK_ATTEMPTS.MIN}
                onChange={onHealthCheckAttemptsChange}
                type="number"
                value={healthCheckAttempts}
              />
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};
