import * as React from 'react';
import { useFormik } from 'formik';
import Dialog from 'src/components/Dialog';
import { dbaasContext } from 'src/context';

export const CreateDbaasDialog: React.FC<{}> = _ => {
  const context = React.useContext(dbaasContext);

  const { resetForm, ...formik } = useFormik({
    initialValues: {},
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
