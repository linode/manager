import { ActionsPanel, Drawer, Notice, Select, TextField } from '@linode/ui';
import { createContactSchema } from '@linode/validation/lib/managed.schema';
import Grid from '@mui/material/Grid2';
import { useNavigate } from '@tanstack/react-router';
import { useMatch } from '@tanstack/react-router';
import { Formik } from 'formik';
import * as React from 'react';

import { NotFound } from 'src/components/NotFound';
import {
  useCreateContactMutation,
  useUpdateContactMutation,
} from 'src/queries/managed/managed';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { handleFormikBlur } from 'src/utilities/formikTrimUtil';

import type { ManagedContactGroup } from './common';
import type {
  ContactPayload,
  ManagedContact,
} from '@linode/api-v4/lib/managed';
import type { FormikHelpers } from 'formik';

interface ContactsDrawerProps {
  contact?: ManagedContact;
  groups: ManagedContactGroup[];
  isFetching: boolean;
  isOpen: boolean;
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
  const { contact, groups, isFetching, isOpen } = props;
  const navigate = useNavigate();
  const match = useMatch({ strict: false });
  const isEditing = match.routeId === '/managed/contacts/$contactId/edit';

  const { mutateAsync: createContact } = useCreateContactMutation();
  const { mutateAsync: updateContact } = useUpdateContactMutation(
    contact?.id ?? -1
  );

  // If we're in Edit mode, take the initialValues from the contact we're editing.
  // Otherwise, all initial values should be empty strings.
  const getContactInfo = (): ContactPayload => {
    return {
      email: contact?.email ?? '',
      group: contact?.group,
      name: contact?.name ?? '',
      phone: contact?.phone,
    };
  };

  const initialValues: ContactPayload = isEditing
    ? getContactInfo()
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

    if (isEditing && contact) {
      createOrUpdate = () => updateContact(payload);
    } else {
      createOrUpdate = () => createContact(payload);
    }

    createOrUpdate()
      .then(() => {
        setSubmitting(false);
        navigate({
          to: '/managed/contacts',
        });
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
      onClose={() => {
        navigate({
          to: '/managed/contacts',
        });
      }}
      NotFoundComponent={NotFound}
      isFetching={isFetching}
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

          // @todo: map the primary and secondary phone errors to the respective variables when using react-hook-form
          const primaryPhoneError = errors?.phone ?? '';
          // prettier-ignore
          const secondaryPhoneError = errors?.phone ?? '';

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
                  <Grid
                    size={{
                      md: 6,
                      xs: 12,
                    }}
                  >
                    <TextField
                      error={!!primaryPhoneError}
                      errorText={primaryPhoneError}
                      label="Primary Phone"
                      name="phone.primary"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values?.phone?.primary ?? ''}
                    />
                  </Grid>
                  <Grid
                    size={{
                      md: 6,
                      xs: 12,
                    }}
                  >
                    <TextField
                      error={!!secondaryPhoneError}
                      errorText={secondaryPhoneError}
                      label="Secondary Phone"
                      name="phone.secondary"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values?.phone?.secondary ?? ''}
                    />
                  </Grid>
                </Grid>

                <Select
                  onChange={(_, selectedGroup) =>
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
