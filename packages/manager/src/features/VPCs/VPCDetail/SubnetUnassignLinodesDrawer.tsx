import { Subnet } from '@linode/api-v4/lib/vpcs/types';
import { Stack } from '@mui/material';
import { useFormik } from 'formik';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import { debounce } from 'throttle-debounce';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { RemovableSelectionsList } from 'src/components/RemovableSelectionsList/RemovableSelectionsList';
import { useFormattedDate } from 'src/hooks/useFormattedDate';
import { usePrevious } from 'src/hooks/usePrevious';
import { useUnassignLinode } from 'src/hooks/useUnassignLinode';
import {
  queryKey as linodesQueryKey,
  useAllLinodesQuery,
} from 'src/queries/linodes/linodes';
import { getAllLinodeConfigs } from 'src/queries/linodes/requests';
import { useGrants, useProfile } from 'src/queries/profile';

import type {
  APIError,
  DeleteLinodeConfigInterfacePayload,
  Linode,
  UpdateConfigInterfacePayload,
} from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  subnet?: Subnet;
  vpcId: number;
}

export const SubnetUnassignLinodesDrawer = React.memo(
  ({ onClose, open, subnet, vpcId }: Props) => {
    const { linodes: subnetLinodeIds } = subnet || {};
    const { data: profile } = useProfile();
    const { data: grants } = useGrants();
    const vpcPermissions = grants?.vpc.find((v) => v.id === vpcId);
    const queryClient = useQueryClient();
    const {
      setUnassignLinodesErrors,
      unassignLinode,
      unassignLinodesErrors,
    } = useUnassignLinode();
    const csvRef = React.useRef<any>();
    const formattedDate = useFormattedDate();
    const [selectedLinodes, setSelectedLinodes] = React.useState<Linode[]>([]);
    const prevSelectedLinodes = usePrevious(selectedLinodes);
    const hasError = React.useRef(false); // This flag is used to prevent the drawer from closing if an error occurs.
    const [
      linodeOptionsToUnassign,
      setLinodeOptionsToUnassign,
    ] = React.useState<Linode[]>([]);
    const [
      configInterfacesToDelete,
      setConfigInterfacesToDelete,
    ] = React.useState<DeleteLinodeConfigInterfacePayload[]>([]);
    const csvHeaders = [
      { key: 'label', label: 'Linode Label' },
      { key: 'id', label: 'Linode ID' },
      { key: 'ipv4', label: 'IPv4' },
    ];

    const userCannotUnassignLinodes =
      Boolean(profile?.restricted) &&
      (vpcPermissions?.permissions === 'read_only' || grants?.vpc.length === 0);

    // 1. We need to get all the linodes.
    const { data: linodes, refetch: getCSVData } = useAllLinodesQuery();

    // 2. We need to filter only the linodes that are assigned to the subnet.
    const findAssignedLinodes = React.useCallback(() => {
      return linodes?.filter((linode) => {
        return subnetLinodeIds?.includes(linode.id);
      });
    }, [linodes, subnetLinodeIds]);

    React.useEffect(() => {
      if (linodes) {
        setLinodeOptionsToUnassign(findAssignedLinodes() ?? []);
      }
    }, [linodes, setLinodeOptionsToUnassign, findAssignedLinodes]);

    // 3. Everytime our selection changes, we need to either add or remove the linode from the configInterfacesToDelete state.
    React.useEffect(() => {
      const prevSelectedSet = new Set(prevSelectedLinodes || []);
      const selectedSet = new Set(selectedLinodes);

      // Get the linodes that were added.
      const updatedSelectedLinodes = selectedLinodes.filter(
        (linode) => !prevSelectedSet.has(linode)
      );

      // If a linode was removed, remove the corresponding configInterfaceToDelete.
      if (prevSelectedSet.size > selectedSet.size) {
        const linodesToRemove = Array.from(prevSelectedSet).filter(
          (linode) => !selectedSet.has(linode)
        );

        // Filter the config interfaces to delete, removing those associated with Linodes to be removed.
        const updatedConfigInterfacesToDelete = configInterfacesToDelete.filter(
          (_interface) => {
            const linodeToRemove = linodesToRemove.find(
              (linode) => linode.id === _interface.linodeId
            );

            if (linodeToRemove) {
              return false;
            }

            return true;
          }
        );

        return setConfigInterfacesToDelete(updatedConfigInterfacesToDelete);
      }

      debouncedGetConfigWithInterface(updatedSelectedLinodes);

      // We only want to run this effect when the selectedLinodes changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLinodes]);

    // 4. When a linode is selected, we need to get the configs with VPC interfaces.
    const getConfigWithVPCInterface = async (selectedLinodes: Linode[]) => {
      try {
        const updatedConfigInterfaces = await Promise.all(
          selectedLinodes.map(async (linode) => {
            const response = await queryClient.fetchQuery(
              [linodesQueryKey, 'linode', linode.id, 'configs'],
              () => getAllLinodeConfigs(linode.id)
            );

            if (response) {
              const configWithVpcInterface = response.find((config) =>
                config.interfaces.some(
                  (_interface) =>
                    _interface.subnet_id === subnet?.id &&
                    _interface.purpose === 'vpc'
                )
              );

              const vpcInterface = configWithVpcInterface?.interfaces?.find(
                (_interface) =>
                  _interface.subnet_id === subnet?.id &&
                  _interface.purpose === 'vpc'
              );

              if (!vpcInterface || !configWithVpcInterface) {
                return null;
              }

              return {
                configId: configWithVpcInterface.id,
                interfaceId: vpcInterface.id,
                linodeId: linode.id,
              };
            }
            return null;
          })
        );

        // Filter out any null values and ensure item conforms to type using `is` type guard.
        const filteredConfigInterfaces = updatedConfigInterfaces.filter(
          (item): item is DeleteLinodeConfigInterfacePayload => item !== null
        );

        // Update the state with the new data
        setConfigInterfacesToDelete([
          ...configInterfacesToDelete,
          ...filteredConfigInterfaces,
        ]);
      } catch (error) {
        // Capture errors if the promise.all fails
        hasError.current = true;
        setUnassignLinodesErrors(error as APIError[]);
      }
    };

    const downloadCSV = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      await getCSVData();
      csvRef.current.link.click();
    };

    const handleRemoveLinode = (optionToRemove: Linode) => {
      setSelectedLinodes((prevSelectedLinodes) =>
        prevSelectedLinodes.filter((option) => option.id !== optionToRemove.id)
      );
    };

    // Debounce the getConfigWithVPCInterface function to prevent rapid API calls
    const debouncedGetConfigWithInterface = React.useCallback(
      debounce(200, false, getConfigWithVPCInterface),
      [getConfigWithVPCInterface]
    );

    const processUnassignLinodes = async () => {
      try {
        const promises = configInterfacesToDelete.map(async (_interface) => {
          try {
            await unassignLinode({
              configId: _interface.configId,
              interfaceId: _interface.interfaceId,
              linodeId: _interface.linodeId,
              subnetId: subnet?.id ?? -1,
              vpcId,
            });
          } catch (error) {
            hasError.current = true;
            setUnassignLinodesErrors((prevErrors: APIError[]) => [
              ...prevErrors,
              error,
            ]);
          }
        });

        // Use Promise.all to concurrently process each item in
        // the configInterfacesToDelete array
        await Promise.all(promises);
      } catch (error) {
        // Handle any unexpected errors here
        setUnassignLinodesErrors([error]);
      }
    };

    // 5. When the user submits the form, we need to process the unassign linodes.
    const handleUnassignLinode = async () => {
      await processUnassignLinodes();

      // Close the drawer if there are no errors.
      if (!hasError.current) {
        handleOnClose();
      }
    };

    const { handleSubmit, resetForm } = useFormik<UpdateConfigInterfacePayload>(
      {
        enableReinitialize: true,
        initialValues: {},
        onSubmit: handleUnassignLinode,
        validateOnBlur: false,
        validateOnChange: false,
      }
    );

    const handleOnClose = () => {
      onClose();
      resetForm();
      setSelectedLinodes([]);
      setConfigInterfacesToDelete([]);
      setUnassignLinodesErrors([]);
    };

    return (
      <Drawer
        title={`Unassign Linodes from subnet: ${subnet?.label} (${
          subnet?.ipv4 ?? subnet?.ipv6
        })`}
        onClose={handleOnClose}
        open={open}
      >
        {userCannotUnassignLinodes && (
          <Notice
            important
            text={`You don't have permissions to unassign Linodes from ${subnet?.label}. Please contact an account administrator for details.`}
            variant="error"
          />
        )}
        {unassignLinodesErrors && (
          <Notice text={unassignLinodesErrors[0]?.reason} variant="error" />
        )}
        <Notice
          text={`Unassigning Linodes from  a subnet requires you to reboot the Linodes to update its configuration.`}
          variant="warning"
        />
        <form onSubmit={handleSubmit}>
          <Stack>
            <Autocomplete
              disabled={userCannotUnassignLinodes}
              errorText={unassignLinodesErrors[0]?.reason}
              label="Linodes"
              multiple
              onChange={(_, value) => setSelectedLinodes(value)}
              options={linodeOptionsToUnassign}
              placeholder="Select Linodes or type to search"
              renderTags={() => null}
              value={selectedLinodes}
            />

            {selectedLinodes.length > 0 && (
              <>
                <RemovableSelectionsList
                  headerText={`Linodes to be Unassigned from Subnet (${selectedLinodes.length})`}
                  noDataText={'Select Linodes to be Unassigned from Subnet.'}
                  onRemove={handleRemoveLinode}
                  selectionData={selectedLinodes}
                />
                <DownloadCSV
                  sx={{
                    alignItems: 'flex-start',
                    display: 'flex',
                    gap: 1,
                    marginTop: 2,
                    textAlign: 'left',
                  }}
                  buttonType="styledLink"
                  csvRef={csvRef}
                  data={selectedLinodes}
                  filename={`linodes-unassigned-${formattedDate}.csv`}
                  headers={csvHeaders}
                  onClick={downloadCSV}
                  text={'Download List of Unassigned Linodes (.csv)'}
                />
                <ActionsPanel
                  primaryButtonProps={{
                    'data-testid': 'unassign-submit-button',
                    label: 'Unassign Linodes',
                    type: 'submit',
                  }}
                  secondaryButtonProps={{
                    label: 'Cancel',
                    onClick: handleOnClose,
                  }}
                />
              </>
            )}
          </Stack>
        </form>
      </Drawer>
    );
  }
);
