import { getLKETypes, LKEPlan, PriceObject } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryPresets } from './base';

export const queryKey = 'kubernetes-types';

const getAllKubernetesTypes = () =>
  getAll<LKEPlan>((params) => getLKETypes(params))().then((res) => res.data);

export const useAllKubernetesTypesQuery = (enabled: boolean = true) =>
  useQuery<LKEPlan[], APIError[]>(`${queryKey}-all`, getAllKubernetesTypes, {
    ...queryPresets.oneTimeFetch,
    enabled,
  });

export const getHAPrice = (plans?: LKEPlan[] | undefined) =>
  plans?.find((plan: LKEPlan) => plan.availability === 'high')?.price as
    | PriceObject
    | undefined;
