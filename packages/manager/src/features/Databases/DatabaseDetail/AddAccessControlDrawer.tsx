import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { enforceIPMasks } from 'src/features/Firewalls/FirewallDetail/Rules/FirewallRuleDrawer.utils';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';
import {
  ExtendedIP,
  extendedIPToString,
  ipFieldPlaceholder,
  validateIPs,
} from 'src/utilities/ipUtils';

const useStyles = makeStyles()((theme: Theme) => ({
  instructions: {
    marginBottom: '2rem',
  },
  ipSelect: {
    marginTop: theme.spacing(2),
  },
}));

interface Props {
  allowList: ExtendedIP[];
  onClose: () => void;
  open: boolean;
  updateDatabase: any;
}

interface Values {
  _allowList: ExtendedIP[];
}

type CombinedProps = Props;

const AddAccessControlDrawer = (props: CombinedProps) => {
  const { allowList, onClose, open, updateDatabase } = props;

  const { classes } = useStyles();

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
      setFieldError,
      setSubmitting,
    }: {
      setFieldError: (field: string, reason: string) => void;
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => {
    // Get the IP address strings out of the objects and filter empty strings out.
    // Ensure we append /32 to all IPs if / is not already present.
    const allowListRetracted = _allowList.reduce((acc, currentIP) => {
      let ipString = extendedIPToString(currentIP);
      if (ipString === '') {
        return acc;
      }

      if (ipString.indexOf('/') === -1) {
        ipString += '/32';
      }

      return [...acc, ipString];
    }, []);

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
    handleSubmit,
    isSubmitting,
    resetForm,
    setValues,
    values,
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      _allowList: allowList,
    },
    onSubmit: handleUpdateAccessControlsClick,
    validate: (values: Values) => onValidate(values),
    validateOnBlur: false,
    validateOnChange: false,
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
    <Drawer onClose={onClose} open={open} title="Manage Access Controls">
      <React.Fragment>
        {error ? <Notice text={error} variant="error" /> : null}
        {allowListErrors
          ? allowListErrors.map((allowListError) => (
              <Notice
                key={allowListError.reason}
                text={allowListError.reason}
                variant="error"
              />
            ))
          : null}
        <Typography className={classes.instructions} variant="body1">
          Add, edit, or remove IPv4 addresses and ranges that should be
          authorized to access your cluster.
        </Typography>
        <form onSubmit={handleSubmit}>
          <MultipleIPInput
            aria-label="Allowed IP Addresses or Ranges"
            className={classes.ipSelect}
            forDatabaseAccessControls
            inputProps={{ autoFocus: true }}
            ips={values._allowList}
            onBlur={handleIPBlur}
            onChange={handleIPChange}
            placeholder={ipFieldPlaceholder}
            title="Allowed IP Address(es) or Range(s)"
          />
          <ActionsPanel
            primaryButtonProps={{
              disabled: !formTouched,
              label: 'Update Access Controls',
              loading: isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: onClose,
            }}
          />
        </form>
      </React.Fragment>
    </Drawer>
  );
};

export default AddAccessControlDrawer;
