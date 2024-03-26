import { Dashboard, getDashboardById } from '@linode/api-v4';
import {
    APIError,
} from '@linode/api-v4/lib/types';

import { useQuery } from '@tanstack/react-query';

export const queryKey = 'cloudview-dashboards';



export const useCloudViewDashboardByIdQuery = (dashboardId: number | undefined) => {

    return useQuery<Dashboard, APIError[]>(
        [queryKey, dashboardId], //querykey and dashboardId makes this uniquely identifiable
        () => getDashboardById(dashboardId!),
        {
            enabled: dashboardId != undefined
        }    //run this only if dashboarID is valid one 
    );
}