import { useFormik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import ExternalLink from 'src/components/Link';
import MultipleIPInput from 'src/components/MultipleIPInput/MultipleIPInput';
import Notice from 'src/components/Notice';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';
import {
  ExtendedIP,
  extendedIPToString,
  validateIPs,
} from 'src/utilities/ipUtils';

const useStyles = makeStyles((theme: Theme) => ({
  instructions: {
    marginBottom: '2rem',
  },
  ipSelect: {
    marginTop: theme.spacing(2),
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  updateDatabase: any;
  allowList: ExtendedIP[];
}

interface Values {
  _allowList: ExtendedIP[];
}

type CombinedProps = Props;

const AddAccessControlDrawer: React.FC<CombinedProps> = (props) => {
  const { open, onClose, updateDatabase, allowList } = props;

  const classes = useStyles();

  const [error, setError] = React.useState<string | undefined>('');

  // This will be set to `true` once a form field has been touched. This is used to disable the
  // "Allow Inbound Sources" button unless there have been changes to the form.
  const [formTouched, setFormTouched] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (open) {
      setError('');
    }
  }, [open]);

  const handleAllowInboundSourcesClick = (
    { _allowList }: Values,
    {
      setSubmitting,
      setFieldError,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      setFieldError: (field: string, reason: string) => void;
    }
  ) => {
    // Get the IP address strings out of the objects and filter empty strings out.
    const allowListRetracted = _allowList
      .map(extendedIPToString)
      .filter((ip) => ip !== '');

    updateDatabase({ allow_list: [...allowListRetracted] })
      .then(() => {
        setSubmitting(false);
        onClose();
      })
      .catch((errors: any) => {
        handleAPIErrors(errors, setFieldError, setError);
        setSubmitting(false);
      });
  };

  const onValidate = ({ _allowList }: Values) => {
    const validatedIPs = validateIPs(_allowList, {
      allowEmptyAddress: false,
      errorMessage: 'Must be a valid IPv4 address.',
    });

    setValues({ _allowList: validatedIPs });

    const ipsWithErrors = validatedIPs.filter((thisIP) =>
      Boolean(thisIP.error)
    );

    if (ipsWithErrors.length === 0) {
      return {};
    }

    return {
      _allowList: ipsWithErrors,
    };
  };

  const { values, isSubmitting, handleSubmit, setValues } = useFormik({
    initialValues: {
      _allowList: allowList,
    },
    enableReinitialize: true,
    onSubmit: handleAllowInboundSourcesClick,
    validateOnChange: false,
    validateOnBlur: false,
    validate: (values: Values) => onValidate(values),
  });

  const handleIPChange = React.useCallback(
    (_ips: ExtendedIP[]) => {
      if (!formTouched) {
        setFormTouched(true);
      }

      setValues({ _allowList: _ips });
    },
    [formTouched, setValues]
  );

  return (
    <Drawer open={open} onClose={onClose} title="Manage Access Controls">
      <React.Fragment>
        {error ? <Notice error text={error} /> : null}
        <Typography variant="body1" className={classes.instructions}>
          Add or remove IPv4 addresses and ranges that should be authorized to
          view your cluster&apos;s database.{' '}
          <ExternalLink to="https://www.linode.com/docs/products/database">
            Learn more about securing your cluster.
          </ExternalLink>
        </Typography>
        <form onSubmit={handleSubmit}>
          <MultipleIPInput
            title="Allowed IP Address(es) or Range(s)"
            aria-label="Allowed IP Addresses or Ranges"
            className={classes.ipSelect}
            ips={values._allowList}
            onChange={handleIPChange}
            inputProps={{ autoFocus: true }}
            placeholder="Add IP address"
            forDatabaseAccessControls
          />
          <ActionsPanel>
            <Button
              buttonType="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ marginBottom: 8 }}
              loading={false}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              buttonType="primary"
              disabled={!formTouched}
              style={{ marginBottom: 8 }}
              loading={isSubmitting}
            >
              Update Access Controls
            </Button>
          </ActionsPanel>
        </form>
      </React.Fragment>
    </Drawer>
  );
};

export default AddAccessControlDrawer;
