import { handleFieldErrors } from 'src/utilities/formikErrorUtils';
import { handleGeneralErrors } from 'src/utilities/formikErrorUtils';

import type { ManagedContactGroup } from './Contacts/common';
import type { APIError, ManagedContact } from '@linode/api-v4';
import type { FormikErrors } from 'formik';

interface HandleManagedErrorsProps<T> {
  apiError: APIError[];
  defaultMessage: string;
  setErrors: (errors: FormikErrors<T>) => void;
  setStatus: (status: unknown) => void;
  setSubmitting: (submitting: boolean) => void;
}

export const handleManagedErrors = <T>({
  apiError,
  defaultMessage,
  setErrors,
  setStatus,
  setSubmitting,
}: HandleManagedErrorsProps<T>) => {
  const mapErrorToStatus = (generalError: string) =>
    setStatus({ generalError });

  handleFieldErrors(setErrors, apiError);
  handleGeneralErrors(mapErrorToStatus, apiError, defaultMessage);
  setSubmitting(false);
};

/**
 * Generate groups from a list of Managed Contacts.
 *
 * @param contacts: Linode.ManagedContact[]
 * A list of contacts to generate groups from.
 */
export const generateGroupsFromContacts = (
  contacts: ManagedContact[]
): ManagedContactGroup[] => {
  const groups: ManagedContactGroup[] = [];

  contacts.forEach((contact) => {
    // If the contact doesn't have a group, don't do anything. Otherwise we'd have `null` groups.
    if (typeof contact.group !== 'string') {
      return;
    }

    // Have we tracked this group yet?
    const idx = groups.findIndex((group) => group.groupName === contact.group);

    // If not, add a new group.
    if (idx === -1) {
      groups.push({
        contactNames: [contact.name],
        groupName: contact.group,
      });
    } else {
      // If we've already tracked the group, just add this contact's name.
      groups[idx].contactNames.push(contact.name);
    }
  });

  return groups;
};
