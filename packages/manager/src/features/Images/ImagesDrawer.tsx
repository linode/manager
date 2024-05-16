import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { TextField } from 'src/components/TextField';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import { useUpdateImageMutation } from 'src/queries/images';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import { useImageAndLinodeGrantCheck } from './utils';

export interface Props {
  changeDescription: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeDisk: (disk: null | string) => void;
  changeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeLinode: (linodeId: number) => void;
  changeTags: (tags: string[]) => void;
  description?: string;
  imageId?: string;
  label?: string;
  mode: DrawerMode;
  onClose: () => void;
  open?: boolean;
  selectedLinode: null | number;
  tags?: string[];
}

type CombinedProps = Props;

export type DrawerMode = 'edit' | 'restore';

const titleMap: Record<DrawerMode, string> = {
  edit: 'Edit Image',
  restore: 'Restore from Image',
};

const buttonTextMap: Record<DrawerMode, string> = {
  edit: 'Save Changes',
  restore: 'Restore Image',
};

export const ImagesDrawer = (props: CombinedProps) => {
  const {
    changeDescription,
    changeLabel,
    changeLinode,
    changeTags,
    description,
    imageId,
    label,
    mode,
    onClose,
    open,
    selectedLinode,
    tags,
  } = props;

  const history = useHistory();
  const {
    canCreateImage,
    permissionedLinodes: availableLinodes,
  } = useImageAndLinodeGrantCheck();

  const [notice, setNotice] = React.useState(undefined);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  const { mutateAsync: updateImage } = useUpdateImageMutation();

  const handleLinodeChange = (linodeID: number) => {
    // Clear any errors
    setErrors(undefined);
    changeLinode(linodeID);
  };

  const safeDescription = description ? description : ' ';

  const onSubmit = () => {
    setErrors(undefined);
    setNotice(undefined);
    setSubmitting(true);

    switch (mode) {
      case 'edit':
        if (!imageId) {
          setSubmitting(false);
          return;
        }

        updateImage({ description: safeDescription, imageId, label, tags })
          .then(onClose)
          .catch((errorResponse: APIError[]) => {
            setErrors(
              getAPIErrorOrDefault(errorResponse, 'Unable to edit Image')
            );
          })
          .finally(() => {
            setSubmitting(false);
          });
        return;

      case 'restore':
        if (!selectedLinode) {
          setSubmitting(false);
          setErrors([{ field: 'linode_id', reason: 'Choose a Linode.' }]);
          return;
        }
        close();
        history.push({
          pathname: `/linodes/${selectedLinode}/rebuild`,
          state: { selectedImageId: imageId },
        });
      default:
        return;
    }
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
  const linodeError = hasErrorFor('linode_id');
  const tagsError = hasErrorFor('tags');

  return (
    <Drawer onClose={onClose} open={open} title={titleMap[mode]}>
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

      {mode == 'restore' && (
        <LinodeSelect
          onSelectionChange={(linode) => {
            if (linode !== null) {
              handleLinodeChange(linode.id);
            }
          }}
          optionsFilter={(linode) =>
            availableLinodes ? availableLinodes.includes(linode.id) : true
          }
          clearable={false}
          disabled={!canCreateImage}
          errorText={linodeError}
          value={selectedLinode}
        />
      )}

      {mode == 'edit' && (
        <>
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
        </>
      )}

      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          disabled: (mode == 'restore' && !selectedLinode) || !canCreateImage,
          label: buttonTextMap[mode] ?? 'Submit',
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
