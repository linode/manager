import {
  useAllLinodesQuery,
  useVPCIPsQuery,
  useVPCQuery,
} from '@linode/queries';

export const useGetLinodeIPAndVPCData = (props: {
  region?: string;
  subnetId?: number;
  vpcId?: null | number;
}) => {
  const { region, vpcId } = props;

  const {
    data: linodes,
    error: linodesError,
    isLoading: linodesIsLoading,
  } = useAllLinodesQuery({}, { region }, region !== undefined);

  const {
    data: vpc,
    error: vpcError,
    isLoading: vpcLoading,
  } = useVPCQuery(vpcId ?? -1, vpcId !== undefined);

  const {
    data: vpcIPs,
    error: vpcIPsError,
    isLoading: isVPCIPsLoading,
  } = useVPCIPsQuery(vpcId ?? -1, {}, vpcId !== undefined);

  if (region && !vpcId) {
    return {
      linodes,
      error: linodesError,
      isLoading: linodesIsLoading,
    };
  }

  return {
    linodes,
    vpcIPs,
    error: [
      ...(linodesError ?? []),
      ...(vpcError ?? []),
      ...(vpcIPsError ?? []),
    ],
    isLoading: linodesIsLoading ?? vpcLoading ?? isVPCIPsLoading,
    vpc,
  };
};
