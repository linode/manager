import { Button, NotificationBanner } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import {
  ipV6FieldPlaceholder,
  stringToExtendedIP,
  validateIPs,
} from '@akamai/compute-ui-core/api';
import { useDatabaseMutation } from '@linode/queries';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import {
  ACCESS_CONTROLS_DRAWER_TEXT,
  ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT,
  LEARN_MORE_LINK,
} from 'src/features/Databases/constants';
import { enforceIPMasks } from 'src/features/Firewalls/FirewallDetail/Rules/FirewallRuleDrawer.utils';

import { Drawer } from '../shared/Drawer';
import { DrawerActions } from '../shared/DrawerActions';

import type { ExtendedIP } from '@akamai/compute-ui-core/api';
import type { APIError, Database, DatabaseInstance } from '@linode/api-v4';

interface Props {
  database: Database | DatabaseInstance;
  onClose: () => void;
  open: boolean;
}

interface ManageAccessControlValues {
  allow_list: ExtendedIP[];
}

export const ManageAccessControlDrawer = (props: Props) => {
  const { database, onClose, open } = props;

  const [allowListErrors, setAllowListErrors] = React.useState<APIError[]>();

  const handleValidateIPs = (_ips: ExtendedIP[]) => {
    const _ipsWithMasks = enforceIPMasks(_ips);

    const validatedIPs = validateIPs(_ipsWithMasks, {
      allowEmptyAddress: false,
      errorMessage: ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT,
    });

    setValue('allow_list', validatedIPs);
  };

  const { mutateAsync: updateDatabase } = useDatabaseMutation(
    database.engine,
    database.id
  );

  const onSubmit = async (values: ManageAccessControlValues) => {
    handleValidateIPs(values.allow_list);

    const allowList = getValues('allow_list');

    if (allowList.some((ip) => ip.error)) {
      return;
    }

    try {
      await updateDatabase({ allow_list: allowList.map((ip) => ip.address) });
      onClose();
    } catch (errors) {
      // Surface allow_list errors -- for example, "Invalid IPv4 address(es): ..."
      const allowListErrors = errors.filter(
        (error: APIError) => error.field === 'allow_list'
      );
      if (allowListErrors) {
        setAllowListErrors(allowListErrors);
      }

      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  const initialValues: ManageAccessControlValues = {
    allow_list: database?.allow_list
      ? database?.allow_list?.map(stringToExtendedIP)
      : [
          {
            address: '',
            error: '',
          },
        ],
  };

  const form = useForm<ManageAccessControlValues>({
    defaultValues: initialValues,
    mode: 'onBlur',
  });

  const {
    control,
    formState: { isSubmitting, errors, isDirty },
    handleSubmit,
    setError,
    reset,
    getValues,
    setValue,
  } = form;

  React.useEffect(() => {
    if (open) {
      reset(initialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset]);

  return (
    <Drawer onClose={onClose} open={open}>
      <span slot="header">Manage Access</span>
      <div slot="body">
        {errors.root && (
          <NotificationBanner
            style={{ marginBottom: Spacing.S16 }}
            text={errors.root.message}
            type="error"
          />
        )}
        {allowListErrors?.map((allowListError) => (
          <NotificationBanner
            key={allowListError.reason}
            style={{ marginBottom: Spacing.S16 }}
            text={allowListError.reason}
            type="error"
          />
        ))}
        <p style={{ marginBottom: Spacing.S32, marginTop: 0 }}>
          {ACCESS_CONTROLS_DRAWER_TEXT}{' '}
          <Link to={LEARN_MORE_LINK}>Learn more</Link>.
        </p>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              control={control}
              name="allow_list"
              render={({ field }) => (
                <MultipleIPInput
                  aria-label="Allowed IP Addresses or Ranges"
                  buttonText={
                    field.value && field.value.length > 0
                      ? 'Add Another IP'
                      : 'Add an IP'
                  }
                  forDatabaseAccessControls
                  inputProps={{ autoFocus: true }}
                  ips={field.value}
                  onBlur={handleValidateIPs}
                  onChange={field.onChange}
                  placeholder={ipV6FieldPlaceholder}
                  title="Allowed IP Addresses or Ranges"
                />
              )}
            />
            <DrawerActions>
              <Button onClick={onClose} variant="secondary">
                Cancel
              </Button>
              <Button
                disabled={!isDirty}
                processing={isSubmitting}
                type="submit"
                variant="primary"
              >
                Update Access Controls
              </Button>
            </DrawerActions>
          </form>
        </FormProvider>
      </div>
    </Drawer>
  );
};
