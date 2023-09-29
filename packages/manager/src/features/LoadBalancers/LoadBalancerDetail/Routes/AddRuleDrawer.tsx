import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import Stack from '@mui/material/Stack';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { Drawer } from 'src/components/Drawer';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { InputAdornment } from 'src/components/InputAdornment';
import { LinkButton } from 'src/components/LinkButton';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Toggle } from 'src/components/Toggle';
import { Typography } from 'src/components/Typography';
import { useLoadbalancerRouteUpdateMutation } from 'src/queries/aglb/routes';

import { ServiceTargetSelect } from '../ServiceTargets/ServiceTargetSelect';
import {
  TimeUnit,
  defaultServiceTarget,
  defaultTTL,
  getIsSessionStickinessEnabled,
  initialValues,
  matchTypeOptions,
  matchValuePlaceholder,
  stickyOptions,
  timeUnitFactorMap,
  timeUnitOptions,
} from './utils';

import type { MatchCondition, Route, RulePayload } from '@linode/api-v4';
import { MatchTypeInfo } from './MatchTypeInfo';

interface Props {
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
  route: Route | undefined;
}

export const AddRuleDrawer = (props: Props) => {
  const { loadbalancerId, onClose: _onClose, open, route } = props;

  const ruleIndex = route?.rules.length ?? 0;

  const {
    error,
    mutateAsync: updateRule,
    reset,
  } = useLoadbalancerRouteUpdateMutation(loadbalancerId, route?.id ?? -1);

  const [ttlUnit, setTTLUnit] = useState<TimeUnit>('hour');

  const formik = useFormik<RulePayload>({
    enableReinitialize: true,
    initialValues,
    async onSubmit(rule) {
      if (!route) {
        return;
      }
      await updateRule({ rules: [...route.rules, rule] });
      onClose();
    },
  });

  const onClose = () => {
    _onClose();
    formik.resetForm();
    reset();
    setTTLUnit('hour');
  };

  const onAddServiceTarget = () => {
    formik.setFieldValue('service_targets', [
      ...formik.values.service_targets,
      defaultServiceTarget,
    ]);
  };

  const onRemoveServiceTarget = (index: number) => {
    // Reset the React query mutation to clear errors
    reset();
    formik.values.service_targets.splice(index, 1);
    formik.setFieldValue('service_targets', formik.values.service_targets);
  };

  const getServiceTargetError = (index: number, field: 'id' | 'percentage') => {
    return error?.find(
      (e) =>
        e.field === `rules[${ruleIndex}].service_targets[${index}].${field}`
    )?.reason;
  };

  const getMatchConditionError = (field: keyof MatchCondition) => {
    return error?.find(
      (e) => e.field === `rules[${ruleIndex}].match_condition.${field}`
    )?.reason;
  };

  const onStickinessChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (checked) {
      formik.setFieldValue(
        'match_condition.session_stickiness_ttl',
        defaultTTL
      );
    } else {
      formik.setFieldValue('match_condition.session_stickiness_ttl', null);
      formik.setFieldValue('match_condition.session_stickiness_cookie', null);
    }
  };

  const isStickinessEnabled = getIsSessionStickinessEnabled(formik.values);

  const cookieType =
    formik.values.match_condition.session_stickiness_ttl === null
      ? stickyOptions[1]
      : stickyOptions[0];

  const stickinessGeneralError = !isStickinessEnabled
    ? error
        ?.filter((e) =>
          e.field?.startsWith(
            `rules[${ruleIndex}].match_condition.session_stickiness`
          )
        )
        .map((e) => e.reason)
        .join(', ')
    : cookieType.label === 'Origin'
    ? error?.find(
        (e) =>
          e.field ===
          `rules[${ruleIndex}].match_condition.session_stickiness_ttl`
      )?.reason
    : null;

  const generalErrors = error
    ?.filter(
      (error) =>
        !error.field ||
        (route?.protocol === 'tcp' &&
          (error.field.includes('match_condition.match_field') ||
            error.field.includes('match_condition.match_value')))
    )
    .map((error) => error.reason)
    .join(', ');

  return (
    <Drawer onClose={onClose} open={open} title="Add Rule" wide>
      <form onSubmit={formik.handleSubmit}>
        {generalErrors && <Notice text={generalErrors} variant="error" />}
        <Stack spacing={2}>
          <Stack bgcolor={(theme) => theme.bg.app} p={2.5} spacing={1.5}>
            <Typography variant="h3">Match Rule</Typography>
            {route?.protocol === 'tcp' ? (
              <Typography>
                A TCP rule consists a percent allocation to a Service Target.
              </Typography>
            ) : (
              <Typography>
                A rule consists of a match type, and a pattern to match on
                called a match value. Each rule can specify only one field or
                pattern pair.
              </Typography>
            )}
            <TextField
              errorText={getMatchConditionError('hostname')}
              label="Hostname"
              labelTooltipText="TODO: AGLB"
              name="match_condition.hostname"
              onChange={formik.handleChange}
              value={formik.values.match_condition.hostname}
            />
            {route?.protocol !== 'tcp' && (
              <Stack direction="row" spacing={2}>
                <Autocomplete
                  onChange={(_, option) =>
                    formik.setFieldValue(
                      'match_condition.match_field',
                      option?.value ?? null
                    )
                  }
                  value={
                    matchTypeOptions.find(
                      (option) =>
                        option.value ===
                        formik.values.match_condition.match_field
                    ) ?? null
                  }
                  errorText={getMatchConditionError('match_field')}
                  label="Match Type"
                  options={matchTypeOptions}
                  sx={{ minWidth: 200 }}
                  textFieldProps={{ labelTooltipText: <MatchTypeInfo /> }}
                />
                <TextField
                  placeholder={
                    matchValuePlaceholder[
                      formik.values.match_condition.match_field
                    ]
                  }
                  containerProps={{ sx: { flexGrow: 1 } }}
                  errorText={getMatchConditionError('match_value')}
                  label="Match Value"
                  labelTooltipText="TODO: AGLB"
                  name="match_condition.match_value"
                  onChange={formik.handleChange}
                  value={formik.values.match_condition.match_value}
                />
              </Stack>
            )}
            <Stack alignItems="center" direction="row" gap={2}>
              <Typography>Routes to</Typography>
              <Divider light sx={{ flexGrow: 1 }} />
            </Stack>
            {formik.values.service_targets.map((serviceTargt, index) => (
              <Stack
                direction="row"
                key={`${serviceTargt.id}-${index}`}
                spacing={2}
              >
                <TextField
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                  errorText={getServiceTargetError(index, 'percentage')}
                  hideLabel={index !== 0}
                  label="Percent"
                  max={100}
                  min={0}
                  name={`service_targets[${index}].percentage`}
                  noMarginTop
                  onChange={formik.handleChange}
                  type="number"
                  value={formik.values.service_targets[index].percentage}
                />
                <ServiceTargetSelect
                  onChange={(serviceTarget) =>
                    formik.setFieldValue(
                      `service_targets[${index}].id`,
                      serviceTarget?.id ?? -1
                    )
                  }
                  errorText={getServiceTargetError(index, 'id')}
                  loadbalancerId={loadbalancerId}
                  sx={{ flexGrow: 1 }}
                  textFieldProps={{ hideLabel: index !== 0 }}
                  value={formik.values.service_targets[index].id}
                />
                <IconButton
                  sx={
                    index === 0
                      ? { marginTop: '24px !important', padding: 0 }
                      : { padding: 0 }
                  }
                  aria-label={`Remove Service Target ${index}`}
                  onClick={() => onRemoveServiceTarget(index)}
                >
                  <CloseIcon />
                </IconButton>
              </Stack>
            ))}
            <Box>
              <LinkButton onClick={onAddServiceTarget}>
                Add Service Target
              </LinkButton>
            </Box>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="h3">Session Stickiness</Typography>
            <Typography>
              Controls how subsequent requests from the same client are routed
              when selecting a backend target. When disabled, no session
              information is saved.
            </Typography>
            {stickinessGeneralError && (
              <Notice
                spacingBottom={0}
                spacingTop={12}
                text={stickinessGeneralError}
                variant="error"
              />
            )}
            <FormControlLabel
              control={
                <Toggle
                  checked={isStickinessEnabled}
                  onChange={onStickinessChange}
                  sx={{ marginLeft: -1.5 }}
                />
              }
              label="Use Session Stickiness"
            />
            {isStickinessEnabled && (
              <>
                <Autocomplete
                  onChange={(_, option) => {
                    formik.setFieldValue(
                      'match_condition.session_stickiness_ttl',
                      option?.label === 'Load Balancer Generated'
                        ? defaultTTL
                        : null
                    );
                    formik.setFieldValue(
                      'match_condition.session_stickiness_cookie',
                      option?.label === 'Load Balancer Generated' ? null : ''
                    );
                  }}
                  disableClearable
                  label="Cookie type"
                  options={stickyOptions}
                  textFieldProps={{ labelTooltipText: 'TODO: AGLB' }}
                  value={cookieType}
                />
                <TextField
                  errorText={getMatchConditionError(
                    'session_stickiness_cookie'
                  )}
                  value={
                    formik.values.match_condition.session_stickiness_cookie
                  }
                  label="Cookie"
                  labelTooltipText="TODO: AGLB"
                  name="match_condition.session_stickiness_cookie"
                  onChange={formik.handleChange}
                  placeholder="my-cookie-name"
                />
                {cookieType.label === 'Load Balancer Generated' && (
                  <Stack alignItems="flex-end" direction="row" spacing={1}>
                    <TextField
                      errorText={getMatchConditionError(
                        'session_stickiness_ttl'
                      )}
                      onChange={(e) =>
                        formik.setFieldValue(
                          'match_condition.session_stickiness_ttl',
                          (e.target as HTMLInputElement).valueAsNumber *
                            timeUnitFactorMap[ttlUnit]
                        )
                      }
                      value={
                        (formik.values.match_condition.session_stickiness_ttl ??
                          0) / timeUnitFactorMap[ttlUnit]
                      }
                      label="Stickiness TTL"
                      labelTooltipText="TODO: AGLB"
                      name="match_condition.session_stickiness_ttl"
                      type="number"
                    />
                    <Autocomplete
                      onChange={(_, option) => {
                        const currentTTLUnit = ttlUnit;

                        const factor =
                          timeUnitFactorMap[option.key] /
                          timeUnitFactorMap[currentTTLUnit];

                        setTTLUnit(option.key);

                        if (
                          formik.values.match_condition.session_stickiness_ttl
                        ) {
                          const oldValue =
                            formik.values.match_condition
                              .session_stickiness_ttl;

                          formik.setFieldValue(
                            'match_condition.session_stickiness_ttl',
                            oldValue * factor
                          );
                        }
                      }}
                      value={timeUnitOptions.find(
                        (option) => option.key === ttlUnit
                      )}
                      disableClearable
                      label="test"
                      options={timeUnitOptions}
                      textFieldProps={{ hideLabel: true }}
                    />
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </Stack>
        <ActionsPanel
          primaryButtonProps={{
            label: 'Add Rule',
            loading: formik.isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </form>
    </Drawer>
  );
};
