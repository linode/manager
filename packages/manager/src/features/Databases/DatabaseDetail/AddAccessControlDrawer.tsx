import { ActionsPanel, Drawer, Notice, Typography } from '@linode/ui';
import { useFormik } from 'formik';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { NotFound } from 'src/components/NotFound';
import {
  ACCESS_CONTROLS_DRAWER_TEXT,
  ACCESS_CONTROLS_DRAWER_TEXT_LEGACY,
  ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT,
  ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT_LEGACY,
  LEARN_MORE_LINK,
  LEARN_MORE_LINK_LEGACY,
} from 'src/features/Databases/constants';
import { isDefaultDatabase } from 'src/features/Databases/utilities';
import { enforceIPMasks } from 'src/features/Firewalls/FirewallDetail/Rules/FirewallRuleDrawer.utils';
import { useDatabaseMutation } from 'src/queries/databases/databases';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';
import {
  extendedIPToString,
  ipFieldPlaceholder,
  ipV6FieldPlaceholder,
  stringToExtendedIP,
  validateIPs,
} from 'src/utilities/ipUtils';

import type { Database, DatabaseInstance } from '@linode/api-v4';
import type { APIError } from '@linode/api-v4/lib/types';
import type { Theme } from '@mui/material/styles';
import type { ExtendedIP } from 'src/utilities/ipUtils';

const useStyles = makeStyles()((theme: Theme) => ({
  instructions: {
    marginBottom: '2rem',
  },
  ipSelect: {
    marginTop: theme.spacing(2),
  },
}));

interface Props {
  database: Database | DatabaseInstance;
  onClose: () => void;
  open: boolean;
}

interface Values {
  _allowList: ExtendedIP[];
}

type CombinedProps = Props;

const AddAccessControlDrawer = (props: CombinedProps) => {
  const { database, onClose, open } = props;

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

  const { mutateAsync: updateDatabase } = useDatabaseMutation(
    database.engine,
    database.id
  );

  const isDefaultDB = isDefaultDatabase(database);

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
      errorMessage: isDefaultDB
        ? ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT
        : ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT_LEGACY,
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

  const { handleSubmit, isSubmitting, resetForm, setValues, values } =
    useFormik({
      enableReinitialize: true,
      initialValues: {
        _allowList: database?.allow_list?.map(stringToExtendedIP),
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

  const learnMoreLink = isDefaultDB ? LEARN_MORE_LINK : LEARN_MORE_LINK_LEGACY;
  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title="Manage Access"
    >
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
          {isDefaultDB
            ? ACCESS_CONTROLS_DRAWER_TEXT
            : ACCESS_CONTROLS_DRAWER_TEXT_LEGACY}{' '}
          <Link to={learnMoreLink}>Learn more</Link>.
        </Typography>
        <form onSubmit={handleSubmit}>
          <MultipleIPInput
            buttonText={
              values._allowList && values._allowList.length > 0
                ? 'Add Another IP'
                : 'Add an IP'
            }
            placeholder={
              isDefaultDB ? ipV6FieldPlaceholder : ipFieldPlaceholder
            }
            aria-label="Allowed IP Addresses or Ranges"
            className={classes.ipSelect}
            forDatabaseAccessControls
            inputProps={{ autoFocus: true }}
            ips={values._allowList!}
            onBlur={handleIPBlur}
            onChange={handleIPChange}
            title="Allowed IP Addresses or Ranges"
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
