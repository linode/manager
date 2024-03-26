import { Widgets } from '@linode/api-v4/lib/cloudview/types';
import * as Factory from 'factory.ts';
import { cloudViewFilterFactory } from './cloudViewFilters';

export const cloudViewWidgetFactory = Factory.Sync.makeFactory<Widgets>({
        label:Factory.each((i) => `widget-${i}`),
        metric:'200X',
        aggregate_function:'',
        group_by:'dummy',
        y_label:'Count',
        filters:cloudViewFilterFactory.buildList(2)
});