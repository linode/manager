import { linodeReboot } from '@linode/api-v4/lib/linodes';
import {
  createVlan,
  CreateVLANPayload,
  createVlanSchema
} from '@linode/api-v4/lib/vlans';
import { useFormik } from 'formik';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Dialog from 'src/components/Dialog';
import RegionSelect, {
  ExtendedRegion
} from 'src/components/EnhancedSelect/variants/RegionSelect';
import LinodeMultiSelect from 'src/components/LinodeMultiSelect';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { dcDisplayNames } from 'src/constants';
import useRegions from 'src/hooks/useRegions';
import arrayToList from 'src/utilities/arrayToCommaSeparatedList';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';
import { vlanContext } from './CreateVLANContext';

const useStyles = makeStyles((theme: Theme) => ({
  form: {},
  formSection: {
    marginBottom: theme.spacing(3)
  },
  helperText: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(),
    lineHeight: 1.5,
    fontSize: '1rem'
  }
}));

export const CreateVLANDialog: React.FC<{}> = _ => {
  const classes = useStyles();
  const history = useHistory();
  const regions = useRegions();
  const regionsWithVLANS: ExtendedRegion[] = regions.entities
    .filter(thisRegion => thisRegion.capabilities.includes('Vlans'))
    .map(r => ({ ...r, display: dcDisplayNames[r.id] }));
  const regionIDsWithVLANs = React.useMemo(() => {
    return regionsWithVLANS.map(thisRegion => thisRegion.id);
  }, [regionsWithVLANS]);

  const context = React.useContext(vlanContext);

  const { resetForm, ...formik } = useFormik({
    initialValues: {
      description: '',
      cidr_block: '10.0.0.0/24',
      region: '',
      linodes: []
    },
    validationSchema: createVlanSchema,
    validateOnChange: true,
    onSubmit: values => submitForm(values)
  });

  /** Reset errors and state when the modal opens */
  React.useEffect(() => {
    if (context.isOpen) {
      resetForm();
    }
  }, [context.isOpen, resetForm]);

  /**
   * Track whether to reboot attached Linodes after
   * successfully creating the VLAN. Not part of a payload
   * sent to the API, so stored outside of Formik.
   */

  const [rebootOnCreate, setRebootOnCreate] = React.useState(false);
  const toggleRebootOnCreate = () => {
    setRebootOnCreate(current => !current);
  };

  const submitForm = (values: CreateVLANPayload) => {
    const payload = { ...values };
    if (payload.cidr_block === '') {
      // This field is not required; if the user cleared the input,
      // don't submit anything.
      payload.cidr_block = undefined;
    }

    if (payload.description === '') {
      payload.description = undefined;
    }
    createVlan(payload)
      .then(response => {
        formik.setSubmitting(false);
        if (rebootOnCreate) {
          // If we've been asked to do this, reboot every Linode we just
          // attached to the VLAN.
          response.linodes.forEach(thisLinode => linodeReboot(thisLinode));
        }
        context.close();
        history.push('/vlans');
      })
      .catch(err => {
        const mapErrorToStatus = (generalError: string) =>
          formik.setStatus({ generalError });

        formik.setSubmitting(false);
        handleFieldErrors(formik.setErrors, err);
        handleGeneralErrors(
          mapErrorToStatus,
          err,
          'An unexpected error occurred.'
        );
      });
  };

  return (
    <Dialog
      title="Create a Virtual LAN"
      open={context.isOpen}
      onClose={context.close}
      fullWidth
      fullHeight
      maxWidth="md"
    >
      {!!formik.status && <Notice error text={formik.status.generalError} />}
      <form className={classes.form} onSubmit={formik.handleSubmit}>
        <div className={classes.formSection}>
          <RegionSelect
            label={'Region'}
            placeholder={'Regions'}
            errorText={formik.errors.region}
            handleSelection={(regionID: string) =>
              formik.setFieldValue('region', regionID)
            }
            regions={regionsWithVLANS}
            selectedID={formik.values.region}
          />
        </div>
        <div className={classes.formSection} data-testid="label-input">
          <TextField
            label="Label"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            errorText={
              formik.touched.description ? formik.errors.description : undefined
            }
            data-testid="description"
          />
        </div>
        <div className={classes.formSection}>
          <TextField
            label="IP Range / Netmask"
            name="cidr_block"
            helperText={`You can specify the IP range with a netmask (10.0.0.0/16) 
          or starting and ending IPs (10.0.0.0-10.0.0.20).`}
            helperTextPosition="top"
            value={formik.values.cidr_block}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            errorText={
              formik.touched.cidr_block ? formik.errors.cidr_block : undefined
            }
            data-testid="cidr_block"
          />
        </div>
        <div className={classes.formSection}>
          <LinodeMultiSelect
            allowedRegions={regionIDsWithVLANs}
            handleChange={selected => formik.setFieldValue('linodes', selected)}
            helperText={`Assign one or more Linodes to this VLAN, or add them later. Only Linodes
          in regions that currently support VLANS (${arrayToList(
            regionIDsWithVLANs.map(thisId => dcDisplayNames[thisId])
          )}) will be displayed as options.`}
          />
          <Typography className={classes.helperText}>
            After creating this VLAN,{' '}
            <strong>you must reboot all associated Linodes</strong> to enable
            the new network interface. Would you like to reboot them
            automatically after creating the VLAN?{' '}
          </Typography>
          <FormControlLabel
            control={
              <CheckBox
                checked={rebootOnCreate}
                onChange={() => toggleRebootOnCreate()}
                data-testid="toggle-linode-reboot"
                disabled={formik.values.linodes.length === 0}
              />
            }
            label="Reboot the selected Linodes automatically after creating the VLAN"
          />
        </div>
        <Button
          onClick={() => formik.handleSubmit()}
          buttonType="primary"
          loading={formik.isSubmitting}
          data-testid="submit-vlan-form"
        >
          Create VLAN
        </Button>
      </form>
    </Dialog>
  );
};

export default React.memo(CreateVLANDialog);
