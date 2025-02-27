import {
  FormControlLabel,
  Notice,
  Radio,
  RadioGroup,
  Typography,
  omitProps,
} from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { createFirewallFromTemplate } from 'src/components/GenerateFirewallDialog/useCreateFirewallFromTemplate';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useCreateFirewall } from 'src/queries/firewalls';
import { sendLinodeCreateFormStepEvent } from 'src/utilities/analytics/formEventAnalytics';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import { CustomFirewallFields } from './CustomFirewallFields';
import { createFirewallResolver } from './formUtilities';
import { TemplateFirewallFields } from './TemplateFirewallFields';

import type { CreateFirewallFormValues } from './formUtilities';
import type { Firewall, FirewallDeviceEntityType } from '@linode/api-v4';
import type { LinodeCreateQueryParams } from 'src/features/Linodes/types';
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

export const CreateFirewallDrawer = React.memo(
  (props: CreateFirewallDrawerProps) => {
    // TODO: NBFW - We'll eventually want to check the read_write firewall grant here too, but it doesn't exist yet.
    const { createFlow, onClose, onFirewallCreated, open } = props;
    const { _hasGrant, _isRestrictedUser } = useAccountManagement();
    const { mutateAsync: createFirewall } = useCreateFirewall();
    const queryClient = useQueryClient();
    const { isLinodeInterfaceEnabled } = useIsLinodeInterfacesEnabled();

    const { enqueueSnackbar } = useSnackbar();

    const location = useLocation();
    const isFromLinodeCreate = location.pathname.includes('/linodes/create');
    const queryParams = getQueryParamsFromQueryString<LinodeCreateQueryParams>(
      location.search
    );

    const firewallFormEventOptions: LinodeCreateFormEventOptions = {
      createType: queryParams.type ?? 'OS',
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

    const userCannotAddFirewall =
      _isRestrictedUser && !_hasGrant('add_firewalls');

    return (
      <FormProvider {...form}>
        <Drawer
          onClose={onClose}
          onTransitionExited={() => reset()}
          open={open}
          title={createFirewallText}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            {userCannotAddFirewall ? (
              <Notice
                text="You don't have permissions to create a new Firewall. Please contact an account administrator for details."
                variant="error"
              />
            ) : null}
            {errors.root?.message && (
              <Notice spacingTop={8} variant="error">
                <ErrorMessage
                  entity={{ type: 'firewall_id' }}
                  message={errors.root.message}
                />
              </Notice>
            )}
            {isLinodeInterfaceEnabled && (
              <>
                <Typography style={{ marginTop: 24 }}>
                  <strong>Create</strong>
                </Typography>
                <Controller
                  render={({ field }) => (
                    <RadioGroup
                      onChange={(_, value) => {
                        field.onChange(value);
                        clearErrors();
                      }}
                      aria-label="Create custom firewall or from a template"
                      data-testid="create-firewall-from"
                      row
                      value={field.value}
                    >
                      <FormControlLabel
                        control={<Radio />}
                        label="Custom Firewall"
                        value="custom"
                      />
                      <FormControlLabel
                        control={<Radio />}
                        label="From a Template"
                        value="template"
                      />
                    </RadioGroup>
                  )}
                  control={control}
                  name="createFirewallFrom"
                />
              </>
            )}
            {createFirewallFrom === 'template' && isLinodeInterfaceEnabled ? (
              <TemplateFirewallFields
                userCannotAddFirewall={userCannotAddFirewall}
              />
            ) : (
              <CustomFirewallFields
                createFlow={createFlow}
                firewallFormEventOptions={firewallFormEventOptions}
                isFromLinodeCreate={isFromLinodeCreate}
                open={open}
                userCannotAddFirewall={userCannotAddFirewall}
              />
            )}
            <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'submit',
                disabled: userCannotAddFirewall,
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
  }
);
