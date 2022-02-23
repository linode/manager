import { APIError } from '@linode/api-v4/lib/types';
import { useFormik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import MultipleIPInput from 'src/components/MultipleIPInput/MultipleIPInput';
import Notice from 'src/components/Notice';
import { enforceIPMasks } from 'src/features/Firewalls/FirewallDetail/Rules/FirewallRuleDrawer';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';
import {
  ExtendedIP,
  extendedIPToString,
  ipFieldPlaceholder,
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
  const [allowListErrors, setAllowListErrors] = React.useState<APIError[]>();

  // This will be set to `true` once a form field has been touched. This is used to disable the
  // "Update Access Controls" button unless there have been changes to the form.
  const [formTouched, setFormTouched] = React.useState<boolean>(false);

  const handleIPBlur = (_ips: ExtendedIP[]) => {
    const _ipsWithMasks = enforceIPMasks(_ips);

    setValues({ _allowList: _ipsWithMasks });
  };

  const handleUpdateAccessControlsClick = (
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
        // Surface allow_list errors -- for example, "Invalid IPv4 address(es): ..."
        const allowListErrors = errors.filter(
          (error: APIError) => error.field === 'allow_list'
        );
        if (allowListErrors) {
          setAllowListErrors(allowListErrors);
        }

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

  const {
    values,
    isSubmitting,
    handleSubmit,
    setValues,
    resetForm,
  } = useFormik({
    initialValues: {
      _allowList: allowList,
    },
    enableReinitialize: true,
    onSubmit: handleUpdateAccessControlsClick,
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

  React.useEffect(() => {
    if (open) {
      setError('');
      setAllowListErrors([]);
      resetForm();
    }
  }, [open, resetForm]);

  return (
    <Drawer open={open} onClose={onClose} title="Manage Access Controls">
      <React.Fragment>
        {error ? <Notice error text={error} /> : null}
        {allowListErrors
          ? allowListErrors.map((allowListError) => (
              <Notice
                error
                text={allowListError.reason}
                key={allowListError.reason}
              />
            ))
          : null}
        <Typography variant="body1" className={classes.instructions}>
          Add, edit, or remove IPv4 addresses and ranges that should be
          authorized to access your cluster.
        </Typography>
        <form onSubmit={handleSubmit}>
          <MultipleIPInput
            title="Allowed IP Address(es) or Range(s)"
            aria-label="Allowed IP Addresses or Ranges"
            className={classes.ipSelect}
            ips={values._allowList}
            onChange={handleIPChange}
            onBlur={handleIPBlur}
            inputProps={{ autoFocus: true }}
            placeholder={ipFieldPlaceholder}
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
