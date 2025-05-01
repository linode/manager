import {
  useAllLinodeDisksQuery,
  useLinodeChangePasswordMutation,
  useLinodeDiskChangePasswordMutation,
  useLinodeQuery,
} from '@linode/queries';
import { Accordion, ActionsPanel, Notice, Select } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useTypeQuery } from 'src/queries/types';
import { getErrorMap } from 'src/utilities/errorUtils';

const PasswordInput = React.lazy(() =>
  import('src/components/PasswordInput/PasswordInput').then((module) => ({
    default: module.PasswordInput,
  }))
);

interface Props {
  isReadOnly?: boolean;
  linodeId: number;
}

export const LinodeSettingsPasswordPanel = (props: Props) => {
  const { isReadOnly, linodeId } = props;
  const { data: linode } = useLinodeQuery(linodeId);

  const {
    data: disks,
    error: disksError,
    isLoading: disksLoading,
  } = useAllLinodeDisksQuery(linodeId);

  const { enqueueSnackbar } = useSnackbar();

  const { data: type } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );

  const [selectedDiskId, setSelectedDiskId] = React.useState<null | number>(
    null
  );
  const [password, setPassword] = React.useState<string>('');

  const {
    error: linodePasswordError,
    isPending: isLinodePasswordLoading,
    mutateAsync: changeLinodePassword,
  } = useLinodeChangePasswordMutation(linodeId);
  const {
    error: diskPasswordError,
    isPending: isDiskPasswordLoading,
    mutateAsync: changeLinodeDiskPassword,
  } = useLinodeDiskChangePasswordMutation(linodeId, selectedDiskId ?? -1);

  const isBareMetalInstance = type?.class === 'metal';

  const isLoading = isBareMetalInstance
    ? isLinodePasswordLoading
    : isDiskPasswordLoading;

  const error = isBareMetalInstance ? linodePasswordError : diskPasswordError;

  const onSubmit = async () => {
    if (isBareMetalInstance) {
      await changeLinodePassword({ root_pass: password });
    } else {
      await changeLinodeDiskPassword({ password });
    }
    setPassword('');
    enqueueSnackbar('Sucessfully changed password', { variant: 'success' });
  };

  const errorMap = getErrorMap(['root_pass', 'password'], error);

  const passwordError = isBareMetalInstance
    ? errorMap.root_pass
    : errorMap.password;

  const generalError = errorMap.none;

  const diskOptions = disks
    ?.filter((d) => d.filesystem !== 'swap')
    .map((d) => ({ label: d.label, value: d.id }));

  // If there is only one selectable disk, select it automatically
  React.useEffect(() => {
    if (diskOptions !== undefined && diskOptions.length === 1) {
      setSelectedDiskId(diskOptions[0].value);
    }
  }, [diskOptions]);

  const actions = (
    <StyledActionsPanel
      primaryButtonProps={{
        'data-testid': 'password - save',
        disabled: isReadOnly || linode?.status !== 'offline',
        label: 'Save',
        loading: isLoading,
        onClick: onSubmit,
        tooltipText:
          linode?.status !== 'offline'
            ? 'Your Linode must be fully powered down in order to change your root password'
            : '',
      }}
    />
  );

  return (
    <Accordion
      actions={() => actions}
      defaultExpanded
      heading="Reset Root Password"
    >
      <form>
        {generalError && <Notice text={generalError} variant="error" />}
        {!isBareMetalInstance ? (
          <Select
            data-qa-select-linode
            disabled={isReadOnly}
            errorText={disksError?.[0].reason}
            label="Disk"
            loading={disksLoading}
            onChange={(_, item) =>
              setSelectedDiskId(Number(item?.value) || null)
            }
            options={diskOptions ?? []}
            placeholder="Select a Disk"
            value={
              diskOptions?.find((item) => item.value === selectedDiskId) ?? null
            }
          />
        ) : null}
        <React.Suspense fallback={<SuspenseLoader />}>
          <PasswordInput
            autoComplete="new-password"
            data-qa-password-input
            disabled={isReadOnly}
            disabledReason={
              isReadOnly
                ? "You don't have permissions to modify this Linode"
                : undefined
            }
            error={Boolean(passwordError)}
            errorGroup="linode-settings-password"
            errorText={passwordError}
            label="New Root Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </React.Suspense>
      </form>
    </Accordion>
  );
};

const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionsPanel',
})({
  justifyContent: 'flex-start',
  margin: 0,
});
