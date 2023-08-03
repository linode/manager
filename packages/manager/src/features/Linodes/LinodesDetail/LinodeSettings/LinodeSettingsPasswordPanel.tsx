import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Accordion } from 'src/components/Accordion';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import EnhancedSelect from 'src/components/EnhancedSelect/Select';
import { Notice } from 'src/components/Notice/Notice';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import {
  useAllLinodeDisksQuery,
  useLinodeDiskChangePasswordMutation,
} from 'src/queries/linodes/disks';
import {
  useLinodeChangePasswordMutation,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';
import { useTypeQuery } from 'src/queries/types';
import { getErrorMap } from 'src/utilities/errorUtils';

const PasswordInput = React.lazy(
  () => import('src/components/PasswordInput/PasswordInput')
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
    isLoading: isLinodePasswordLoading,
    mutateAsync: changeLinodePassword,
  } = useLinodeChangePasswordMutation(linodeId);
  const {
    error: diskPasswordError,
    isLoading: isDiskPasswordLoading,
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

  // If there is only one selectable disk, select it automaticly
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
        {generalError && <Notice error text={generalError} />}
        {!isBareMetalInstance ? (
          <EnhancedSelect
            data-qa-select-linode
            disabled={isReadOnly}
            errorText={disksError?.[0].reason}
            isClearable={false}
            isLoading={disksLoading}
            label="Disk"
            onChange={(item) => setSelectedDiskId(item.value)}
            options={diskOptions}
            placeholder="Select a Disk"
            value={diskOptions?.find((item) => item.value === selectedDiskId)}
          />
        ) : null}
        <React.Suspense fallback={<SuspenseLoader />}>
          <PasswordInput
            disabledReason={
              isReadOnly
                ? "You don't have permissions to modify this Linode"
                : undefined
            }
            autoComplete="new-password"
            data-qa-password-input
            disabled={isReadOnly}
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
