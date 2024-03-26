import { Dashboard} from '@linode/api-v4/lib/cloudview/types';
import * as Factory from 'factory.ts';
import { cloudViewFilterFactory } from './cloudViewFilters';
import { cloudViewWidgetFactory } from './cloudViewWidgets';


export const dashboardFactory = Factory.Sync.makeFactory<Dashboard>({
    id: Factory.each((i) => i),
    label: Factory.each((i) => `cloudview-${i}`),
    service_type: Factory.each((i) => {
        if(i % 2 == 0) {
            //aclb
            return `ACLB`;
        } else {
            //dbaas
            return `linodes`;
        }
    }), 
    instance_id:Factory.each((i) => i*2),
    namespace_id:Factory.each((i) => i*3),
    widgets:cloudViewWidgetFactory.buildList(2),
    filters:cloudViewFilterFactory.buildList(2),
    created: '2023-07-12T16:08:53',
    updated: '2023-07-12T16:08:55',
  });