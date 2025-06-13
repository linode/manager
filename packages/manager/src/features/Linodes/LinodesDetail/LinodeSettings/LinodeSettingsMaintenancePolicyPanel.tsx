import { useLinodeQuery, useLinodeUpdateMutation } from '@linode/queries';
import {
  Accordion,
  BetaChip,
  Box,
  Button,
  Stack,
  Typography,
} from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';
import {
  MAINTENANCE_POLICY_DESCRIPTION,
  MAINTENANCE_POLICY_LEARN_MORE_URL,
  MAINTENANCE_POLICY_TITLE,
} from 'src/components/MaintenancePolicySelect/constants';
import { MaintenancePolicySelect } from 'src/components/MaintenancePolicySelect/MaintenancePolicySelect';
import { useFlags } from 'src/hooks/useFlags';

import type { AccountSettings } from '@linode/api-v4';

interface Props {
  isReadOnly?: boolean;
  linodeId: number;
}

type MaintenancePolicyValues = Pick<AccountSettings, 'maintenance_policy'>;

export const LinodeSettingsMaintenancePolicyPanel = (props: Props) => {
  const { isReadOnly, linodeId } = props;
  const { data: linode } = useLinodeQuery(linodeId);
  const { mutateAsync: updateLinode } = useLinodeUpdateMutation(linodeId);

  const { enqueueSnackbar } = useSnackbar();
  const flags = useFlags();

  const values: MaintenancePolicyValues = {
    maintenance_policy: linode?.maintenance_policy ?? 'migrate',
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
      setError('maintenance_policy', { message: error[0].reason });
    }
  };

  return (
    <Accordion
      defaultExpanded
      heading={
        <>
          {MAINTENANCE_POLICY_TITLE}{' '}
          {flags.vmHostMaintenance?.beta && <BetaChip />}
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography>
            {MAINTENANCE_POLICY_DESCRIPTION}{' '}
            <Link to={MAINTENANCE_POLICY_LEARN_MORE_URL}>Learn more</Link>.
          </Typography>
          <Controller
            control={control}
            name="maintenance_policy"
            render={({ field, fieldState }) => (
              <MaintenancePolicySelect
                disabled={isReadOnly}
                errorText={fieldState.error?.message}
                onChange={(policy) => field.onChange(policy.slug)}
                value={field.value}
              />
            )}
          />
          <Box>
            <Button
              buttonType="outlined"
              disabled={!isDirty || isReadOnly}
              loading={isSubmitting}
              type="submit"
            >
              Save
            </Button>
          </Box>
        </Stack>
      </form>
    </Accordion>
  );
};
