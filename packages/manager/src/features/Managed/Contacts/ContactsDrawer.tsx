import { ContactPayload, ManagedContact } from '@linode/api-v4/lib/managed';
import { createContactSchema } from '@linode/validation/lib/managed.schema';
import { Formik, FormikHelpers } from 'formik';
import { pathOr, pick } from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Select from 'src/components/EnhancedSelect/Select';
import Grid from '@mui/material/Unstable_Grid2';
import { Notice } from 'src/components/Notice/Notice';
import TextField from 'src/components/TextField';
import {
  useCreateContactMutation,
  useUpdateContactMutation,
} from 'src/queries/managed/managed';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { ManagedContactGroup, Mode } from './common';

interface Props {
  isOpen: boolean;
  closeDrawer: () => void;
  mode: Mode;
  groups: ManagedContactGroup[];
  contact?: ManagedContact;
}

type CombinedProps = Props;

const emptyContactPayload: ContactPayload = {
  name: '',
  email: '',
  phone: {
    primary: '',
    secondary: '',
  },
  group: '',
};

const ContactsDrawer: React.FC<CombinedProps> = (props) => {
  const { isOpen, closeDrawer, mode, contact, groups } = props;

  const isEditing = mode === 'edit' && contact;

  const { mutateAsync: createContact } = useCreateContactMutation();
  const { mutateAsync: updateContact } = useUpdateContactMutation(
    contact?.id || -1
  );

  // If we're in Edit mode, take the initialValues from the contact we're editing.
  // Otherwise, all initial values should be empty strings.
  const initialValues: ContactPayload = isEditing
    ? // Pick select properties to create a ContactPayload from Linode.ManagedContact.
      (pick(['name', 'email', 'phone', 'group'], contact) as ContactPayload)
    : emptyContactPayload;

  const onSubmit = (
    values: ContactPayload,
    { setErrors, setSubmitting, setStatus }: FormikHelpers<ContactPayload>
  ) => {
    setStatus(undefined);

    // If the user hasn't selected a group, it will be an empty string.
    // Remove it from the payload so it passes length validation.
    const payload = { ...values };
    if (payload.group === '') {
      delete payload.group;
    }

    // Conditionally build request based on the mode of the drawer.
    let createOrUpdate: () => Promise<ManagedContact>;

    if (mode === 'edit' && contact) {
      createOrUpdate = () => updateContact(payload);
    } else {
      createOrUpdate = () => createContact(payload);
    }

    createOrUpdate()
      .then(() => {
        setSubmitting(false);
        closeDrawer();
      })
      .catch((err) => {
        setSubmitting(false);
        const defaultMessage = `Unable to ${
          isEditing ? 'edit' : 'create'
        } contact. Please try again later.`;
        const mapErrorToStatus = (generalError: string) =>
          setStatus({ generalError });

        setSubmitting(false);
        handleFieldErrors(setErrors, err);
        handleGeneralErrors(mapErrorToStatus, err, defaultMessage);
      });
  };

  return (
    <Drawer
      title={`${isEditing ? 'Edit' : 'Add'} Contact`}
      open={isOpen}
      onClose={closeDrawer}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={createContactSchema}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={onSubmit}
      >
        {({
          values,
          errors,
          status,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
        }) => {
          const primaryPhoneError = pathOr('', ['phone', 'primary'], errors);
          // prettier-ignore
          const secondaryPhoneError = pathOr('', ['phone', 'secondary'], errors);

          return (
            <>
              {status && (
                <Notice key={status} text={status.generalError} error />
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  label="Name"
                  name="name"
                  error={!!errors.name}
                  errorText={errors.name}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  required
                  value={values.name}
                />

                <TextField
                  label="E-mail"
                  name="email"
                  error={!!errors.email}
                  errorText={errors.email}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  required
                  value={values.email}
                />

                <Grid container spacing={2}>
                  <Grid xs={12} md={6}>
                    <TextField
                      name="phone.primary"
                      label="Primary Phone"
                      value={pathOr('', ['phone', 'primary'], values)}
                      error={!!primaryPhoneError}
                      errorText={primaryPhoneError}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Grid>
                  <Grid xs={12} md={6}>
                    <TextField
                      name="phone.secondary"
                      label="Secondary Phone"
                      value={pathOr('', ['phone', 'secondary'], values)}
                      error={!!secondaryPhoneError}
                      errorText={secondaryPhoneError}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Grid>
                </Grid>

                {/* @todo: This <Select /> should be clearable eventually, but isn't currently allowed by the API. */}
                <Select
                  label="Group"
                  placeholder="Create or Select a Group"
                  creatable
                  isClearable={false}
                  value={
                    values.group
                      ? {
                          value: values.group,
                          label: values.group,
                        }
                      : null
                  }
                  options={groups.map((group) => ({
                    label: group.groupName,
                    value: group.groupName,
                  }))}
                  onChange={(selectedGroup) =>
                    setFieldValue('group', selectedGroup?.value)
                  }
                  errorText={errors.group}
                />

                <ActionsPanel>
                  <Button
                    buttonType="primary"
                    loading={isSubmitting}
                    onClick={() => handleSubmit()}
                  >
                    {isEditing ? 'Save Changes' : 'Add Contact'}
                  </Button>
                </ActionsPanel>
              </form>
            </>
          );
        }}
      </Formik>
    </Drawer>
  );
};

export default ContactsDrawer;
