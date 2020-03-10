import { Formik, FormikProps } from 'formik';
import { parse as parseIP } from 'ipaddr.js';
import { FirewallRuleProtocol } from 'linode-js-sdk/lib/firewalls';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Select from 'src/components/EnhancedSelect';
import { Item } from 'src/components/EnhancedSelect/Select';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import {
  addressOptions,
  allIPs,
  allIPv4,
  allIPv6,
  firewallOptionItemsShort,
  portPresets,
  predefinedFirewallFromRule,
  protocolOptions
} from 'src/features/Firewalls/shared';
import capitalize from 'src/utilities/capitalize';

// =============================================================================
// <FirewallRuleDrawer />
// =============================================================================
interface Props {
  category: 'inbound' | 'outbound';
  mode: 'create' | 'edit';
  isOpen: boolean;
  onClose: () => void;
}

interface Form {
  type: string;
  ports: string;
  addresses: string;
  protocol: string;
}

const initialValues: Form = {
  type: '',
  ports: '',
  addresses: '',
  protocol: ''
};

export type CombinedProps = Props;

const FirewallRuleDrawer: React.FC<CombinedProps> = props => {
  const { isOpen, onClose, category, mode } = props;

  // Custom IPs are tracked separately from the form. The <MultipleIPs />
  // component consumes this state. We use this on form submission if the
  // `addresses` form value is "ip/netmask", which indicates the user has
  // intended to specify custom IPs.
  const [ips, setIPs] = React.useState<string[]>(['']);

  const title =
    mode === 'create' ? `Add an ${capitalize(category)} Rule` : 'Edit Rule';

  const addressesLabel = category === 'inbound' ? 'source' : 'destination';

  return (
    <Drawer title={title} open={isOpen} onClose={onClose}>
      <Formik
        initialValues={initialValues}
        validateOnChange={false}
        validateOnBlur={false}
        // @todo: submit the form for real.
        onSubmit={values =>
          alert(
            JSON.stringify(
              {
                port: values.ports,
                protocol: values.protocol,
                addresses: formValueToIPs(values.addresses, ips)
              },
              null,
              2
            )
          )
        }
      >
        {formikProps => {
          return (
            <FirewallRuleForm
              addressesLabel={addressesLabel}
              ips={ips}
              setIPs={setIPs}
              {...formikProps}
            />
          );
        }}
      </Formik>
      <Typography variant="body1">
        Rule changes don't take effect immediately. You can add or delete rules
        before saving all your changes to this Firewall.
      </Typography>
    </Drawer>
  );
};

export default React.memo(FirewallRuleDrawer);

// =============================================================================
// <FirewallRuleForm />
// =============================================================================
const useStyles = makeStyles((theme: Theme) => ({
  ipSelect: {
    marginTop: theme.spacing(2)
  }
}));

interface FirewallRuleFormProps extends FormikProps<Form> {
  ips: string[];
  setIPs: (ips: string[]) => void;
  addressesLabel: string;
}

const typeOptions = [
  ...firewallOptionItemsShort,
  { label: 'Custom', value: 'custom' }
];

const FirewallRuleForm: React.FC<FirewallRuleFormProps> = React.memo(props => {
  const classes = useStyles();

  const {
    values,
    errors,
    status,
    handleChange,
    handleBlur,
    handleSubmit,
    // isSubmitting,
    setFieldValue,
    addressesLabel,
    setIPs,
    ips
  } = props;

  // These handlers are all memoized because the form was laggy when I tried them inline.
  const handleTypeChange = React.useCallback((item: Item | null) => {
    const selectedType = item?.value;
    setFieldValue('type', selectedType);

    if (!selectedType) {
      return;
    }

    // Pre-populate other form values if selecting a pre-defined type.
    if (selectedType !== 'custom') {
      // All predefined FW types use the TCP protocol.
      setFieldValue('protocol', 'TCP');
      // All predefined FW types use all IPv4 and IPv6.
      setFieldValue('addresses', 'all');
      // Use the port for the selected type.
      setFieldValue('ports', portPresets[selectedType]);
    }
  }, []);

  const handleProtocolChange = React.useCallback((item: Item | null) => {
    setFieldValue('protocol', item?.value);
  }, []);

  const handleAddressesChange = React.useCallback(
    (item: Item | null) => {
      setFieldValue('addresses', item?.value);
      // Reset custom IPs that may have been entered.
      setIPs(['']);
    },
    [ips]
  );

  const addressesValue = React.useMemo(() => {
    return (
      addressOptions.find(
        thisOption => thisOption.value === values.addresses
      ) || null
    );
  }, [values]);

  const _type = React.useMemo(() => deriveTypeFromValuesAndIPs(values, ips), [
    values,
    ips
  ]);

  return (
    <form onSubmit={handleSubmit}>
      {status && (
        <Notice key={status} text={status.generalError} error data-qa-error />
      )}
      <Select
        label="Type"
        name="type"
        placeholder="Select a rule type..."
        aria-label="Select rule type."
        options={typeOptions}
        value={
          typeOptions.find(thisOption => thisOption.value === _type) || null
        }
        onChange={handleTypeChange}
        isClearable={false}
        onBlur={handleBlur}
      />
      <Select
        label="Protocol"
        name="protocol"
        placeholder="Select a protocol..."
        aria-label="Select rule protocol."
        value={
          values.protocol
            ? { label: values.protocol, value: values.protocol }
            : undefined
        }
        options={protocolOptions}
        onChange={handleProtocolChange}
        onBlur={handleBlur}
      />
      <TextField
        label="Port Range"
        name="ports"
        placeholder="Enter a port range..."
        aria-label="Port range for firewall rule"
        value={values.ports}
        onChange={handleChange}
        errorText={errors.ports}
        onBlur={handleBlur}
      />
      <Select
        label={`${capitalize(addressesLabel)}s`}
        name="addresses"
        placeholder={`Select ${addressesLabel}s...`}
        aria-label={`Select rule ${addressesLabel}s.`}
        options={addressOptions}
        value={addressesValue}
        onChange={handleAddressesChange}
        onBlur={handleBlur}
      />
      {/* Show this field only if "IP / Netmask has been selected." */}
      {values.addresses === 'ip/netmask' && (
        <MultipleIPInput
          title="IP / Netmask"
          aria-label="IP / Netmask for firewall rule"
          className={classes.ipSelect}
          ips={ips}
          onChange={(_ips: string[]) => setIPs(_ips)}
          inputProps={{ autoFocus: true }}
        />
      )}
      <ActionsPanel>
        <Button
          buttonType="primary"
          onClick={() => handleSubmit()}
          data-qa-submit
          // loading={isSubmitting}
        >
          Add Rule
        </Button>
      </ActionsPanel>
    </form>
  );
});

// =============================================================================
// Utilities
// =============================================================================
/**
 * Derive the appropriate value of the "Type" field based on selected form
 * values and IP addresses.
 *
 * Example: A user selects the "HTTPS" type. The appropriate value is "HTTPS".
 * Next, the user modifies the allowed IP addresses. Now the appropriate value
 * is "custom", since the form no longer matches the predefined "HTTPS" type.
 * Finally, the user changes their mind and removes the custom IP selection.
 * The form again matches the "HTTPS" type, so the correct value is "HTTPS".
 */
export const deriveTypeFromValuesAndIPs = (values: Form, _ips: string[]) => {
  if (values.type === 'custom') {
    return 'custom';
  }

  const protocol = values.protocol as FirewallRuleProtocol;

  const ips = formValueToIPs(values.addresses, _ips);

  const predefinedFirewall = predefinedFirewallFromRule({
    ports: values.ports,
    protocol,
    addresses: ips
  });

  if (predefinedFirewall) {
    return predefinedFirewall;
  } else if (
    values.protocol?.length > 0 ||
    values.ports?.length > 0 ||
    values.addresses?.length > 0
  ) {
    return 'custom';
  }
  return null;
};

/**
 * Matches potential form values to the correct "addresses" payload.
 */
export const formValueToIPs = (formValue: string, ips: string[]) => {
  switch (formValue) {
    case 'all':
      return allIPs;
    case 'allIPv4':
      return { ipv4: [allIPv4], ipv6: [] };
    case 'allIPv6':
      return { ipv4: [], ipv6: [allIPv6] };
    default:
      // The user has selected "IP / Netmask" and entered custom IPs, so we need
      // to separate those into v4 and v6 addresses.
      return classifyIPs(ips);
  }
};

/**
 * Given an array of IP addresses, filter out invalid addresses and categorize
 * them by "ipv4" and "ipv6."
 */
export const classifyIPs = (ips: string[]) =>
  ips.reduce<{ ipv4: string[]; ipv6: string[] }>(
    (acc, ip) => {
      try {
        // It's possible to enter a range, e.g. 1.2.3.4/16. The API accepts this,
        // but ipaddr.js does not, so we just look at the base address for classification.
        const [base] = ip.split('/');

        const parsed = parseIP(base);
        const type = parsed.kind();
        acc[type].push(ip);
      } catch {
        // IP wasn't valid. No need to do anything; just continue.
      }
      return acc;
    },
    { ipv4: [], ipv6: [] }
  );
