import NodeBalancerDetail from '../../pageobjects/nodebalancer-detail/details.page';
import NodeBalancerSettings from '../../pageobjects/nodebalancer-detail/settings.page';
import {
    createNodeBalancer,
    removeNodeBalancers,
} from '../../utils/common';

describe('NodeBalancer - Settings Suite', () => { 
    beforeAll(() => {
        createNodeBalancer();
    });

    afterAll(() => {
        removeNodeBalancers();
    });

    it('should display base elements', () => {
        NodeBalancerDetail.baseElemsDisplay();
        NodeBalancerDetail.changeTab('Settings');
        NodeBalancerSettings.baseElemsDisplay();
    });

    it('should update the label', () => {
        const newLabel = 'NewLabel1';
        NodeBalancerSettings.changeLabel(newLabel);
    });

    it('should update the connection throttle', () => {
        const connections = 5;
        NodeBalancerSettings.setConnectionThrottle(connections);
    });
});
