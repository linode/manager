/**
 * @todo Display the volume configuration information on success.
 */
import { Linode } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import { CreateVolumeSchema } from '@linode/validation/lib/volumes.schema';
import { Form, Formik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { array, object, string } from 'yup';

import { Tag, TagsInput } from 'src/components/TagsInput/TagsInput';
import { Typography } from 'src/components/Typography';
import { MAX_VOLUME_SIZE } from 'src/constants';
import { resetEventsPolling } from 'src/eventsPolling';
import { useGrants, useProfile } from 'src/queries/profile';
import { useCreateVolumeMutation } from 'src/queries/volumes';
import { sendCreateVolumeEvent } from 'src/utilities/analytics';
import { getErrorMap, getErrorStringOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { maybeCastToNumber } from 'src/utilities/maybeCastToNumber';

import { ConfigSelect } from './ConfigSelect';
import LabelField from './LabelField';
import NoticePanel from './NoticePanel';
import { PricePanel } from './PricePanel';
import SizeField from './SizeField';
import VolumesActionsPanel from './VolumesActionsPanel';

interface Props {
  linode: Linode;
  onClose: () => void;
}

interface FormState {
  config_id: number;
  label: string;
  linode_id: number;
  region: string;
  size: number;
  tags: Tag[];
}

const initialValues: FormState = {
  config_id: -1,
  label: '',
  linode_id: -1,
  region: 'none',
  size: 20,
  tags: [],
};

export const LinodeVolumeCreateForm = (props: Props) => {
  const { linode, onClose } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { mutateAsync: createVolume } = useCreateVolumeMutation();

  const disabled = profile?.restricted && !grants?.global.add_volumes;

  // The original schema expects tags to be an array of strings, but Formik treats
  // tags as _Tag[], so we extend the schema to transform tags before validation.
  const extendedCreateVolumeSchema = CreateVolumeSchema.concat(
    object({
      tags: array()
        .transform((tagItems: Tag[]) =>
          tagItems.map((thisTagItem) => thisTagItem.value)
        )
        .of(string()),
    })
  );

  return (
    <Formik
      onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
        const { config_id, label, size, tags } = values;

        setSubmitting(true);

        /** Status holds our success and generalError messages. */
        setStatus(undefined);

        createVolume({
          config_id:
            // If the config_id still set to default value of -1, set this to undefined, so volume gets created on back-end according to the API logic
            config_id === -1 ? undefined : maybeCastToNumber(config_id),
          label,
          linode_id: maybeCastToNumber(linode.id),
          size: maybeCastToNumber(size),
          tags: tags.map((v) => v.value),
        })
          .then(() => {
            resetEventsPolling();
            enqueueSnackbar(`Volume scheduled for creation.`, {
              variant: 'success',
            });
            onClose();
            // Analytics Event
            sendCreateVolumeEvent(`Size: ${size}GB`, origin);
          })
          .catch((errorResponse) => {
            const defaultMessage = `Unable to create a volume at this time. Please try again later.`;
            const mapErrorToStatus = () =>
              setStatus({
                generalError: getErrorMap([], errorResponse).none,
              });

            setSubmitting(false);
            handleFieldErrors(setErrors, errorResponse);
            handleGeneralErrors(
              mapErrorToStatus,
              errorResponse,
              defaultMessage
            );
          });
      }}
      initialValues={initialValues}
      validationSchema={extendedCreateVolumeSchema}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        resetForm,
        setFieldValue,
        status,
        touched,
        values,
      }) => {
        /**
         * This form doesn't have a region select (the region is auto-populated)
         * so if the API returns an error with field === 'region' the field mapping
         * logic will pass over it. Explicitly use general error Notice in this case.
         * If configs are not available, set the general error Notice to the config_id error (so that the error still shows in the UI instead of creation failing silently).
         */

        const { config_id } = values;

        const generalError = status
          ? status.generalError
          : config_id === -1
          ? errors.config_id
          : errors.region;

        return (
          <Form>
            {generalError && <NoticePanel error={generalError} />}
            {status && <NoticePanel success={status.success} />}
            {disabled && (
              <NoticePanel
                error={
                  "You don't have permissions to create a new Volume. Please contact an account administrator for details."
                }
                important
              />
            )}
            <Typography
              sx={(theme) => ({
                marginBottom: theme.spacing(1.25),
              })}
              data-qa-volume-attach-help
              style={{ marginTop: 24 }}
              variant="body1"
            >
              {`This volume will be immediately scheduled for attachment to ${linode.label} and available to other Linodes in the ${linode.region} data-center.`}
            </Typography>

            <Typography
              sx={(theme) => ({
                marginBottom: theme.spacing(1.25),
              })}
              data-qa-volume-size-help
              variant="body1"
            >
              A single Volume can range from 10 to {MAX_VOLUME_SIZE} gigabytes
              in size and costs $0.10/GB per month. Up to eight volumes can be
              attached to a single Linode.
            </Typography>

            <LabelField
              disabled={disabled}
              error={touched.label ? errors.label : undefined}
              name="label"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.label}
            />

            <SizeField
              disabled={disabled}
              error={touched.size ? errors.size : undefined}
              isFromLinode
              name="size"
              onBlur={handleBlur}
              onChange={handleChange}
              regionId={linode.region}
              value={values.size}
            />

            <ConfigSelect
              disabled={disabled}
              error={touched.config_id ? errors.config_id : undefined}
              linodeId={linode.id}
              name="configId"
              onBlur={handleBlur}
              onChange={(id: number) => setFieldValue('config_id', id)}
              value={values.config_id}
            />

            <TagsInput
              tagError={
                touched.tags
                  ? errors.tags
                    ? getErrorStringOrDefault(
                        errors.tags as APIError[],
                        'Unable to tag volume.'
                      )
                    : undefined
                  : undefined
              }
              disabled={disabled}
              label="Tags"
              name="tags"
              onChange={(selected) => setFieldValue('tags', selected)}
              value={values.tags}
            />

            <PricePanel
              currentSize={10}
              regionId={linode.region}
              value={values.size}
            />

            <VolumesActionsPanel
              onCancel={() => {
                resetForm();
                onClose();
              }}
              disabled={disabled}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              submitText="Create Volume"
            />
          </Form>
        );
      }}
    </Formik>
  );
};
