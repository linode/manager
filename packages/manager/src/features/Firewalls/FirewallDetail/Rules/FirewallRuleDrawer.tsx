import * as React from 'react';
import Drawer from 'src/components/Drawer';
import Typography from 'src/components/core/Typography';
import { capitalize } from 'src/utilities/capitalize';
import { FirewallRuleForm } from './FirewallRuleForm';
import { Formik } from 'formik';
import {
  getInitialFormValues,
  getInitialIPs,
  itemsToPortString,
  formValueToIPs,
  portStringToItems,
  validateForm,
  validateIPs,
} from './FirewallRuleDrawer.utils';
import type { ExtendedIP } from 'src/utilities/ipUtils';
import type {
  FirewallRuleDrawerProps,
  FormState,
} from './FirewallRuleDrawer.types';
import type {
  FirewallRuleProtocol,
  FirewallRuleType,
} from '@linode/api-v4/lib/firewalls';
import type { Item } from 'src/components/EnhancedSelect/Select';

// =============================================================================
// <FirewallRuleDrawer />
// =============================================================================
export const FirewallRuleDrawer = React.memo(
  (props: FirewallRuleDrawerProps) => {
    const { isOpen, onClose, category, mode, ruleToModify } = props;

    // Custom IPs are tracked separately from the form. The <MultipleIPs />
    // component consumes this state. We use this on form submission if the
    // `addresses` form value is "ip/netmask", which indicates the user has
    // intended to specify custom IPs.
    const [ips, setIPs] = React.useState<ExtendedIP[]>([{ address: '' }]);

    // Firewall Ports, like IPs, are tracked separately. The form.values state value
    // tracks the custom user input; the Item[] array of port presets in the multi-select
    // is stored here.
    const [presetPorts, setPresetPorts] = React.useState<Item<string>[]>([]);

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
      ports,
      protocol,
      label,
      description,
      addresses,
    }: FormState) => {
      // The validated IPs may have errors, so set them to state so we see the errors.
      const validatedIPs = validateIPs(ips, {
        // eslint-disable-next-line sonarjs/no-duplicate-string
        allowEmptyAddress: addresses !== 'ip/netmask',
      });
      setIPs(validatedIPs);

      const _ports = itemsToPortString(presetPorts, ports);

      return {
        ...validateForm(protocol, _ports, label, description, addresses),
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
        ports,
        protocol,
        addresses,
        action: values.action,
      };

      payload.label = values.label === '' ? null : values.label;
      payload.description =
        values.description === '' ? null : values.description;

      props.onSubmit(category, payload);
      onClose();
    };

    return (
      <Drawer title={title} open={isOpen} onClose={onClose}>
        <Formik
          initialValues={getInitialFormValues(ruleToModify)}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={onSubmit}
          validate={onValidate}
        >
          {(formikProps) => {
            return (
              <FirewallRuleForm
                category={category}
                addressesLabel={addressesLabel}
                ips={ips}
                setIPs={setIPs}
                presetPorts={presetPorts}
                setPresetPorts={setPresetPorts}
                mode={mode}
                ruleErrors={ruleToModify?.errors}
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
