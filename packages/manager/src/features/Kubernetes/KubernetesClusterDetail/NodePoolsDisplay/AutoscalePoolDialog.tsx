import { AutoscaleNodePool } from '@linode/api-v4/lib/kubernetes';
import { AutoscaleNodePoolSchema } from '@linode/validation/lib/kubernetes.schema';
import { useFormik } from 'formik';
import * as React from 'react';
import * as classNames from 'classnames';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';
import { makeStyles, Theme } from 'src/components/core/styles';

interface Props {
  poolID: number;
  open: boolean;
  loading: boolean;
  error?: string;
  getAutoscaler: () => AutoscaleNodePool | undefined;
  handleOpenResizeDrawer: (poolId: number) => void;
  onClose: () => void;
  onSubmit: (
    values: AutoscaleNodePool,
    setSubmitting: (isSubmitting: boolean) => void
  ) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  slash: {
    alignSelf: 'end',
    padding: '0px !important',
    '& p': {
      fontSize: '1rem',
      padding: `${theme.spacing(2)}px 0`,
    },
  },
  inputContainer: {
    '& label': {
      marginTop: 13,
    }
  },
  disabled: {
    opacity: 0.5,
  },
  errorText: {
    color: theme.color.red,
  },
  resize: {
    display: 'flex',
    alignItems: 'baseline',
  },
  notice: {
    fontFamily: theme.font.bold,
  },
}));

const AutoscalePoolDialog: React.FC<Props> = (props) => {
  const {
    poolID,
    error,
    loading,
    open,
    getAutoscaler,
    handleOpenResizeDrawer,
    onClose,
    onSubmit,
  } = props;
  const [warningMessage, setWarningMessage] = React.useState('');
  const autoscaler = getAutoscaler();
  const classes = useStyles();

  const submitForm = (values: AutoscaleNodePool) => {
    onSubmit(values, setSubmitting);
  };

  const handleWarning = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (autoscaler && +e.target.value < autoscaler.max) {
      return setWarningMessage(
        'The Node Pool will only be scaled down if there are unneeded nodes.'
      );
    }
    setWarningMessage('');
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldTouched,
    setSubmitting,
  } = useFormik({
    initialValues: {
      enabled: autoscaler?.enabled ?? false,
      min: autoscaler?.min ?? 1,
      max: autoscaler?.max ?? 1,
    },
    enableReinitialize: true,
    validationSchema: AutoscaleNodePoolSchema,
    onSubmit: (values) => submitForm(values),
  });

  return (
    <ConfirmationDialog
      open={open}
      title="Autoscale Pool"
      onClose={onClose}
      actions={() => (
        <form onSubmit={handleSubmit}>
          <ActionsPanel style={{ padding: 0 }}>
            <Button
              buttonType="secondary"
              onClick={onClose}
              data-qa-cancel
              data-testid="dialog-cancel"
            >
              Cancel
            </Button>
            <Button
              buttonType="primary"
              type="submit"
              loading={loading || isSubmitting}
              disabled={
                !(touched.enabled || touched.min || touched.max) ||
                Object.keys(errors).length !== 0
              }
              data-qa-confirm
              data-testid="dialog-confirm"
            >
              Save Changes
            </Button>
          </ActionsPanel>
        </form>
      )}
    >
      {error ? <Notice error text={error} /> : null}
      {warningMessage ? (
        <Notice warning className={classes.notice}>
          {warningMessage}
          <div className={classes.resize}>
            <Button
              buttonType="secondary"
              compact
              onClick={() => {
                onClose();
                handleOpenResizeDrawer(poolID);
              }}
            >
              Resize
            </Button>
            to immediately scale your node pool up or down.
          </div>
        </Notice>
      ) : null}
      <Typography>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis augue
        arcu, semper id diam vitae, ultrices aliquet est. Morbi mauris risus,
        mattis non sodales at, ultrices et quam.
      </Typography>
      <FormControlLabel
        label="Autoscaler"
        control={
          <Toggle
            name="enabled"
            checked={values.enabled}
            onChange={(e) => {
              setFieldTouched('enabled', true);
              handleChange(e);
            }}
            disabled={isSubmitting}
          />
        }
        style={{ marginTop: 12 }}
      />
      <Grid container className={classes.inputContainer}>
        <Grid item xs={3}>
          <TextField
            name="min"
            label="Min"
            type="number"
            value={values.min}
            onChange={(e) => {
              setFieldTouched('min', true);
              handleChange(e);
            }}
            disabled={!values.enabled || isSubmitting}
            error={touched.min && Boolean(errors.min)}
          />
        </Grid>
        <Grid
          item
          className={classNames({
            [classes.slash]: true,
            [classes.disabled]: !values.enabled,
          })}
        >
          <Typography>/</Typography>
        </Grid>
        <Grid item xs={3}>
          <TextField
            name="max"
            label="Max"
            type="number"
            value={values.max}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFieldTouched('max', true);
              handleChange(e);
              handleWarning(e);
            }}
            disabled={!values.enabled || isSubmitting}
            error={touched.max && Boolean(errors.max)}
          />
        </Grid>
        {(touched.min && errors.min) || (touched.max && errors.max) ? (
          <Grid item xs={12} style={{ padding: '0 8px' }}>
            {errors.min ? (
              <Typography className={classes.errorText}>
                {errors.min}
              </Typography>
            ) : null}
            {errors.max ? (
              <Typography className={classes.errorText}>
                {errors.max}
              </Typography>
            ) : null}
          </Grid>
        ) : null}
      </Grid>
    </ConfirmationDialog>
  );
};

export default React.memo(AutoscalePoolDialog);
