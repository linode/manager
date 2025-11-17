import { Drawer, Notice, Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { Formik } from 'formik';
import * as React from 'react';

import {
  type FirewallOptionItem,
  useIsFirewallRulesetsPrefixlistsEnabled,
} from '../../shared';
import { CreateEntitySelection } from './CreateEntitySelection';
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
import { FirewallRuleSetForm } from './FirewallRuleSetForm';

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
import type { FormikProps } from 'formik';
import type { ExtendedIP } from 'src/utilities/ipUtils';

// =============================================================================
// <FirewallRuleDrawer />
// =============================================================================
export const FirewallRuleDrawer = React.memo(
  (props: FirewallRuleDrawerProps) => {
    const { category, isOpen, mode, onClose, ruleToModify } = props;

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
      if (mode === 'edit' && ruleToModify) {
        setIPs(getInitialIPs(ruleToModify));
        setPresetPorts(portStringToItems(ruleToModify.ports)[0]);
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
    }, [mode, isOpen, ruleToModify, isFirewallRulesetsPrefixlistsEnabled]);

    const title =
      mode === 'create' ? `Add an ${capitalize(category)} Rule` : 'Edit Rule';

    const addressesLabel = category === 'inbound' ? 'source' : 'destination';

    const onValidate = (values: FormRuleSetState | FormState) => {
      // Case 1: user chose CREATE -> RULESET mode
      // If we're in add 'ruleset' mode, only validate the ruleset field
      if (mode === 'create' && createEntityType === 'ruleset') {
        const errors: Record<string, string> = {};
        if (!('ruleset' in values)) {
          errors.ruleset = 'Rule Set is required.';
        }
        if ('ruleset' in values && typeof values.ruleset !== 'number') {
          errors.ruleset = 'Rule Set should be a number.';
        }
        return errors;
      }

      // Case 2: RULE mode
      if (!('action' in values)) return {}; // safety fallback

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

    const onSubmit = (values: FormRuleSetState | FormState) => {
      const isCreateRuleSetMode =
        mode === 'create' && createEntityType === 'ruleset';

      // Case 1: RULESET submission
      if (isCreateRuleSetMode) {
        const payload = {
          ruleset: (values as FormRuleSetState).ruleset,
        };
        props.onSubmit(category, payload);
        onClose();
        return;
      }

      // Case 2: RULE submission
      const v = values as FormState;
      const ports = itemsToPortString(presetPorts, v.ports!);
      const protocol = v.protocol as FirewallRuleProtocol;
      const addresses = formValueToIPs(v.addresses!, ips);

      const payload: FirewallRuleType = {
        action: v.action,
        addresses,
        ports,
        protocol,
        label: v.label || null,
        description: v.description || null,
      };
      props.onSubmit(category, payload);
      onClose();
    };

    return (
      <Drawer onClose={onClose} open={isOpen} title={title}>
        <Formik
          initialValues={getInitialFormValues(ruleToModify)}
          onSubmit={onSubmit}
          validate={onValidate}
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

              {mode === 'create' && isFirewallRulesetsPrefixlistsEnabled && (
                <CreateEntitySelection
                  createEntityType={createEntityType}
                  mode={mode}
                  setCreateEntityType={setCreateEntityType}
                />
              )}

              {createEntityType === 'ruleset' &&
                isFirewallRulesetsPrefixlistsEnabled && (
                  <FirewallRuleSetForm
                    category={category}
                    closeDrawer={onClose}
                    ruleErrors={ruleToModify?.errors}
                    {...(formikProps as FormikProps<FormRuleSetState>)}
                  />
                )}

              {(mode === 'edit' || createEntityType === 'rule') && (
                <FirewallRuleForm
                  addressesLabel={addressesLabel}
                  category={category}
                  ips={ips}
                  mode={mode}
                  presetPorts={presetPorts}
                  ruleErrors={ruleToModify?.errors}
                  setIPs={setIPs}
                  setPresetPorts={setPresetPorts}
                  {...(formikProps as FormikProps<FormState>)}
                />
              )}
            </>
          )}
        </Formik>
        <Typography variant="body1">
          Rule changes don&rsquo;t take effect immediately. You can add or
          delete rules before saving all your changes to this Firewall.
        </Typography>
      </Drawer>
    );
  }
);
