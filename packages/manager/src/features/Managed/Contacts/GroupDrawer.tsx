import * as Bluebird from 'bluebird';
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

// interface Accumulator {
//   success:
// }

interface ContactError {
  contactId: number;
  errorText: string;
}

type CombinedProps = Props;

const GroupDrawer: React.FC<CombinedProps> = props => {
  const { isOpen, closeDrawer, mode, contacts, group, update } = props;

  const [contactErrors, setContactErrors] = React.useState<ContactError[]>([]);

  const isEditing = mode === 'edit' && group;

  const onSubmit = (
    values: GroupForm,
    { setSubmitting, setStatus }: FormikActions<GroupForm>
  ) => {
    setStatus(undefined);
    setContactErrors([]);

    const accumulator = (accum: any, thisContactId: number) =>
      updateContact(thisContactId, { group: values.name })
        .then(res => {
          return {
            ...accum,
            success: [...accum.success, res]
          };
        })
        .catch(error => {
          return {
            ...accum,
            errors: [...accum.errors, { contactId: thisContactId, error }]
          };
        });

    Bluebird.reduce(values.contactIds, accumulator, {
      success: [],
      errors: []
    }).then(res => {
      setSubmitting(false);

      // If all requests were unsuccessful, display a general error.
      if (res.errors.length === values.contactIds.length) {
        return setStatus('Unable to create Group.');
      }

      // If a subset of requests were successful, display a <Notice /> for each.
      if (res.errors.length > 0) {
        return setContactErrors(res.errors);
      }

      // Otherwise, we're all good. Refresh the data and close the drawer.
      update();
      closeDrawer();
    });
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
              {contactErrors.map(thisContactError => {
                const foundContact = contacts.find(
                  thisContact => thisContact.id === thisContactError.contactId
                );
                return foundContact ? (
                  <Grid
                    key={thisContactError.contactId}
                    item
                    data-qa-import-error
                  >
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
