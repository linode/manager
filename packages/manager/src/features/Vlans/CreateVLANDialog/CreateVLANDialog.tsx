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
import useLinodes from 'src/hooks/useLinodes';
import useRegions from 'src/hooks/useRegions';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';
import { vlanContext } from 'src/context';

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
  const { linodes } = useLinodes();
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
      cidr_block: '',
      region: '',
      linodes: []
    },
    validationSchema: createVlanSchema,
    validateOnChange: false,
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

  const handleRegionSelect = (regionID: string) => {
    formik.setFieldValue('region', regionID);
    // Reset the selected Linodes
    formik.setFieldValue('linodes', []);
    setRebootOnCreate(false);
  };

  const handleLinodeSelect = (selected: number[]) => {
    /**
     * Uncheck the reboot on create button if no Linodes are selected
     */
    if (selected.length === 0) {
      setRebootOnCreate(false);
    }
    formik.setFieldValue('linodes', selected);
    const selectedLinode = linodes.itemsById[selected[0]];
    if (selectedLinode && !formik.values.region) {
      // Set the region to the selected Linode's region.
      // Because we update our filtering, we can assume
      // that all selected Linodes in the array have the same
      // region.
      formik.setFieldValue('region', selectedLinode.region);
    }
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
          response.linodes.forEach(thisVLANLinode =>
            linodeReboot(thisVLANLinode.id)
          );
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
            label={'Region (required)'}
            placeholder={'Regions'}
            errorText={formik.errors.region}
            handleSelection={handleRegionSelect}
            regions={regionsWithVLANS}
            selectedID={formik.values.region}
            required
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
            allowedRegions={
              formik.values.region ? [formik.values.region] : regionIDsWithVLANs
            }
            selectedLinodes={formik.values.linodes}
            handleChange={handleLinodeSelect}
            errorText={formik.errors.linodes?.[0]}
            helperText={`Assign one or more Linodes to this VLAN, or add them later. Linodes must
            be in the same region as the VLAN.`}
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
