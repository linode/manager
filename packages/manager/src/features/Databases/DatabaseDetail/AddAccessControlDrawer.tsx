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

let autocompletedIPsList: string[] = [];
let activeIPElement: HTMLInputElement | null;
let tempAllowList: ExtendedIP[];

require('./AddAccessControlDrawer.css');

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
  // Takes in a string of integers and returns an array of possible IP Addresses from it.
  const autocompleteIP = function (ipString: string | any[]) {
    const possibleIPsList: string[] = [];
    const autocompleteIPHelper = (currentIP: any[], currentPos: number) => {
      // Stop when currentPos hits the end of ipString, and if the currentIP has 4 octets
      if (currentPos === ipString.length && currentIP.length === 4) {
        const currentIPJoined = currentIP.join('.');
        return possibleIPsList.push(currentIPJoined);
      }
      // Compute possible IPs if currentPos isn't at the end of ipString, and currentIP has less than 4 octets
      if (currentPos < ipString.length && currentIP.length < 4) {
        let currentChar = '';
        if (ipString[currentPos] === '0') {
          autocompleteIPHelper([...currentIP, 0], currentPos + 1);
          return;
        }
        for (let i = 0; i < 3; i++) {
          if (Number(currentChar + ipString[currentPos + i]) > 255) {
            return;
          }
          currentChar += ipString[currentPos + i];
          autocompleteIPHelper([...currentIP, currentChar], currentPos + i + 1);
        }
      }
      return true;
    };
    autocompleteIPHelper([], 0);
    return possibleIPsList;
  };

  const toggleIPToolTip = function (
    typing: boolean,
    autocompletedIPsList: string[]
  ) {
    const ipToolTip = document.getElementById('iptooltiptext');
    // If there are no IPs to display, then hide the tooltip.
    if (ipToolTip && autocompletedIPsList.length == 0) {
      ipToolTip.style.visibility = 'hidden';
      return;
    }
    // Otherwise, toggle the tooltip.
    // This function is called in handleIPChange to show while typing, and applyIP to hide when clicking.
    if (ipToolTip && typing && ipToolTip.style.visibility != 'visible') {
      ipToolTip.style.visibility = 'visible';
    } else if (ipToolTip && !typing && ipToolTip.style.visibility != 'hidden') {
      ipToolTip.style.visibility = 'hidden';
    }
  };

  const handleIPChange = React.useCallback(
    (_ips: ExtendedIP[]) => {
      if (!formTouched) {
        setFormTouched(true);
      }
      activeIPElement = document.activeElement as HTMLInputElement;

      if (activeIPElement?.id?.indexOf('domain-transfer-ip') !== -1) {
        const ip = activeIPElement?.value;

        // Autocomplete the IP when "/" or "/" are not present, and when the string only contains numbers.
        if (
          ip &&
          (ip.indexOf('/') === -1 || ip.indexOf('.') === -1) &&
          /^[0-9]*$/.test(ip)
        ) {
          autocompletedIPsList = autocompleteIP(ip);
        }
      }
      // Make the tooltip visible on typing
      toggleIPToolTip(true, autocompletedIPsList);

      setValues({ _allowList: _ips });
      // todo: get rid of tempAllowList once we figure out how to cleanly access _allowList from applyIP()
      tempAllowList = _ips;
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

  // Fills in the active IP field with a new one.  This function is intended to be called when a possible IP is clicked.
  const applyIP = (ip: string) => {
    // Find the position in the IP list that needs updating
    const dashPos = activeIPElement?.id.lastIndexOf('-');
    const pos = Number(
      activeIPElement?.id?.substring(dashPos! + 1, activeIPElement?.id.length)
    );
    // todo: get rid of tempAllowList when we figure out how to cleanly access _allowList from this function
    // Update the list with the new IP
    tempAllowList[pos].address = `${ip}/32`;
    setValues({ _allowList: tempAllowList });
    // Make the list hidden on click
    toggleIPToolTip(false, autocompletedIPsList);

    return ip;
  };

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
        <div id="iptooltip">
          <ol id="iptooltiptext">
            {autocompletedIPsList
              ? autocompletedIPsList.map((ip) => (
                  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                  <div
                    className="ip"
                    onClick={() => applyIP(ip)}
                    onKeyDown={() => applyIP(ip)}
                    key={ip}
                  >
                    {ip}
                  </div>
                ))
              : null}
          </ol>
        </div>
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
