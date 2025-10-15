import {
  useAllLinodesQuery,
  useSubnetsQuery,
  useVPCsIPsQuery,
} from '@linode/queries';

export const useGetLinodeIPAndVPCData = (props: {
  region?: string;
  subnetId?: number;
  vpcId?: null | number;
}) => {
  const { region, vpcId, subnetId } = props;

  const {
    data: linodesData,
    error: linodesError,
    isLoading: linodesIsLoading,
  } = useAllLinodesQuery({}, { region }, region !== undefined);

  const {
    data: subnetsData,
    error: subnetsError,
    isLoading: subnetsIsLoading,
  } = useSubnetsQuery(Number(vpcId), {}, {}, subnetId !== undefined);

  const {
    data: vpcIPs,
    error: vpcIPsError,
    isLoading: isVPCIPsLoading,
  } = useVPCsIPsQuery({ vpc_id: vpcId }, vpcId !== undefined);

  if (region && !vpcId) {
    return {
      linodesData,
      error: linodesError,
      isLoading: linodesIsLoading,
    };
  }

  return {
    linodesData,
    vpcIPs,
    error: [
      ...(linodesError ?? []),
      ...(subnetsError ?? []),
      ...(vpcIPsError ?? []),
    ],
    isLoading: linodesIsLoading ?? subnetsIsLoading ?? isVPCIPsLoading,
    subnetsData,
  };
};
