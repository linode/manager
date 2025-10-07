import { useCreateFirewall } from '@linode/queries';
import {
  ActionsPanel,
  CircleProgress,
  Drawer,
  FormControlLabel,
  Notice,
  omitProps,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { createFirewallFromTemplate } from 'src/components/GenerateFirewallDialog/useCreateFirewallFromTemplate';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useGetLinodeCreateType } from 'src/features/Linodes/LinodeCreate/Tabs/utils/useGetLinodeCreateType';
import { sendLinodeCreateFormStepEvent } from 'src/utilities/analytics/formEventAnalytics';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { CustomFirewallFields } from './CustomFirewallFields';
import { createFirewallResolver } from './formUtilities';
import { TemplateFirewallFields } from './TemplateFirewallFields';

import type { CreateFirewallFormValues } from './formUtilities';
import type { Firewall, FirewallDeviceEntityType } from '@linode/api-v4';
import type { LinodeCreateFormEventOptions } from 'src/utilities/analytics/types';

export interface CreateFirewallDrawerProps {
  createFlow: FirewallDeviceEntityType | undefined;
  onClose: () => void;
  onFirewallCreated?: (firewall: Firewall) => void;
  open: boolean;
}

const createFirewallText = 'Create Firewall';

const initialValues: CreateFirewallFormValues = {
  createFirewallFrom: 'custom',
  devices: {
    linodes: [],
    nodebalancers: [],
  },
  label: '',
  rules: {
    inbound_policy: 'DROP',
    outbound_policy: 'ACCEPT',
  },
  templateSlug: undefined,
};

export const CreateFirewallDrawer = (props: CreateFirewallDrawerProps) => {
  const { createFlow, onClose, onFirewallCreated, open } = props;

  const queryClient = useQueryClient();

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const { mutateAsync: createFirewall } = useCreateFirewall();

  const { data: permissions, isLoading: isPermissionsLoading } = usePermissions(
    'account',
    ['create_firewall']
  );

  const { enqueueSnackbar } = useSnackbar();

  const createType = useGetLinodeCreateType();
  const isFromLinodeCreate = location.pathname.includes('/linodes/create');

  const firewallFormEventOptions: LinodeCreateFormEventOptions = {
    createType: createType ?? 'OS',
    headerName: createFirewallText,
    interaction: 'click',
    label: '',
  };

  const form = useForm<CreateFirewallFormValues>({
    defaultValues: initialValues,
    mode: 'onBlur',
    resolver: createFirewallResolver(),
    values: initialValues,
  });

  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
    watch,
  } = form;

  const createFirewallFrom = watch('createFirewallFrom');

  const onSubmit = async (values: CreateFirewallFormValues) => {
    const payload = omitProps(values, ['templateSlug', 'createFirewallFrom']);
    const slug = values.templateSlug;
    try {
      const firewall =
        createFirewallFrom === 'template' && slug
          ? await createFirewallFromTemplate({
              createFirewall,
              queryClient,
              firewallLabel: payload.label,
              templateSlug: slug,
            })
          : await createFirewall(payload);
      enqueueSnackbar(`Firewall ${values.label} successfully created`, {
        variant: 'success',
      });

      if (onFirewallCreated) {
        onFirewallCreated(firewall);
      }
      onClose();
      // Fire analytics form submit upon successful firewall creation from Linode Create flow.
      if (isFromLinodeCreate) {
        sendLinodeCreateFormStepEvent({
          ...firewallFormEventOptions,
          label: createFirewallText,
        });
      }
    } catch (errors) {
      for (const error of errors) {
        if (error?.field === 'rules') {
          setError('root', { message: error.reason });
        } else {
          setError(error?.field ?? 'root', { message: error.reason });
        }
      }
    }
  };

  if (isPermissionsLoading) {
    return <CircleProgress />;
  }

  return (
    <FormProvider {...form}>
      <Drawer
        onClose={onClose}
        onTransitionExited={() => reset()}
        open={open}
        title={createFirewallText}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {!permissions.create_firewall && (
            <Notice
              text="You don't have permissions to create a new Firewall. Please contact an account administrator for details."
              variant="error"
            />
          )}
          {errors.root?.message && (
            <Notice spacingTop={8} variant="error">
              <ErrorMessage
                entity={{ type: 'firewall_id' }}
                message={errors.root.message}
              />
            </Notice>
          )}
          {isLinodeInterfacesEnabled && (
            <>
              <Typography style={{ marginTop: 24 }}>
                <strong>Create</strong>
              </Typography>
              <Controller
                control={control}
                name="createFirewallFrom"
                render={({ field }) => (
                  <RadioGroup
                    aria-label="Create custom firewall or from a template"
                    data-testid="create-firewall-from-radio-group"
                    onChange={(_, value) => {
                      field.onChange(value);
                      clearErrors();
                    }}
                    row
                    value={field.value}
                  >
                    <FormControlLabel
                      control={<Radio />}
                      disabled={!permissions.create_firewall}
                      label="Custom Firewall"
                      value="custom"
                    />
                    <FormControlLabel
                      control={<Radio />}
                      disabled={!permissions.create_firewall}
                      label="From a Template"
                      value="template"
                    />
                  </RadioGroup>
                )}
              />
            </>
          )}
          <Controller
            control={control}
            name="label"
            render={({ field, fieldState }) => (
              <TextField
                aria-label="Label for your new Firewall"
                disabled={!permissions.create_firewall}
                errorText={fieldState.error?.message}
                label="Label"
                name="label"
                onBlur={field.onBlur}
                onChange={field.onChange}
                required
                value={field.value}
              />
            )}
          />
          {createFirewallFrom === 'template' && isLinodeInterfacesEnabled ? (
            <TemplateFirewallFields
              userCannotAddFirewall={!permissions.create_firewall}
            />
          ) : (
            <CustomFirewallFields
              createFlow={createFlow}
              firewallFormEventOptions={firewallFormEventOptions}
              isFromLinodeCreate={isFromLinodeCreate}
              open={open}
              userCannotAddFirewall={!permissions.create_firewall}
            />
          )}
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: !permissions.create_firewall,
              label: createFirewallText,
              loading: isSubmitting,
              onClick: handleSubmit(onSubmit),
              type: 'submit',
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: onClose,
            }}
          />
        </form>
      </Drawer>
    </FormProvider>
  );
};
