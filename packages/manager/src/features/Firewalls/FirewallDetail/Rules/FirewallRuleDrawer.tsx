import { Drawer, Notice, Radio, Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { Grid } from '@mui/material';
import { Formik } from 'formik';
import * as React from 'react';

import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';

import { useIsFirewallRulesetsPrefixlistsEnabled } from '../../shared';
import {
  formValueToIPs,
  getInitialFormValues,
  getInitialIPs,
  itemsToPortString,
  portStringToItems,
  validateForm,
  validateIPs,
} from './FirewallRuleDrawer.utils';
import { FirewallRuleForm } from './FirewallRuleForm';
import { FirewallRuleSetDetailsView } from './FirewallRuleSetDetailsView';
import { FirewallRuleSetForm } from './FirewallRuleSetForm';
import { firewallRuleCreateOptions } from './shared';

import type { FirewallOptionItem } from '../../shared';
import type {
  FirewallCreateEntityType,
  FirewallRuleDrawerProps,
  FormRuleSetState,
  FormState,
} from './FirewallRuleDrawer.types';
import type {
  FirewallRuleProtocol,
  FirewallRuleType,
} from '@linode/api-v4/lib/firewalls';
import type { ExtendedIP } from 'src/utilities/ipUtils';

// =============================================================================
// <FirewallRuleDrawer />
// =============================================================================
export const FirewallRuleDrawer = React.memo(
  (props: FirewallRuleDrawerProps) => {
    const { category, isOpen, mode, onClose, ruleToModifyOrView } = props;

    const { isFirewallRulesetsPrefixlistsEnabled } =
      useIsFirewallRulesetsPrefixlistsEnabled();

    /**
     * State for the type of entity being created: either a firewall 'rule' or
     * referencing an existing 'ruleset' in the firewall.
     * Only relevant when `mode === 'create'`.
     */
    const [createEntityType, setCreateEntityType] =
      React.useState<FirewallCreateEntityType>('rule');

    // Custom IPs are tracked separately from the form. The <MultipleIPs />
    // component consumes this state. We use this on form submission if the
    // `addresses` form value is "ip/netmask", which indicates the user has
    // intended to specify custom IPs.
    const [ips, setIPs] = React.useState<ExtendedIP[]>([{ address: '' }]);

    // Firewall Ports, like IPs, are tracked separately. The form.values state value
    // tracks the custom user input; the FirewallOptionItem[] array of port presets in the multi-select
    // is stored here.
    const [presetPorts, setPresetPorts] = React.useState<
      FirewallOptionItem<string>[]
    >([]);

    React.useEffect(() => {
      // Reset state. If we're in EDIT mode, set IPs to the addresses of the rule we're modifying
      // (along with any errors we may have).
      if (mode === 'edit' && ruleToModifyOrView) {
        setIPs(getInitialIPs(ruleToModifyOrView));
        setPresetPorts(portStringToItems(ruleToModifyOrView.ports)[0]);
      } else if (isOpen) {
        setPresetPorts([]);
      } else {
        setIPs([{ address: '' }]);
      }

      // Reset the Create entity selection to 'rule' in two cases:
      // 1. The ruleset feature flag is disabled - 'ruleset' is not allowed.
      // 2. The drawer is closed - ensures the next time it opens, it starts with the default 'rule' selection.
      if (
        mode === 'create' &&
        (!isFirewallRulesetsPrefixlistsEnabled || !isOpen)
      ) {
        setCreateEntityType('rule');
      }
    }, [
      mode,
      isOpen,
      ruleToModifyOrView,
      isFirewallRulesetsPrefixlistsEnabled,
    ]);

    const title =
      mode === 'create'
        ? `Add an ${capitalize(category)} Rule${
            isFirewallRulesetsPrefixlistsEnabled ? ' or Rule Set' : ''
          }`
        : mode === 'edit'
          ? 'Edit Rule'
          : `${capitalize(category)} Rule Set details`;

    const addressesLabel = category === 'inbound' ? 'source' : 'destination';

    const onValidateRule = (values: FormState) => {
      const { addresses, description, label, ports, protocol } = values;

      // The validated IPs may have errors, so set them to state so we see the errors.
      const validatedIPs = validateIPs(ips, {
        allowEmptyAddress: addresses !== 'ip/netmask',
      });
      setIPs(validatedIPs);

      const _ports = itemsToPortString(presetPorts, ports!);

      return {
        ...validateForm({
          addresses,
          description,
          label,
          ports: _ports,
          protocol,
        }),
        // This is a bit of a trick. If this function DOES NOT return an empty object, Formik will call
        // `onSubmit()`. If there are IP errors, we add them to the return object so Formik knows there
        // is an issue with the form.
        ...validatedIPs.filter((thisIP) => Boolean(thisIP.error)),
      };
    };

    const onSubmitRule = (values: FormState) => {
      const ports = itemsToPortString(presetPorts, values.ports!);
      const protocol = values.protocol as FirewallRuleProtocol;
      const addresses = formValueToIPs(values.addresses!, ips);

      const payload: FirewallRuleType = {
        action: values.action,
        addresses,
        ports,
        protocol,
        label: values.label || null,
        description: values.description || null,
      };
      props.onSubmit(category, payload);
      onClose();
    };

    const onValidateRuleSet = (values: FormRuleSetState) => {
      const errors: Record<string, string> = {};
      if (!values.ruleset || values.ruleset === -1) {
        errors.ruleset = 'Rule Set is required.';
      }
      if (typeof values.ruleset !== 'number') {
        errors.ruleset = 'Rule Set should be a number.';
      }
      return errors;
    };

    return (
      <Drawer onClose={onClose} open={isOpen} title={title}>
        {mode === 'create' && isFirewallRulesetsPrefixlistsEnabled && (
          <Grid container spacing={2}>
            {firewallRuleCreateOptions.map((option) => (
              <SelectionCard
                checked={createEntityType === option.value}
                gridSize={{
                  md: 6,
                  sm: 12,
                  xs: 12,
                }}
                heading={option.label}
                key={option.value}
                onClick={() => setCreateEntityType(option.value)}
                renderIcon={() => (
                  <Radio checked={createEntityType === option.value} />
                )}
                subheadings={[]}
                sxCardBase={(theme) => ({
                  gap: 0,
                  '& .cardSubheadingTitle': {
                    fontSize: theme.tokens.font.FontSize.Xs,
                  },
                })}
                sxCardBaseIcon={(theme) => ({
                  svg: { fontSize: theme.tokens.font.FontSize.L },
                })}
              />
            ))}
          </Grid>
        )}

        {(mode === 'edit' ||
          (mode === 'create' && createEntityType === 'rule')) && (
          <Formik<FormState>
            initialValues={getInitialFormValues(ruleToModifyOrView)}
            onSubmit={onSubmitRule}
            validate={onValidateRule}
            validateOnBlur={false}
            validateOnChange={false}
          >
            {(formikProps) => (
              <>
                {formikProps.status && (
                  <Notice
                    data-qa-error
                    key={formikProps.status}
                    text={formikProps.status.generalError}
                    variant="error"
                  />
                )}
                <FirewallRuleForm
                  addressesLabel={addressesLabel}
                  category={category}
                  closeDrawer={onClose}
                  ips={ips}
                  mode={mode}
                  presetPorts={presetPorts}
                  ruleErrors={ruleToModifyOrView?.errors}
                  setIPs={setIPs}
                  setPresetPorts={setPresetPorts}
                  {...formikProps}
                />
              </>
            )}
          </Formik>
        )}

        {mode === 'create' &&
          createEntityType === 'ruleset' &&
          isFirewallRulesetsPrefixlistsEnabled && (
            <Formik<FormRuleSetState>
              initialValues={{ ruleset: -1 }}
              onSubmit={(values) => {
                props.onSubmit(category, values);
                onClose();
              }}
              validate={onValidateRuleSet}
              validateOnBlur={true}
              validateOnChange={true}
            >
              {(formikProps) => (
                <>
                  {formikProps.status && (
                    <Notice
                      data-qa-error
                      key={formikProps.status}
                      text={formikProps.status.generalError}
                      variant="error"
                    />
                  )}
                  <FirewallRuleSetForm
                    category={category}
                    closeDrawer={onClose}
                    ruleErrors={ruleToModifyOrView?.errors}
                    {...formikProps}
                  />
                </>
              )}
            </Formik>
          )}

        {mode === 'view' && (
          <FirewallRuleSetDetailsView
            category={category}
            closeDrawer={onClose}
            ruleset={ruleToModifyOrView?.ruleset ?? -1}
          />
        )}

        {(mode === 'create' || mode === 'edit') && (
          <Typography variant="body1">
            Rule changes don&rsquo;t take effect immediately. You can add or
            delete rules before saving all your changes to this Firewall.
          </Typography>
        )}
      </Drawer>
    );
  }
);
