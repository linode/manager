import { useDatabaseMutation } from '@linode/queries';
import { ActionsPanel, Drawer, Notice, Typography } from '@linode/ui';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import {
  ACCESS_CONTROLS_DRAWER_TEXT,
  ACCESS_CONTROLS_DRAWER_TEXT_LEGACY,
  ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT,
  ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT_LEGACY,
  LEARN_MORE_LINK,
  LEARN_MORE_LINK_LEGACY,
} from 'src/features/Databases/constants';
import { isDefaultDatabase } from 'src/features/Databases/utilities';
import { enforceIPMasks } from 'src/features/Firewalls/FirewallDetail/Rules/FirewallRuleDrawer.utils';
import {
  extendedIPToString,
  ipFieldPlaceholder,
  ipV6FieldPlaceholder,
  stringToExtendedIP,
  validateIPs,
} from 'src/utilities/ipUtils';

import type { Database, DatabaseInstance } from '@linode/api-v4';
import type { APIError } from '@linode/api-v4/lib/types';
import type { ExtendedIP } from 'src/utilities/ipUtils';

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

  const handleIPBlur = (_ips: ExtendedIP[]) => {
    const _ipsWithMasks = enforceIPMasks(_ips);

    const validatedIPs = validateIPs(_ipsWithMasks, {
      allowEmptyAddress: false,
      errorMessage: isDefaultDB
        ? ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT
        : ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT_LEGACY,
    });

    setValue('allow_list', validatedIPs);
  };

  const { mutateAsync: updateDatabase } = useDatabaseMutation(
    database.engine,
    database.id
  );

  const isDefaultDB = isDefaultDatabase(database);

  const onSubmit = async (values: ManageAccessControlValues) => {
    if (values.allow_list.some((ip) => ip.error)) {
      return;
    }

    // Get the IP address strings out of the objects and filter empty strings out.
    // Ensure we append /32 to all IPs if / is not already present.
    const allowListRetracted = values.allow_list.reduce((acc, currentIP) => {
      let ipString = extendedIPToString(currentIP);
      if (ipString === '') {
        return acc;
      }

      if (ipString.indexOf('/') === -1) {
        ipString += '/32';
      }

      return [...acc, ipString];
    }, []);

    try {
      await updateDatabase({ allow_list: [...allowListRetracted] });
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
    setValue,
  } = form;

  React.useEffect(() => {
    if (open) {
      reset(initialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset]);

  const learnMoreLink = isDefaultDB ? LEARN_MORE_LINK : LEARN_MORE_LINK_LEGACY;

  return (
    <Drawer onClose={onClose} open={open} title="Manage Access">
      {errors.root ? (
        <Notice text={errors.root.message} variant="error" />
      ) : null}
      {allowListErrors
        ? allowListErrors.map((allowListError) => (
            <Notice
              key={allowListError.reason}
              text={allowListError.reason}
              variant="error"
            />
          ))
        : null}
      <Typography marginBottom={4} variant="body1">
        {isDefaultDB
          ? ACCESS_CONTROLS_DRAWER_TEXT
          : ACCESS_CONTROLS_DRAWER_TEXT_LEGACY}{' '}
        <Link to={learnMoreLink}>Learn more</Link>.
      </Typography>
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
                onBlur={handleIPBlur}
                onChange={field.onChange}
                placeholder={
                  isDefaultDB ? ipV6FieldPlaceholder : ipFieldPlaceholder
                }
                title="Allowed IP Addresses or Ranges"
              />
            )}
          />
          <ActionsPanel
            primaryButtonProps={{
              disabled: !isDirty,
              label: 'Update Access Controls',
              loading: isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: onClose,
            }}
          />
        </form>
      </FormProvider>
    </Drawer>
  );
};
