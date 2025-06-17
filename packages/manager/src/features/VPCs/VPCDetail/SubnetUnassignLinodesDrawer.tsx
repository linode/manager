import {
  linodeQueries,
  useAllLinodesQuery,
  useGrants,
  useProfile,
} from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  Box,
  Drawer,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
import { useFormattedDate } from '@linode/utilities';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as React from 'react';

import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';
import { RemovableSelectionsListTable } from 'src/components/RemovableSelectionsList/RemovableSelectionsListTable';
import { useUnassignLinode } from 'src/hooks/useUnassignLinode';
import { SUBNET_LINODE_CSV_HEADERS } from 'src/utilities/subnets';

import {
  getLinodeInterfacePrimaryIPv4,
  getLinodeInterfaceRanges,
} from '../utils';
import { SubnetLinodeActionNotice } from './SubnetLinodeActionNotice';

import type {
  APIError,
  DeleteInterfaceIds,
  Linode,
  Subnet,
  UpdateConfigInterfacePayload,
} from '@linode/api-v4';

interface Props {
  isFetching: boolean;
  linodeError?: APIError[] | null;
  onClose: () => void;
  open: boolean;
  singleLinodeToBeUnassigned?: Linode;
  subnet?: Subnet;
  subnetError?: APIError[] | null;
  vpcId: number;
}

interface LinodeAndInterfaceData extends Linode {
  configId: null | number;
  interfaceId: number;
  // Normalize VPC IPv4 and ranges for display/download since legacy and Linode interfaces have different shapes
  // Legacy: VPC IPv4 = interface.ipv4.vpc, VPC ranges = interface.ip_ranges
  // Linode Interface: VPC IPv4 = interface.vpc.ipv4.addresses[], VPC ranges = interface.vpc.ipv4.ranges
  vpcIPv4: null | string | undefined;
  vpcRanges: string[] | undefined;
}

export const SubnetUnassignLinodesDrawer = React.memo(
  ({
    isFetching,
    linodeError,
    onClose,
    open,
    singleLinodeToBeUnassigned,
    subnet,
    subnetError,
    vpcId,
  }: Props) => {
    const { data: profile } = useProfile();
    const { data: grants } = useGrants();
    const subnetId = subnet?.id;
    const vpcPermissions = grants?.vpc.find((v) => v.id === vpcId);

    const queryClient = useQueryClient();
    const { setUnassignLinodesErrors, unassignLinode, unassignLinodesErrors } =
      useUnassignLinode();

    const csvRef = React.useRef<any>(undefined);
    const formattedDate = useFormattedDate();

    const [selectedLinodes, setSelectedLinodes] = React.useState<Linode[]>(
      singleLinodeToBeUnassigned ? [singleLinodeToBeUnassigned] : []
    );
    const [
      selectedLinodesAndInterfaceData,
      setSelectedLinodesAndInterfaceData,
    ] = React.useState<LinodeAndInterfaceData[]>([]);

    const hasError = React.useRef(false); // This flag is used to prevent the drawer from closing if an error occurs.

    const [linodeOptionsToUnassign, setLinodeOptionsToUnassign] =
      React.useState<Linode[]>([]);
    const [interfacesToDelete, setInterfacesToDelete] = React.useState<
      DeleteInterfaceIds[]
    >([]);

    const { linodes: subnetLinodeIds } = subnet || {};

    const userCannotUnassignLinodes =
      Boolean(profile?.restricted) &&
      (vpcPermissions?.permissions === 'read_only' || grants?.vpc.length === 0);

    // 1. We need to get all the linodes.
    const {
      data: linodes,
      error: linodesError,
      refetch: getCSVData,
    } = useAllLinodesQuery();

    // 2. We need to filter only the linodes that are assigned to the subnet.
    const findAssignedLinodes = React.useCallback(() => {
      return linodes?.filter((linode) => {
        return subnetLinodeIds?.some(
          (linodeInfo) => linodeInfo.id === linode.id
        );
      });
    }, [linodes, subnetLinodeIds]);

    React.useEffect(() => {
      if (linodes) {
        setLinodeOptionsToUnassign(findAssignedLinodes() ?? []);
      }
    }, [linodes, setLinodeOptionsToUnassign, findAssignedLinodes]);

    // 3. When a linode is selected, we need to get the VPC interface to unassign.
    const getVPCInterface = React.useCallback(
      async (selectedLinodes: Linode[]) => {
        try {
          const updatedInterfaces: (LinodeAndInterfaceData | null)[] =
            await Promise.all(
              selectedLinodes.map(async (linode) => {
                let response;
                if (linode.interface_generation === 'linode') {
                  response = await queryClient.fetchQuery(
                    linodeQueries.linode(linode.id)._ctx.interfaces._ctx
                      .interfaces
                  );
                } else {
                  response = await queryClient.fetchQuery(
                    linodeQueries.linode(linode.id)._ctx.configs._ctx.configs
                  );
                }

                if (response) {
                  if ('interfaces' in response) {
                    const vpcLinodeInterface = response.interfaces.find(
                      (iface) => iface.vpc && iface.vpc.subnet_id === subnetId
                    );
                    if (!vpcLinodeInterface) {
                      return null;
                    }
                    return {
                      ...linode,
                      configId: null,
                      vpcIPv4:
                        getLinodeInterfacePrimaryIPv4(vpcLinodeInterface),
                      vpcRanges: getLinodeInterfaceRanges(vpcLinodeInterface),
                      interfaceId: vpcLinodeInterface.id,
                    };
                  }
                  const configWithVpcInterface = response.find((config) =>
                    config.interfaces?.some(
                      (_interface) =>
                        _interface.subnet_id === subnetId &&
                        _interface.purpose === 'vpc'
                    )
                  );

                  const vpcInterface = configWithVpcInterface?.interfaces?.find(
                    (_interface) =>
                      _interface.subnet_id === subnetId &&
                      _interface.purpose === 'vpc'
                  );

                  if (!vpcInterface || !configWithVpcInterface) {
                    return null;
                  }

                  return {
                    ...linode,
                    configId: configWithVpcInterface.id,
                    interfaceId: vpcInterface.id,
                    vpcIPv4: vpcInterface.ipv4?.vpc,
                    vpcRanges: vpcInterface?.ip_ranges,
                  };
                }
                return null;
              })
            );

          // Filter out any null values and ensure item conforms to type using `is` type guard.
          const selectedLinodesAndInterfaceData = updatedInterfaces.filter(
            (item): item is LinodeAndInterfaceData => item !== null
          );

          // Remove interface property for the DeleteInterfaceIds data
          const _updatedInterfaces = updatedInterfaces.map((item) => ({
            configId: item?.configId,
            interfaceId: item?.interfaceId,
            linodeId: item?.id,
          }));

          const filteredInterfaces = _updatedInterfaces.filter(
            (item): item is DeleteInterfaceIds => item !== null
          );

          // Update the state with the new data
          setInterfacesToDelete([...filteredInterfaces]);
          setSelectedLinodesAndInterfaceData([
            ...selectedLinodesAndInterfaceData,
          ]);
        } catch (error) {
          // Capture errors if the promise.all fails
          hasError.current = true;
          setUnassignLinodesErrors(error as APIError[]);
        }
      },
      [queryClient, setUnassignLinodesErrors, subnetId]
    );

    React.useEffect(() => {
      if (singleLinodeToBeUnassigned) {
        getVPCInterface([singleLinodeToBeUnassigned]);
      }
    }, [singleLinodeToBeUnassigned, getVPCInterface]);

    const downloadCSV = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      await getCSVData();
      csvRef.current.link.click();
    };

    const handleRemoveLinode = (optionToRemove: LinodeAndInterfaceData) => {
      setSelectedLinodes((prevSelectedLinodes) =>
        prevSelectedLinodes.filter((option) => option.id !== optionToRemove.id)
      );

      setInterfacesToDelete((prevInterfacesToDelete) =>
        prevInterfacesToDelete.filter(
          (option) => option.linodeId !== optionToRemove.id
        )
      );

      setSelectedLinodesAndInterfaceData(
        (prevSelectedLinodesAndInterfaceData) =>
          prevSelectedLinodesAndInterfaceData.filter(
            (option) => option.id !== optionToRemove.id
          )
      );
    };

    const processUnassignLinodes = async () => {
      try {
        const promises = interfacesToDelete.map(async (_interface) => {
          try {
            await unassignLinode({
              configId: _interface.configId,
              interfaceId: _interface.interfaceId,
              linodeId: _interface.linodeId,
              vpcId,
            });
          } catch (error) {
            hasError.current = true;
            setUnassignLinodesErrors((prevErrors: APIError[]) => [
              ...prevErrors,
              ...error,
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

    // 4. When the user submits the form, we need to process the unassign linodes.
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
      resetForm();
      setSelectedLinodes([]);
      setSelectedLinodesAndInterfaceData([]);
      setInterfacesToDelete([]);
      setUnassignLinodesErrors([]);
      onClose();
    };

    return (
      <Drawer
        error={subnetError || linodeError}
        isFetching={isFetching}
        onClose={handleOnClose}
        open={open}
        title={`Unassign Linodes from subnet: ${subnet?.label ?? 'Unknown'} (${
          subnet?.ipv4 ?? subnet?.ipv6 ?? 'Unknown'
        })`}
      >
        {userCannotUnassignLinodes && (
          <Notice
            text={`You don't have permissions to unassign Linodes from ${subnet?.label}. Please contact an account administrator for details.`}
            variant="error"
          />
        )}
        {unassignLinodesErrors.length > 0 && (
          <Notice text={unassignLinodesErrors[0].reason} variant="error" />
        )}
        <SubnetLinodeActionNotice linodeAction="Unassigning" />
        {!singleLinodeToBeUnassigned && (
          <Typography>
            Select the Linodes you would like to unassign from this subnet. Only
            Linodes in this VPC&rsquo;s region are displayed.
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <Stack marginTop={!singleLinodeToBeUnassigned ? 0 : 3} spacing={3}>
            {!singleLinodeToBeUnassigned && (
              <Autocomplete
                disabled={userCannotUnassignLinodes}
                errorText={linodesError ? linodesError[0].reason : undefined}
                label="Linodes"
                multiple
                onChange={(_, value) => {
                  setSelectedLinodes(value);
                  getVPCInterface(value);
                }}
                options={linodeOptionsToUnassign}
                placeholder="Select Linodes or type to search"
                renderTags={() => null}
                value={selectedLinodes}
              />
            )}
            <Box>
              <RemovableSelectionsListTable
                headerText={`Linodes to be Unassigned from Subnet (${selectedLinodes.length})`}
                isRemovable={!singleLinodeToBeUnassigned}
                noDataText="Select Linodes to be Unassigned from Subnet."
                onRemove={handleRemoveLinode}
                selectionData={selectedLinodesAndInterfaceData}
                tableHeaders={['Linode', 'VPC IPv4', 'VPC IPv4 Ranges']}
              />
              {selectedLinodesAndInterfaceData.length > 0 && (
                <DownloadCSV
                  buttonType="styledLink"
                  csvRef={csvRef}
                  data={selectedLinodesAndInterfaceData}
                  filename={`linodes-unassigned-${formattedDate}.csv`}
                  headers={SUBNET_LINODE_CSV_HEADERS}
                  onClick={downloadCSV}
                  sx={{
                    alignItems: 'flex-start',
                    display: 'flex',
                    gap: 1,
                    marginTop: 2,
                    textAlign: 'left',
                  }}
                  text={'Download List of Linodes to be Unassigned (.csv)'}
                />
              )}
            </Box>
            <Box>
              <ActionsPanel
                primaryButtonProps={{
                  'data-testid': 'unassign-submit-button',
                  disabled: interfacesToDelete.length === 0,
                  label: 'Unassign Linodes',
                  type: 'submit',
                }}
                secondaryButtonProps={{
                  label: 'Cancel',
                  onClick: handleOnClose,
                }}
                sx={{ padding: 0 }}
              />
            </Box>
          </Stack>
        </form>
      </Drawer>
    );
  }
);
