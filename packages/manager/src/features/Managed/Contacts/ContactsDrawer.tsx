import { ContactPayload, ManagedContact } from '@linode/api-v4/lib/managed';
import { createContactSchema } from '@linode/validation/lib/managed.schema';
import Grid from '@mui/material/Unstable_Grid2';
import { Formik, FormikHelpers } from 'formik';
import { pathOr, pick } from 'ramda';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import Select from 'src/components/EnhancedSelect/Select';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import {
  useCreateContactMutation,
  useUpdateContactMutation,
} from 'src/queries/managed/managed';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { handleFormikBlur } from 'src/utilities/formikTrimUtil';

import { ManagedContactGroup, Mode } from './common';

interface ContactsDrawerProps {
  closeDrawer: () => void;
  contact?: ManagedContact;
  groups: ManagedContactGroup[];
  isOpen: boolean;
  mode: Mode;
}

const emptyContactPayload: ContactPayload = {
  email: '',
  group: '',
  name: '',
  phone: {
    primary: '',
    secondary: '',
  },
};

const ContactsDrawer = (props: ContactsDrawerProps) => {
  const { closeDrawer, contact, groups, isOpen, mode } = props;

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
    { setErrors, setStatus, setSubmitting }: FormikHelpers<ContactPayload>
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
      onClose={closeDrawer}
      open={isOpen}
      title={`${isEditing ? 'Edit' : 'Add'} Contact`}
    >
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validateOnBlur={false}
        validateOnChange={false}
        validationSchema={createContactSchema}
      >
        {(formikProps) => {
          const {
            errors,
            handleBlur,
            handleChange,
            handleSubmit,
            isSubmitting,
            setFieldValue,
            status,
            values,
          } = formikProps;

          const primaryPhoneError = pathOr('', ['phone', 'primary'], errors);
          // prettier-ignore
          const secondaryPhoneError = pathOr('', ['phone', 'secondary'], errors);

          return (
            <>
              {status && (
                <Notice
                  key={status}
                  text={status.generalError}
                  variant="error"
                />
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  error={!!errors.name}
                  errorText={errors.name}
                  label="Name"
                  name="name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  required
                  value={values.name}
                />

                <TextField
                  error={!!errors.email}
                  errorText={errors.email}
                  label="E-mail"
                  name="email"
                  onBlur={(e) => handleFormikBlur(e, formikProps)}
                  onChange={handleChange}
                  required
                  type="email"
                  value={values.email}
                />

                <Grid container spacing={2}>
                  <Grid md={6} xs={12}>
                    <TextField
                      error={!!primaryPhoneError}
                      errorText={primaryPhoneError}
                      label="Primary Phone"
                      name="phone.primary"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={pathOr('', ['phone', 'primary'], values)}
                    />
                  </Grid>
                  <Grid md={6} xs={12}>
                    <TextField
                      error={!!secondaryPhoneError}
                      errorText={secondaryPhoneError}
                      label="Secondary Phone"
                      name="phone.secondary"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={pathOr('', ['phone', 'secondary'], values)}
                    />
                  </Grid>
                </Grid>

                {/* @todo: This <Select /> should be clearable eventually, but isn't currently allowed by the API. */}
                <Select
                  onChange={(selectedGroup) =>
                    setFieldValue('group', selectedGroup?.value)
                  }
                  options={groups.map((group) => ({
                    label: group.groupName,
                    value: group.groupName,
                  }))}
                  value={
                    values.group
                      ? {
                          label: values.group,
                          value: values.group,
                        }
                      : null
                  }
                  creatable
                  errorText={errors.group}
                  isClearable={false}
                  label="Group"
                  placeholder="Create or Select a Group"
                />

                <ActionsPanel
                  primaryButtonProps={{
                    label: isEditing ? 'Save Changes' : 'Add Contact',
                    loading: isSubmitting,
                    onClick: () => handleSubmit(),
                  }}
                />
              </form>
            </>
          );
        }}
      </Formik>
    </Drawer>
  );
};

export default ContactsDrawer;
