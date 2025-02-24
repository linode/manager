import { Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { Formik } from 'formik';
import * as React from 'react';

import { Drawer } from 'src/components/Drawer';

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

import type { FirewallOptionItem } from '../../shared';
import type {
  FirewallRuleDrawerProps,
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
    const { category, isOpen, mode, onClose, ruleToModify } = props;

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

    // Reset state. If we're in EDIT mode, set IPs to the addresses of the rule we're modifying
    // (along with any errors we may have).
    React.useEffect(() => {
      if (mode === 'edit' && ruleToModify) {
        setIPs(getInitialIPs(ruleToModify));
        setPresetPorts(portStringToItems(ruleToModify.ports)[0]);
      } else if (isOpen) {
        setPresetPorts([]);
      } else {
        setIPs([{ address: '' }]);
      }
    }, [mode, isOpen, ruleToModify]);

    const title =
      mode === 'create' ? `Add an ${capitalize(category)} Rule` : 'Edit Rule';

    const addressesLabel = category === 'inbound' ? 'source' : 'destination';

    const onValidate = ({
      addresses,
      description,
      label,
      ports,
      protocol,
    }: FormState) => {
      // The validated IPs may have errors, so set them to state so we see the errors.
      const validatedIPs = validateIPs(ips, {
        // eslint-disable-next-line sonarjs/no-duplicate-string
        allowEmptyAddress: addresses !== 'ip/netmask',
      });
      setIPs(validatedIPs);

      const _ports = itemsToPortString(presetPorts, ports);

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

    const onSubmit = (values: FormState) => {
      const ports = itemsToPortString(presetPorts, values.ports);
      const protocol = values.protocol as FirewallRuleProtocol;
      const addresses = formValueToIPs(values.addresses, ips);

      const payload: FirewallRuleType = {
        action: values.action,
        addresses,
        ports,
        protocol,
      };

      payload.label = values.label === '' ? null : values.label;
      payload.description =
        values.description === '' ? null : values.description;

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
          {(formikProps) => {
            return (
              <FirewallRuleForm
                addressesLabel={addressesLabel}
                category={category}
                ips={ips}
                mode={mode}
                presetPorts={presetPorts}
                ruleErrors={ruleToModify?.errors}
                setIPs={setIPs}
                setPresetPorts={setPresetPorts}
                {...formikProps}
              />
            );
          }}
        </Formik>
        <Typography variant="body1">
          Rule changes don&rsquo;t take effect immediately. You can add or
          delete rules before saving all your changes to this Firewall.
        </Typography>
      </Drawer>
    );
  }
);
