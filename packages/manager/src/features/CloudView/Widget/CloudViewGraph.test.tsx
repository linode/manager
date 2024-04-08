import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { CloudViewGraph } from './CloudViewGraph';
import { FiltersObject } from '../Models/GlobalFilterProperties';
import { TimeDuration, TimeGranularity, Widgets } from '@linode/api-v4';
import { WithStartAndEnd } from 'src/features/Longview/request.types';
import { profileFactory } from 'src/factories';
import { getMetricsResponse } from 'src/mocks/metricsMocker';



const queryMocks = vi.hoisted(() => ({
    useProfile: vi.fn().mockReturnValue({}),
    useCloudViewMetricsQuery:vi.fn().mockReturnValue({})
}));


vi.mock('src/queries/cloudview/metrics', async () => {
    const actual = await vi.importActual('src/queries/cloudview/metrics');
    return {
      ...actual,
      useCloudViewMetricsQuery: queryMocks.useCloudViewMetricsQuery,
    };
  });

describe('Cloud View Graph Widget', () => {

    queryMocks.useProfile.mockReturnValue({
        data: profileFactory.build({ user_type: 'child' }),
    });    

    it('renders a line graph with required widgets', () => {

        

        const handleWidgetChange = (widget:Widgets) => {
            //dummy
        }

        let dashboardFilters = {} as FiltersObject;
        dashboardFilters.serviceType = 'linodes'
        dashboardFilters.duration = {} as TimeDuration;
        dashboardFilters.interval = '1m';
        dashboardFilters.region = 'us-east';
        dashboardFilters.resource = ["3"];
        dashboardFilters.step = {} as TimeGranularity;
        dashboardFilters.timeRange = {} as WithStartAndEnd;
        const nowInSeconds = Date.now() / 1000

        dashboardFilters.timeRange.start = nowInSeconds - 12 * 60 * 60;
        dashboardFilters.timeRange.end = nowInSeconds;

        let requestBody = {
            step:{
                unit:'minute',
                value:'5'
            },
            startTime:dashboardFilters.timeRange.start,
            endTime:dashboardFilters.timeRange.end
        }

        queryMocks.useCloudViewMetricsQuery.mockReturnValue({data:getMetricsResponse(requestBody), status:'success', isLoading:false, isError:false})

        const {getByTestId} = renderWithTheme(<CloudViewGraph 
        ariaLabel={'Test'} errorLabel={'Error Loading Data'} 
        unit={'%'} dashboardFilters={dashboardFilters} 
        widget={{} as Widgets} handleWidgetChange={handleWidgetChange}/>)
        
        expect(getByTestId('ZoomOutMapIcon')).toBeInTheDocument();

        expect(getByTestId('linegraph-wrapper')).toBeInTheDocument();  
        
        
        //there should be no error and circle progress
        expect(() => getByTestId('ErrorOutlineIcon')).toThrow();
        expect(() => getByTestId('circle-progress')).toThrow();        

    })

    it('renders a circle progress if metrics API is still loading', () => {

        

        const handleWidgetChange = (widget:Widgets) => {
            //dummy
        }

        let dashboardFilters = {} as FiltersObject;
        dashboardFilters.serviceType = 'linodes'
        dashboardFilters.duration = {} as TimeDuration;
        dashboardFilters.interval = '1m';
        dashboardFilters.region = 'us-east';
        dashboardFilters.resource = ["3"];
        dashboardFilters.step = {} as TimeGranularity;
        dashboardFilters.timeRange = {} as WithStartAndEnd;
        const nowInSeconds = Date.now() / 1000

        dashboardFilters.timeRange.start = nowInSeconds - 12 * 60 * 60;
        dashboardFilters.timeRange.end = nowInSeconds;

        let requestBody = {
            step:{
                unit:'minute',
                value:'5'
            },
            startTime:dashboardFilters.timeRange.start,
            endTime:dashboardFilters.timeRange.end
        }

        queryMocks.useCloudViewMetricsQuery.mockReturnValue({data:getMetricsResponse(requestBody), status:'loading', isLoading:true, isError:false})

        const {getByTestId} = renderWithTheme(<CloudViewGraph 
        ariaLabel={'Test'} errorLabel={'Error Loading Data'} 
        unit={'%'}  dashboardFilters={dashboardFilters} 
        widget={{} as Widgets} handleWidgetChange={handleWidgetChange}/>)
        
        expect(getByTestId('circle-progress')).toBeInTheDocument();   

        //there should be no error and linegraph wrapper
        expect(() => getByTestId('ErrorOutlineIcon')).toThrow();
        expect(() => getByTestId('linegraph-wrapper')).toThrow();
    })

    it('renders a error state progress if metrics API response is error', () => {

        

        const handleWidgetChange = (widget:Widgets) => {
            //dummy
        }

        let dashboardFilters = {} as FiltersObject;
        dashboardFilters.serviceType = 'linodes'
        dashboardFilters.duration = {} as TimeDuration;
        dashboardFilters.interval = '1m';
        dashboardFilters.region = 'us-east';
        dashboardFilters.resource = ["3"];
        dashboardFilters.step = {} as TimeGranularity;
        dashboardFilters.timeRange = {} as WithStartAndEnd;
        const nowInSeconds = Date.now() / 1000

        dashboardFilters.timeRange.start = nowInSeconds - 12 * 60 * 60;
        dashboardFilters.timeRange.end = nowInSeconds;

        queryMocks.useCloudViewMetricsQuery.mockReturnValue({data:{}, status:'error', isLoading:false, isError:true})

        const {getByTestId, getByText} = renderWithTheme(<CloudViewGraph 
        ariaLabel={'Test'} errorLabel={'Error Loading Data'} 
        unit={'%'} dashboardFilters={dashboardFilters} 
        widget={{} as Widgets} handleWidgetChange={handleWidgetChange}/>)        
        
        expect(getByTestId('ErrorOutlineIcon')).toBeInTheDocument();
        expect(() => getByTestId('circle-progress')).toThrow();
        expect(getByText('Error Loading Data')).toBeInTheDocument();

    })

    it('renders a error state progress if metrics API response is error with default error message', () => {

        

        const handleWidgetChange = (widget:Widgets) => {
            //dummy
        }

        let dashboardFilters = {} as FiltersObject;
        dashboardFilters.serviceType = 'linodes'
        dashboardFilters.duration = {} as TimeDuration;
        dashboardFilters.interval = '1m';
        dashboardFilters.region = 'us-east';
        dashboardFilters.resource = ["3"];
        dashboardFilters.step = {} as TimeGranularity;
        dashboardFilters.timeRange = {} as WithStartAndEnd;
        const nowInSeconds = Date.now() / 1000

        dashboardFilters.timeRange.start = nowInSeconds - 12 * 60 * 60;
        dashboardFilters.timeRange.end = nowInSeconds;

        queryMocks.useCloudViewMetricsQuery.mockReturnValue({data:{}, status:'error', isLoading:false, isError:true})

        const {getByTestId, getByText} = renderWithTheme(<CloudViewGraph 
        ariaLabel={'Test'}
        unit={'%'} dashboardFilters={dashboardFilters} 
        widget={{} as Widgets} handleWidgetChange={handleWidgetChange}/>)            
        
        expect(getByTestId('ErrorOutlineIcon')).toBeInTheDocument();
        expect(() => getByTestId('circle-progress')).toThrow();
        expect(getByText('Error while rendering widget')).toBeInTheDocument();

    })

})