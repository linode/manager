import { useSnackbar } from 'notistack';
import * as React from 'react';
import Accordion from 'src/components/Accordion';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import EnhancedSelect from 'src/components/EnhancedSelect/Select';
import { Notice } from 'src/components/Notice/Notice';
import SuspenseLoader from 'src/components/SuspenseLoader';
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
  linodeId: number;
  isReadOnly?: boolean;
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

  const [selectedDiskId, setSelectedDiskId] = React.useState<number | null>(
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
    <ActionsPanel>
      <Button
        buttonType="primary"
        onClick={onSubmit}
        loading={isLoading}
        disabled={isReadOnly || linode?.status !== 'offline'}
        data-qa-password-save
        tooltipText={
          linode?.status !== 'offline'
            ? 'Your Linode must be fully powered down in order to change your root password'
            : ''
        }
      >
        Save
      </Button>
    </ActionsPanel>
  );

  return (
    <Accordion
      heading="Reset Root Password"
      actions={() => actions}
      defaultExpanded
    >
      <form>
        {generalError && <Notice text={generalError} error />}
        {!isBareMetalInstance ? (
          <EnhancedSelect
            label="Disk"
            placeholder="Select a Disk"
            isLoading={disksLoading}
            errorText={disksError?.[0].reason}
            options={diskOptions}
            onChange={(item) => setSelectedDiskId(item.value)}
            value={diskOptions?.find((item) => item.value === selectedDiskId)}
            data-qa-select-linode
            disabled={isReadOnly}
            isClearable={false}
          />
        ) : null}
        <React.Suspense fallback={<SuspenseLoader />}>
          <PasswordInput
            autoComplete="new-password"
            label="New Root Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errorText={passwordError}
            errorGroup="linode-settings-password"
            error={Boolean(passwordError)}
            data-qa-password-input
            disabled={isReadOnly}
            disabledReason={
              isReadOnly
                ? "You don't have permissions to modify this Linode"
                : undefined
            }
          />
        </React.Suspense>
      </form>
    </Accordion>
  );
};
