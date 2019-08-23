import { Formik, FormikActions } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { updateContact } from 'src/services/managed';
import { array, number, object, string } from 'yup';
import { ManagedContactGroup, Mode } from './common';

interface GroupForm {
  name: string;
  contactIds: number[];
}

const groupFormSchema = object().shape({
  name: string()
    .required('Group name is required.')
    .min(2, 'Group must be between 2 and 50 characters.')
    .max(50, 'Group must be between 2 and 50 characters.'),
  contactIds: array()
    .of(number())
    .min(1, 'At least one contact is required to create a group.')
  // @todo: Add a max?
});

interface Props {
  isOpen: boolean;
  closeDrawer: () => void;
  mode: Mode;
  update: () => void;
  groups: ManagedContactGroup[];
  contacts: Linode.ManagedContact[];
  group?: ManagedContactGroup;
}
type CombinedProps = Props;

const GroupDrawer: React.FC<CombinedProps> = props => {
  const { isOpen, closeDrawer, mode, contacts, group, update } = props;

  // Errors for individual contacts are handled outside of Formik.
  const [contactErrors, setContactErrors] = React.useState<number[]>([]);

  const isEditing = mode === 'edit' && group;

  const onSubmit = async (
    values: GroupForm,
    { setSubmitting, setStatus }: FormikActions<GroupForm>
  ) => {
    const { contactIds } = values;

    // Update the `group` of each contact.
    const promises = contactIds.map(id =>
      // Handle any errors with `.catch()` so that `Promise.all()` resolves
      // and we can determine which contacts failed to update.
      updateContact(id, { group: values.name }).catch(_ => null)
    );

    try {
      setStatus(undefined);
      setContactErrors([]);

      // Since errors on individual errors are caught, this should always resolve.
      const resolved = await Promise.all(promises);

      setSubmitting(false);

      // If an element at a given index of `resolved` is null, that means that
      // request failed. Match it up to `contactIds` to set an error for that contact.
      const errors: number[] = [];
      for (let i = 0; i < resolved.length; i++) {
        if (!resolved[i]) {
          errors.push(contactIds[i]);
        }
      }

      // If all requests were unsuccessful, display a general error.
      if (errors.length === contactIds.length) {
        return setStatus('Unable to create Group.');
      }

      // If a subset of requests were successful, display an error for each.
      if (errors.length > 0) {
        return setContactErrors(errors);
      }

      // Otherwise, we're all good. Refresh the data and close the drawer.
      update();
      closeDrawer();
    } catch (err) {
      setStatus('Unable to create Group.');
    }
  };

  return (
    <Drawer
      title={`${isEditing ? 'Edit' : 'Create '} Group`}
      open={isOpen}
      onClose={closeDrawer}
    >
      <Formik
        initialValues={{
          name: '',
          contactIds: []
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={groupFormSchema}
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
          setFieldValue
        }) => {
          return (
            <>
              {/* General Error */}
              {status && <Notice key={status} text={status} error />}

              {/* Errors for individual contacts */}
              {contactErrors.map(id => {
                const foundContact = contacts.find(
                  thisContact => thisContact.id === id
                );
                return foundContact ? (
                  <Grid key={id} item data-qa-import-error>
                    <Notice error spacingBottom={0}>
                      Error adding group to {foundContact.name}.
                    </Notice>
                  </Grid>
                ) : null;
              })}

              <form onSubmit={handleSubmit}>
                <TextField
                  name="name"
                  label="Group Name"
                  value={values.name}
                  error={Boolean(errors.name)}
                  errorText={errors.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                <Select
                  isMulti
                  label="Contacts"
                  placeholder="Select contacts"
                  onChange={(selectedContacts: Item<number>[]) =>
                    setFieldValue(
                      'contactIds',
                      selectedContacts.map(thisContact => thisContact.value)
                    )
                  }
                  options={contacts.map(thisContact => ({
                    value: thisContact.id,
                    label: thisContact.name
                  }))}
                  // The typing was being inferred incorrectly here, so I had to cheat.
                  errorText={errors.contactIds as string | undefined}
                />

                <ActionsPanel>
                  <Button
                    buttonType="primary"
                    onClick={() => handleSubmit()}
                    loading={isSubmitting}
                  >
                    Save
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

export default GroupDrawer;
