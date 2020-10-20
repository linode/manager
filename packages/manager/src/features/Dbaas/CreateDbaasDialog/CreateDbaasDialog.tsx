import * as React from 'react';
import { useFormik } from 'formik';
import Dialog from 'src/components/Dialog';
import { dbaasContext } from 'src/context';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

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

export const CreateDbaasDialog: React.FC<{}> = _ => {
  const context = React.useContext(dbaasContext);
  const classes = useStyles();

  const { resetForm, ...formik } = useFormik({
    initialValues: {
      label: '',
      region: '',
      root_pass: ''
    },
    validationSchema: {},
    validateOnChange: false,
    onSubmit: values => submitForm(values)
  });

  /** Reset errors and state when the modal opens */
  React.useEffect(() => {
    if (context.isOpen) {
      resetForm();
    }
  }, [context.isOpen, resetForm]);

  const submitForm = (values: any) => {
    const payload = { ...values };

    // createDbaas(payload).then().catch(err => {});
  };

  return (
    <Dialog
      title="Create a Database"
      open={context.isOpen}
      onClose={context.close}
      fullWidth
      fullHeight
      maxWidth="md"
    >
      {/*
        Input for label

        Select dropdown for region

        Database plans

        Password field

        Select dropdown for maintenance window

        Select dropdown for adding tags
    */}
    </Dialog>
  );
};

export default React.memo(CreateDbaasDialog);
