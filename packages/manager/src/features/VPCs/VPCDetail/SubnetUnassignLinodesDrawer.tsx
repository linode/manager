import { deleteLinodeConfigInterface } from '@linode/api-v4';
import { Subnet } from '@linode/api-v4/lib/vpcs/types';
import Close from '@mui/icons-material/Close';
import { Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import { debounce } from 'throttle-debounce';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';
import { Drawer } from 'src/components/Drawer';
import { IconButton } from 'src/components/IconButton';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';
import { Notice } from 'src/components/Notice/Notice';
import { useFormattedDate } from 'src/hooks/useFormattedDate';
import { usePrevious } from 'src/hooks/usePrevious';
import { getAllLinodeConfigsRequest } from 'src/queries/linodes/configs';
import {
  queryKey as linodesQueryKey,
  useAllLinodesQuery,
} from 'src/queries/linodes/linodes';
import { subnetQueryKey, vpcQueryKey } from 'src/queries/vpcs';

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
    const { linodes: linodeIds } = subnet || {};
    const queryClient = useQueryClient();
    const csvRef = React.useRef<any>();
    const formattedDate = useFormattedDate();
    const [selectedLinodes, setSelectedLinodes] = React.useState<Linode[]>([]);
    const prevSelectedLinodes = usePrevious(selectedLinodes);
    const [unassignLinodesErrors, setUnassignLinodesErrors] = React.useState<
      APIError[]
    >([]);
    const hasError = React.useRef(false); // This flag is used to prevent the drawer from closing if an error occurs.
    const [
      configInterfacesToDelete,
      setConfigInterfacesToDelete,
    ] = React.useState<DeleteLinodeConfigInterfacePayload[]>([]);
    const csvHeaders = [
      { key: 'label', label: 'Linode Label' },
      { key: 'ipv4', label: 'IPv4' },
      { key: 'id', label: 'Linode ID' },
    ];

    // 1. We need to get all the linodes.
    const { data: linodes, refetch: getCSVData } = useAllLinodesQuery();

    // 2. We need to filter only the linodes that are assigned to the subnet.
    const assignedLinodes = linodes?.filter((linode) => {
      return linodeIds?.includes(linode.id);
    });

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
        // Identify the Linodes to remove.
        const linodesToRemove = Array.from(prevSelectedSet).filter(
          (linode) => !selectedSet.has(linode)
        );

        // Update the configInterfacesToDelete.
        const updatedConfigInterfacesToDelete = configInterfacesToDelete.filter(
          (_interface) => {
            // Check if the _interface.linodeId matches any of the linodesToRemove.
            const linodeToRemove = linodesToRemove.find(
              (linode) => linode.id === _interface.linodeId
            );

            // If it does, remove it from the configInterfacesToDelete.
            if (linodeToRemove) {
              return false;
            }

            // Otherwise, keep it.
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
    const getConfigWithVpcInterface = async (selectedLinodes: Linode[]) => {
      try {
        const updatedConfigInterfaces = await Promise.all(
          selectedLinodes.map(async (linode) => {
            const response = await queryClient.fetchQuery(
              [linodesQueryKey, 'linode', linode.id, 'configs'],
              () => getAllLinodeConfigsRequest(linode.id)
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
        setUnassignLinodesErrors(error as APIError[]);
      }
    };

    const downloadCSV = async () => {
      await getCSVData();
      csvRef.current.link.click();
    };

    const handleRemoveLinode = (optionToRemove: Linode) => {
      setSelectedLinodes((prevSelectedLinodes) =>
        prevSelectedLinodes.filter((option) => option.id !== optionToRemove.id)
      );
    };

    // Debounce the getConfigWithVpcInterface function to prevent rapid API calls
    const debouncedGetConfigWithInterface = React.useCallback(
      debounce(200, false, getConfigWithVpcInterface),
      [getConfigWithVpcInterface]
    );

    const invalidateQueries = async () => {
      const queryKeys = [
        [vpcQueryKey, 'paginated'],
        [vpcQueryKey, 'vpc', vpcId],
        [vpcQueryKey, 'vpc', vpcId, subnetQueryKey],
        [vpcQueryKey, 'vpc', vpcId, subnetQueryKey, 'subnet', subnet?.id],
      ];
      await Promise.all(
        queryKeys.map((key) => queryClient.invalidateQueries(key))
      );
    };

    const processUnassignLinodes = async () => {
      try {
        // Use Promise.all to concurrently process each item in
        // the configInterfacesToDelete array
        await Promise.all(
          configInterfacesToDelete.map(async (_interface) => {
            try {
              await deleteLinodeConfigInterface(
                _interface.linodeId,
                _interface.configId,
                _interface.interfaceId
              );
            } catch (error) {
              hasError.current = true; // Set the error flag to true
              setUnassignLinodesErrors((prevErrors) => [...prevErrors, error]);
            }
          })
        );

        if (!hasError.current) {
          // Call invalidateQueries if all deletions were successful
          invalidateQueries();
        }
      } catch (error) {
        // Handle any unexpected errors here
        setUnassignLinodesErrors([error]);
      }
    };

    // 5. When the user submits the form, we need to process the unassign linodes.
    const handleUnassignLinode = async () => {
      await processUnassignLinodes();
      if (!hasError.current) {
        handleOnClose();
      }
    };

    const { handleSubmit, resetForm } = useFormik<UpdateConfigInterfacePayload>(
      {
        enableReinitialize: true,
        initialValues: {},
        onSubmit: handleUnassignLinode,
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
        onClose={handleOnClose}
        open={open}
        title={`Unassign Linode from subnet: ${subnet?.label}`}
      >
        <Notice
          text={`Unassigning a Linode from subnet requires you to reboot the Linode.`}
          variant="warning"
        />
        <form onSubmit={handleSubmit}>
          <Stack>
            <Autocomplete
              errorText={unassignLinodesErrors[0]?.reason} // TODO: Test errors...
              label="Linodes"
              multiple
              onChange={(_, value) => setSelectedLinodes(value)}
              options={assignedLinodes ?? []}
              renderTags={() => null}
              value={selectedLinodes}
            />
            {selectedLinodes.length > 0 && (
              <>
                <SelectedOptionsHeader>{`Linodes to be Unassigned from Subnet (${selectedLinodes.length})`}</SelectedOptionsHeader>

                <SelectedOptionsList>
                  {selectedLinodes.map((linode) => (
                    <SelectedOptionsListItem
                      alignItems="center"
                      key={linode.id}
                    >
                      <StyledLabel>{linode.label}</StyledLabel>
                      <IconButton
                        aria-label={`remove ${linode.label}`}
                        disableRipple
                        onClick={() => handleRemoveLinode(linode)}
                        size="medium"
                      >
                        <Close />
                      </IconButton>
                    </SelectedOptionsListItem>
                  ))}
                </SelectedOptionsList>
                <DownloadCSV
                  sx={{
                    alignItems: 'flex-start',
                    display: 'flex',
                    gap: 1,
                    marginTop: 2,
                    textAlign: 'left',
                  }}
                  buttonType="unstyled"
                  csvRef={csvRef}
                  data={selectedLinodes}
                  filename={`linodes-unassigned-${formattedDate}.csv`}
                  headers={csvHeaders}
                  onClick={downloadCSV}
                  text={'Download List of Unassigned Linodes (.csv)'}
                />
                <ActionsPanel
                  primaryButtonProps={{
                    'data-testid': 'save-button',
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

const SelectedOptionsHeader = styled('h4')(({ theme }) => ({
  color: theme.color.headline,
  fontFamily: theme.font.bold,
  fontSize: '14px',
  textTransform: 'initial',
}));

const SelectedOptionsList = styled(List)(({ theme }) => ({
  background: theme.bg.main,
  maxWidth: '416px',
  padding: '5px 0',
  width: '100%',
}));

const SelectedOptionsListItem = styled(ListItem)(() => ({
  justifyContent: 'space-between',
  paddingBottom: 0,
  paddingTop: 0,
}));

const StyledLabel = styled('span')(({ theme }) => ({
  color: theme.color.label,
  fontFamily: theme.font.semiBold,
  fontSize: '14px',
}));
