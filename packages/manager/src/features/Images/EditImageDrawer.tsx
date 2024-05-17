import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { TextField } from 'src/components/TextField';
import { useUpdateImageMutation } from 'src/queries/images';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import { useImageAndLinodeGrantCheck } from './utils';

interface Props {
  changeDescription: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeTags: (tags: string[]) => void;
  description?: string;
  imageID?: string;
  label?: string;
  onClose: () => void;
  open: boolean;
  tags?: string[];
}
export const EditImageDrawer = (props: Props) => {
  const {
    changeDescription,
    changeLabel,
    changeTags,
    description,
    imageID,
    label,
    onClose,
    open,
    tags,
  } = props;

  const { canCreateImage } = useImageAndLinodeGrantCheck();

  const [notice, setNotice] = React.useState(undefined);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  const { mutateAsync: updateImage } = useUpdateImageMutation();

  const safeDescription = description ? description : ' ';

  const onSubmit = () => {
    if (!imageID) {
      return;
    }

    setErrors(undefined);
    setNotice(undefined);
    setSubmitting(true);

    updateImage({ description: safeDescription, imageId: imageID, label, tags })
      .then(onClose)
      .catch((errorResponse: APIError[]) => {
        setErrors(getAPIErrorOrDefault(errorResponse, 'Unable to edit Image'));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const hasErrorFor = getAPIErrorFor(
    {
      disk_id: 'Disk',
      label: 'Label',
      linode_id: 'Linode',
      region: 'Region',
      size: 'Size',
    },
    errors
  );
  const labelError = hasErrorFor('label');
  const descriptionError = hasErrorFor('description');
  const generalError = hasErrorFor('none');
  const tagsError = hasErrorFor('tags');

  return (
    <Drawer onClose={onClose} open={open} title="Edit Image">
      {!canCreateImage ? (
        <Notice
          text="You don't have permissions to create a new Image. Please contact an account administrator for details."
          variant="error"
        />
      ) : null}
      {generalError && (
        <Notice data-qa-notice text={generalError} variant="error" />
      )}

      {notice && <Notice data-qa-notice text={notice} variant="info" />}

      <TextField
        data-qa-image-label
        disabled={!canCreateImage}
        error={Boolean(labelError)}
        errorText={labelError}
        label="Label"
        onChange={changeLabel}
        value={label}
      />
      <TextField
        data-qa-image-description
        disabled={!canCreateImage}
        error={Boolean(descriptionError)}
        errorText={descriptionError}
        label="Description"
        multiline
        onChange={changeDescription}
        rows={1}
        value={description}
      />
      <TagsInput
        disabled={!canCreateImage}
        label="Tags"
        onChange={(tags) => changeTags(tags.map((tag) => tag.value))}
        tagError={tagsError}
        value={tags?.map((t) => ({ label: t, value: t })) ?? []}
      />

      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          disabled: !canCreateImage,
          label: 'Save Changes',
          loading: submitting,
          onClick: onSubmit,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          disabled: !canCreateImage,
          label: 'Cancel',
          onClick: onClose,
        }}
        style={{ marginTop: 16 }}
      />
    </Drawer>
  );
};
