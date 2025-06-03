import { useLinodeQuery, useLinodeUpdateMutation } from '@linode/queries';
import { Accordion, ActionsPanel, BetaChip, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { MaintenancePolicySelect } from 'src/components/MaintenancePolicySelect/MaintenancePolicySelect';
import { useFlags } from 'src/hooks/useFlags';

import type { AccountSettings, MaintenancePolicyId } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';

interface Props {
  isReadOnly?: boolean;
  linodeId: number;
}

type MaintenancePolicyValues = Pick<AccountSettings, 'maintenance_policy_id'>;

export const LinodeSettingsMaintenancePolicyPanel = (props: Props) => {
  const { isReadOnly, linodeId } = props;
  const { data: linode } = useLinodeQuery(linodeId);
  const { mutateAsync: updateLinode } = useLinodeUpdateMutation(linodeId);

  const { enqueueSnackbar } = useSnackbar();
  const flags = useFlags();

  const values: MaintenancePolicyValues = {
    maintenance_policy_id: linode?.maintenance_policy_id ?? 1,
  };

  const {
    control,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<MaintenancePolicyValues>({
    defaultValues: values,
    values,
  });

  const onSubmit = async (values: MaintenancePolicyValues) => {
    try {
      await updateLinode(values);
      enqueueSnackbar('Host Maintenance Policy settings updated.', {
        variant: 'success',
      });
    } catch (error) {
      setError('maintenance_policy_id', { message: error[0].reason });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Accordion
        actions={() => (
          <StyledActionsPanel
            primaryButtonProps={{
              buttonType: 'outlined',
              disabled: !isDirty || isReadOnly,
              loading: isSubmitting,
              type: 'submit',
              label: 'Save',
            }}
          />
        )}
        defaultExpanded
        heading={
          <>
            Host Maintenance Policy{' '}
            {flags.vmHostMaintenance?.beta && <BetaChip />}
          </>
        }
      >
        <Typography>
          Set the preferred host maintenance policy for this Linode. During host
          maintenance events (such as host upgrades), this policy setting helps
          determine which maintenance method is performed.{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/host-maintenance-policy">
            Learn more
          </Link>
          .
        </Typography>
        <Controller
          control={control}
          name="maintenance_policy_id"
          render={({ field, fieldState }) => (
            <MaintenancePolicySelect
              disabled={isReadOnly}
              errorText={fieldState.error?.message}
              onChange={(_, item: SelectOption<MaintenancePolicyId>) => {
                field.onChange(item?.value);
              }}
              sx={(theme) => ({
                [theme.breakpoints.up('md')]: {
                  minWidth: '480px',
                },
              })}
              textFieldProps={{
                expand: true,
                sx: {
                  width: '468px',
                },
              }}
              value={field.value}
            />
          )}
        />
      </Accordion>
    </form>
  );
};

const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionsPanel',
})({
  justifyContent: 'flex-start',
  margin: 0,
});
