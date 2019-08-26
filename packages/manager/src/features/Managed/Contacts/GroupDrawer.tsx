import { Formik, FormikActions } from 'formik';
import { indexBy } from 'ramda';
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

/**
 * IMPORTANT NOTE:
 *
 * This component is odd in the sense that "Groups" don't actually exist as an individual entity.
 * To manage Groups (i.e. "create" them, "edit" them), we're really just gluing together PUT
 * requests to /contacts/{id}. Things why several things are a bit hacky here.
 *
 */

interface GroupForm {
  name: string;
  contactIds: number[];
}

// This would be meaningless in /services since it only applies to this form.
const groupFormSchema = object().shape({
  name: string()
    .required('Group name is required.')
    .min(2, 'Group must be between 2 and 50 characters.')
    .max(50, 'Group must be between 2 and 50 characters.'),
  contactIds: array()
    .of(number())
    .min(1, 'At least one contact is required to create a group.')
    .max(20, 'Please select 20 or fewer contacts when creating a group.')
});

interface Props {
  isOpen: boolean;
  closeDrawer: () => void;
  update: () => void;
  contacts: Linode.ManagedContact[];
  selectedGroupName?: string;
}
type CombinedProps = Props;

const GroupDrawer: React.FC<CombinedProps> = props => {
  const { isOpen, closeDrawer, update, contacts, selectedGroupName } = props;

  // If a selectedGroupName is given, it's assumed we're in Edit mode.
  const isEditMode = Boolean(selectedGroupName);

  // Errors for individual contacts are handled outside of Formik.
  const [contactErrors, setContactErrors] = React.useState<number[]>([]);

  const onSubmit = async (
    values: GroupForm,
    { setSubmitting, setStatus }: FormikActions<GroupForm>
  ) => {
    const { contactIds } = values;

    // Update the `group` of each contact. This requires making a PUT request to each contact.
    const promises = contactIds.map(id =>
      // Handle any errors with `.catch()` so that `Promise.all()` resolves
      // and we can determine which contacts failed to update.
      updateContact(id, { group: values.name }).catch(_ => null)
    );

    try {
      setStatus(undefined);
      setContactErrors([]);

      // Since errors on individual requests are caught, this should always resolve.
      const resolved = await Promise.all(promises);

      setSubmitting(false);

      // If an element at a given index of `resolved` is null, that means that request failed.
      // Match it up to `contactIds` to set an error for that individual contact.
      const errors: number[] = [];
      for (let i = 0; i < resolved.length; i++) {
        if (resolved[i] === null) {
          errors.push(contactIds[i]);
        }
      }

      // If all requests were unsuccessful, display a general error.
      if (errors.length === contactIds.length) {
        return setStatus(`Unable to ${isEditMode ? 'edit' : 'create'} group.`);
      }

      // Go ahead and refresh the data. Even if there are partial failures,
      // we want up-to-date group/contact tables.
      update();

      // If a subset of requests were successful, display an error for each.
      if (errors.length > 0) {
        return setContactErrors(errors);
      }

      // Otherwise, we're all good. Close the drawer.
      closeDrawer();
    } catch (_) {
      // Since errors on individual requests are caught, this should never happen.
      setStatus(`Unable to ${isEditMode ? 'edit' : 'create'} group.`);
    }
  };

  // Find a contact by ID
  const contactMap = indexBy(contact => String(contact.id), contacts);

  return (
    <Drawer
      title={`${isEditMode ? 'Edit' : 'Create '} Group`}
      open={isOpen}
      onClose={closeDrawer}
    >
      <Formik
        initialValues={{
          name: selectedGroupName || '',
          contactIds: contacts
            .filter(thisContact => thisContact.group === selectedGroupName)
            .map(thisContact => thisContact.id)
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
              {contactErrors.map(id =>
                contactMap[id] ? (
                  <Grid key={id} item>
                    <Notice error spacingBottom={0}>
                      Error adding group to {contactMap[id].name}.
                    </Notice>
                  </Grid>
                ) : null
              )}

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
                  value={values.contactIds.map(id =>
                    contactMap[id]
                      ? {
                          value: id,
                          label: contactMap[id].name
                        }
                      : null
                  )}
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
