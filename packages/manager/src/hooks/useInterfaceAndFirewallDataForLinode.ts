import {
  useLinodeConfigQuery,
  useLinodeFirewallsQuery,
  useLinodeInterfaceFirewallsQuery,
  useLinodeInterfaceQuery,
} from '@linode/queries';

/**
 * In some files, We need to handle support for both legacy interfaces and Linode interfaces.
 *
 * To fetch data, depending if the Linode with the given ID is a Linode Interface, we use Linode Interface related queries.
 * Otherwise, we use config profile interface related queries.
 */
export const useInterfaceAndFirewallDataForLinode = (inputs: {
  configId: null | number;
  interfaceId: number;
  isLinodeInterface: boolean;
  linodeId: number;
}) => {
  const { configId, interfaceId, isLinodeInterface, linodeId } = inputs;

  // query to fetch firewalls if this Linode uses config profile interfaces
  const {
    data: attachedFirewallsConfig,
    error: firewallsErrorConfig,
    isLoading: firewallsLoadingConfig,
  } = useLinodeFirewallsQuery(linodeId, !isLinodeInterface);

  // query to fetch firewalls for a Linode Interface (firewalls are attached at the interface level)
  const {
    data: attachedFirewallsLinodeInterface,
    error: firewallsErrorLinodeInterface,
    isLoading: firewallsLoadingLinodeInterface,
  } = useLinodeInterfaceFirewallsQuery(
    linodeId,
    interfaceId,
    isLinodeInterface
  );

  // Depending on which query was fired to fetch firewalls, return appropriate data
  const attachedFirewalls =
    attachedFirewallsConfig ?? attachedFirewallsLinodeInterface;
  const firewallsError = firewallsErrorConfig ?? firewallsErrorLinodeInterface;
  const firewallsLoading =
    firewallsLoadingConfig || firewallsLoadingLinodeInterface;

  const {
    data: linodeInterface,
    error: linodeInterfaceError,
    isLoading: linodeInterfaceLoading,
  } = useLinodeInterfaceQuery(linodeId, interfaceId, isLinodeInterface);

  const {
    data: config,
    error: configError,
    isLoading: configLoading,
  } = useLinodeConfigQuery({
    configId: configId ?? -1,
    enabled: !isLinodeInterface,
    linodeId,
  });

  // Depending on which query was fired to fetch the Linode's interfaces, return appropriate data
  const configInterface = config?.interfaces?.find(
    (iface) => iface.id === interfaceId
  );
  const interfaceData = linodeInterface ?? configInterface;
  const interfaceError = linodeInterfaceError ?? configError;
  const interfaceLoading = linodeInterfaceLoading ?? configLoading;

  return {
    firewallsInfo: {
      attachedFirewalls,
      firewallsError,
      firewallsLoading,
    },
    interfacesInfo: {
      config, // undefined if this Linode is using Linode Interfaces. Used to determine an unrecommended configuration
      configInterface, // undefined if this Linode is using Linode Interfaces
      interfaceData,
      interfaceError,
      interfaceLoading,
      linodeInterface, // undefined if this Linode is using Config Profile Interfaces
    },
  };
};
