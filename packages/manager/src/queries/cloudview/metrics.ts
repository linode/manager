import { APIError, CloudViewMetricsRequest, CloudViewMetricsResponse, getCloudViewMetrics} from "@linode/api-v4";
import { queryKey } from "../preferences";
import { useQuery } from '@tanstack/react-query';

export const useCloudViewMetricsQuery = (serviceType:string, 
    request:CloudViewMetricsRequest, changer:any) => {

        return useQuery<CloudViewMetricsResponse, APIError[]>(
            [queryKey, serviceType, request, changer], //querykey and dashboardId makes this uniquely identifiable
            () => getCloudViewMetrics(serviceType, request),
            {
                enabled: true,                                
            }
        );

}
