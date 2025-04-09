import {
  ActionsPanel,
  Button,
  Divider,
  Drawer,
  Notice,
  Typography,
} from '@linode/ui';
import { capitalize } from '@linode/utilities';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { NotFound } from 'src/components/NotFound';
import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';
import { useSpecificTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';

import { LabelInput } from './LabelInput';
import { LabelTable } from './LabelTable';
import { TaintInput } from './TaintInput';
import { TaintTable } from './TaintTable';

import type { KubeNodePoolResponse, Label, Taint } from '@linode/api-v4';

export interface Props {
  clusterId: number;
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

interface LabelsAndTaintsFormFields {
  labels: Label;
  taints: Taint[];
}

export const LabelAndTaintDrawer = (props: Props) => {
  const { clusterId, nodePool, onClose, open } = props;

  const [shouldShowLabelForm, setShouldShowLabelForm] = React.useState(false);
  const [shouldShowTaintForm, setShouldShowTaintForm] = React.useState(false);

  const typesQuery = useSpecificTypes(nodePool?.type ? [nodePool.type] : []);

  const { isPending, mutateAsync: updateNodePool } = useUpdateNodePoolMutation(
    clusterId,
    nodePool?.id ?? -1
  );

  const { control, formState, setValue, watch, ...form } =
    useForm<LabelsAndTaintsFormFields>({
      defaultValues: {
        labels: undefined,
        taints: undefined,
      },
    });

  React.useEffect(() => {
    if (!nodePool) {
      return;
    }
    if (open) {
      setValue('labels', nodePool?.labels);
      setValue('taints', nodePool?.taints);
    }
  }, [nodePool, open]);

  const onSubmit = async (values: LabelsAndTaintsFormFields) => {
    try {
      await updateNodePool({
        labels: values.labels,
        taints: values.taints,
      });
      handleClose();
    } catch (errResponse) {
      for (const error of errResponse) {
        if (!error.field) {
          form.setError('root', {
            message: `${capitalize(error.reason)}`,
          });
        }
        // Format error nicely so it includes the label or taint key for identification, if possible.
        if (error.field.includes('labels')) {
          const invalidLabelKey = error.field.split('.')[1]; // error.field will be: labels.key
          const invalidLabelPrefixText = invalidLabelKey
            ? `Error on ${invalidLabelKey}: `
            : '';
          form.setError('root', {
            message: `${invalidLabelPrefixText}${capitalize(error.reason)}`,
          });
        } else if (error.field.includes('taints')) {
          const index = error.field.slice(7, 8); // error.field will be: taints[i]
          const _taints = watch('taints');
          const invalidTaintPrefixText = _taints[index].key
            ? `Error on ${_taints[index].key}: `
            : '';
          form.setError('root', {
            message: `${invalidTaintPrefixText}${capitalize(error.reason)}`,
          });
        }
      }
    }
  };

  const handleClose = () => {
    setShouldShowLabelForm(false);
    setShouldShowTaintForm(false);
    onClose();
    form.reset();
  };

  const planType = typesQuery[0]?.data
    ? extendType(typesQuery[0].data)
    : undefined;

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={handleClose}
      open={open}
      title={`Labels and Taints: ${planType?.formattedLabel ?? 'Unknown'} Plan`}
    >
      {formState.errors.root?.message ? (
        <Notice
          spacingBottom={16}
          text={formState.errors.root.message}
          variant="error"
        />
      ) : null}
      <FormProvider
        control={control}
        formState={formState}
        setValue={setValue}
        watch={watch}
        {...form}
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Typography
            marginBottom={(theme) => theme.spacing(3)}
            marginTop={(theme) => theme.spacing()}
          >
            Manage custom labels and taints directly through LKE. Changes are
            applied to all nodes in this node pool.{' '}
            <Link to="https://techdocs.akamai.com/cloud-computing/docs/deploy-and-manage-a-kubernetes-cluster-with-the-api#add-labels-and-taints-to-your-lke-node-pools">
              Learn more
            </Link>
            .
          </Typography>

          <Typography variant="h3">Labels</Typography>
          <Typography>
            Labels are key-value pairs that are used as identifiers. Review the
            guidelines in the{' '}
            <Link
              external
              to="https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set"
            >
              Kubernetes documentation.
            </Link>
          </Typography>
          <LabelTable />
          <Button
            onClick={() => {
              {
                setShouldShowLabelForm(true);
              }
            }}
            buttonType="outlined"
            disabled={shouldShowLabelForm}
          >
            Add Label
          </Button>
          {shouldShowLabelForm && (
            <LabelInput
              handleCloseInputForm={() =>
                setShouldShowLabelForm(!shouldShowLabelForm)
              }
            />
          )}

          <Divider spacingBottom={32} spacingTop={32} />

          <Typography variant="h3">Taints</Typography>
          <Typography>
            Taints are used to control which pods can be placed on nodes in this
            node pool. They consist of a key, value, and effect. Review the
            guidelines in the{' '}
            <Link
              external
              to="https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/"
            >
              Kubernetes documentation.
            </Link>
          </Typography>
          <TaintTable />
          <Button
            onClick={() => {
              {
                setShouldShowTaintForm(true);
              }
            }}
            buttonType="outlined"
            disabled={shouldShowTaintForm}
          >
            Add Taint
          </Button>
          {shouldShowTaintForm && (
            <TaintInput
              handleCloseInputForm={() =>
                setShouldShowTaintForm(!shouldShowTaintForm)
              }
            />
          )}

          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: !formState.isDirty || isPending,
              label: 'Save Changes',
              loading: isPending,
              type: 'submit',
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: handleClose,
            }}
          />
        </form>
      </FormProvider>
    </Drawer>
  );
};
