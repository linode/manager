import { HTTPRuleSchema, TCPRuleSchema } from '@linode/validation';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import Stack from '@mui/material/Stack';
import { getIn, useFormik } from 'formik';
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
import { useLoadBalancerRouteUpdateMutation } from 'src/queries/aglb/routes';
import { getFormikErrorsFromAPIErrors } from 'src/utilities/formikErrorUtils';

import { ServiceTargetSelect } from '../ServiceTargets/ServiceTargetSelect';
import { MatchTypeInfo } from './MatchTypeInfo';
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

import type { Route, RulePayload } from '@linode/api-v4';

interface Props {
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
  route: Route | undefined;
}

export const AddRuleDrawer = (props: Props) => {
  const { loadbalancerId, onClose: _onClose, open, route } = props;

  const ruleIndex = route?.rules.length ?? 0;

  const validationSchema =
    route?.protocol === 'tcp' ? TCPRuleSchema : HTTPRuleSchema;

  const {
    error,
    mutateAsync: updateRule,
    reset,
  } = useLoadBalancerRouteUpdateMutation(loadbalancerId, route?.id ?? -1);

  const [ttlUnit, setTTLUnit] = useState<TimeUnit>('hour');

  const formik = useFormik<RulePayload>({
    enableReinitialize: true,
    initialValues,
    async onSubmit(rule) {
      try {
        const existingRules = route?.rules ?? [];
        await updateRule({
          protocol: route?.protocol,
          rules: [...existingRules, rule],
        });
        onClose();
      } catch (errors) {
        formik.setErrors(
          getFormikErrorsFromAPIErrors(errors, `rules[${ruleIndex}].`)
        );
      }
    },
    // If we're showing API errors and the user makes a change,
    // formik will clear the API errors because it re-runs the client side validation.
    // Disabling validateOnBlur and validateOnChange when an API error is shown prevents
    // all API errors from disappearing.
    validateOnBlur: !error,
    validateOnChange: !error,
    validationSchema,
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
    formik.values.service_targets.splice(index, 1);
    formik.setFieldValue('service_targets', formik.values.service_targets);
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

  const generalErrors = error
    ?.filter((error) => {
      if (!error.field) {
        return true;
      }

      if (
        route?.protocol === 'tcp' &&
        error.field.includes('match_condition')
      ) {
        return true;
      }

      if (
        route?.protocol === 'http' &&
        !isStickinessEnabled &&
        error.field.includes('match_condition.session_stickiness')
      ) {
        return true;
      }

      if (
        route?.protocol === 'http' &&
        isStickinessEnabled &&
        cookieType.label === 'Origin' &&
        error.field.includes('match_condition.session_stickiness_ttl')
      ) {
        return true;
      }

      if (!error.field.startsWith(`rules[${ruleIndex}]`)) {
        return true;
      }

      return false;
    })
    .map((error) => error.reason)
    .join(', ');

  return (
    <Drawer onClose={onClose} open={open} title="Add Rule" wide>
      <form onSubmit={formik.handleSubmit}>
        {/**
         * @todo: AGLB update copy
         */}
        <Typography sx={{ marginBottom: 2 }}>
          This is how you create a rule and more about how it works.
        </Typography>
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
            {route?.protocol !== 'tcp' && (
              <>
                <TextField
                  errorText={
                    formik.touched.match_condition?.hostname
                      ? formik.errors.match_condition?.hostname
                      : undefined
                  }
                  label="Hostname"
                  labelTooltipText="TODO: AGLB"
                  name="match_condition.hostname"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="www.example.com"
                  value={formik.values.match_condition.hostname}
                />
                <Stack direction="row" spacing={2}>
                  <Autocomplete
                    errorText={
                      formik.touched.match_condition?.match_field
                        ? formik.errors.match_condition?.match_field
                        : undefined
                    }
                    onBlur={() =>
                      formik.setFieldTouched('match_condition.match_field')
                    }
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
                      ) ?? matchTypeOptions[0]
                    }
                    disableClearable
                    label="Match Type"
                    options={matchTypeOptions}
                    sx={{ minWidth: 200 }}
                    textFieldProps={{ labelTooltipText: <MatchTypeInfo /> }}
                  />
                  <TextField
                    errorText={
                      formik.touched.match_condition?.match_value
                        ? formik.errors.match_condition?.match_value
                        : undefined
                    }
                    placeholder={
                      matchValuePlaceholder[
                        formik.values.match_condition.match_field
                      ]
                    }
                    containerProps={{ sx: { flexGrow: 1 } }}
                    label="Match Value"
                    labelTooltipText="TODO: AGLB"
                    name="match_condition.match_value"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.match_condition.match_value}
                  />
                </Stack>
                <Stack alignItems="center" direction="row" gap={2}>
                  <Typography sx={{ fontStyle: 'italic' }}>
                    Routes to
                  </Typography>
                  <Divider light sx={{ flexGrow: 1 }} />
                </Stack>
              </>
            )}
            {typeof formik.errors.service_targets === 'string' && (
              <Notice
                spacingBottom={12}
                spacingTop={16}
                text={formik.errors.service_targets}
                variant="error"
              />
            )}
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
                  errorText={
                    formik.touched.service_targets?.[index]?.percentage
                      ? getIn(
                          formik.errors,
                          `service_targets[${index}].percentage`
                        )
                      : undefined
                  }
                  hideLabel={index !== 0}
                  label="Percent"
                  max={100}
                  min={0}
                  name={`service_targets[${index}].percentage`}
                  noMarginTop
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="number"
                  value={formik.values.service_targets[index].percentage}
                />
                <ServiceTargetSelect
                  errorText={
                    formik.touched.service_targets?.[index]?.id
                      ? getIn(formik.errors, `service_targets[${index}].id`)
                      : undefined
                  }
                  onChange={(serviceTarget) => {
                    formik.setFieldTouched(`service_targets[${index}].id`);
                    formik.setFieldValue(
                      `service_targets[${index}].id`,
                      serviceTarget?.id ?? -1
                    );
                  }}
                  loadbalancerId={loadbalancerId}
                  sx={{ flexGrow: 1 }}
                  textFieldProps={{ hideLabel: index !== 0 }}
                  value={formik.values.service_targets[index].id}
                />
                <IconButton
                  sx={{
                    height: '32px',
                    marginTop: `${index === 0 ? 28 : 2}px !important`,
                    width: '32px',
                  }}
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
          {route?.protocol !== 'tcp' && (
            <Stack spacing={1.5}>
              <Typography variant="h3">Session Stickiness</Typography>
              <Typography>
                Controls how subsequent requests from the same client are routed
                when selecting a backend target. When disabled, no session
                information is saved.
              </Typography>
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
                    errorText={
                      formik.touched.match_condition?.session_stickiness_cookie
                        ? formik.errors.match_condition
                            ?.session_stickiness_cookie
                        : undefined
                    }
                    value={
                      formik.values.match_condition.session_stickiness_cookie ??
                      ''
                    }
                    label="Cookie"
                    labelTooltipText="TODO: AGLB"
                    name="match_condition.session_stickiness_cookie"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    placeholder="my-cookie-name"
                  />
                  {cookieType.label === 'Load Balancer Generated' && (
                    <Stack direction="row" spacing={1}>
                      <TextField
                        errorText={
                          formik.touched.match_condition?.session_stickiness_ttl
                            ? formik.errors.match_condition
                                ?.session_stickiness_ttl
                            : undefined
                        }
                        onChange={(e) =>
                          formik.setFieldValue(
                            'match_condition.session_stickiness_ttl',
                            (e.target as HTMLInputElement).valueAsNumber *
                              timeUnitFactorMap[ttlUnit]
                          )
                        }
                        value={
                          (formik.values.match_condition
                            .session_stickiness_ttl ?? 0) /
                          timeUnitFactorMap[ttlUnit]
                        }
                        label="Stickiness TTL"
                        labelTooltipText="TODO: AGLB"
                        name="match_condition.session_stickiness_ttl"
                        onBlur={formik.handleBlur}
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
                        sx={{ marginTop: '45px !important', minWidth: '140px' }}
                        textFieldProps={{ hideLabel: true }}
                      />
                    </Stack>
                  )}
                </>
              )}
            </Stack>
          )}
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
