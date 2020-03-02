import { Formik } from 'formik';
import { FirewallRuleType } from 'linode-js-sdk/lib/firewalls/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
// import { makeStyles, Theme } from 'src/components/core/styles';
import Select from 'src/components/EnhancedSelect';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import capitalize from 'src/utilities/capitalize';
import { firewallOptionItemsShort } from '../shared';

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {}
// }));

interface Props {
  category: 'inbound' | 'outbound';
  mode: 'create' | 'edit';
  isOpen: boolean;
  onClose: () => void;
}

const initialValues: FirewallRuleType = {
  ports: '',
  addresses: { ipv4: [], ipv6: [] },
  protocol: 'TCP'
};

export type CombinedProps = Props;

const RuleDrawer: React.FC<CombinedProps> = props => {
  const { isOpen, onClose, category, mode } = props;

  // const classes = useStyles();

  const title =
    mode === 'create' ? `Add an ${capitalize(category)} Rule` : 'Edit Rule';

  return (
    <Drawer title={title} open={isOpen} onClose={onClose}>
      <Formik
        initialValues={initialValues}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={values => console.log(values)}
      >
        {({
          values,
          errors,
          status,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          validateField
        }) => {
          return (
            <form onSubmit={handleSubmit}>
              {status && (
                <Notice
                  key={status}
                  text={status.generalError}
                  error
                  data-qa-error
                />
              )}
              <Select
                label="Type"
                name="type"
                options={firewallOptionItemsShort}
                aria-label="Select rule type."
                textFieldProps={{ required: true }}
                onChange={() => null}
                onBlur={handleBlur}
              />
              <Select
                label="Protocol"
                name="protocol"
                options={[]}
                aria-label="Select rule protocol."
                textFieldProps={{ required: true }}
                onChange={() => null}
                onBlur={handleBlur}
              />
              <TextField
                aria-label="Port range for firewall rule"
                label="Port Range"
                name="port range"
                value={values.ports}
                onChange={handleChange}
                errorText={errors.ports}
                onBlur={handleBlur}
                required
                // inputProps={{
                //   autoFocus: true
                // }}
              />
              <Select
                label="Sources"
                name="sources"
                options={[]}
                aria-label="Select rule sources."
                textFieldProps={{ required: true }}
                onChange={() => null}
                onBlur={handleBlur}
              />
              <TextField
                aria-label="IP / Netmask for firewall rule"
                label="IP / Netmask"
                name="ip netmask"
                value={values.ports}
                onChange={handleChange}
                // errorText={errors.ports}
                onBlur={handleBlur}
                required
                // inputProps={{
                //   autoFocus: true
                // }}
              />
              <ActionsPanel>
                <Button
                  buttonType="primary"
                  // onClick={() => handleSubmit()}
                  onClick={() => null}
                  data-qa-submit
                  loading={isSubmitting}
                >
                  Add Rule
                </Button>
              </ActionsPanel>
            </form>
          );
        }}
      </Formik>
    </Drawer>
  );
};

export default RuleDrawer;
