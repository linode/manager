const { constants } = require('../../constants');
const {
    apiCreateMultipleLinodes,
    createVolumes,
    apiCreateDomains,
    apiCreateNodeBalancers,
    apiDeleteAllLinodes,
    apiDeleteAllVolumes,
    apiDeleteAllDomains,
    removeNodeBalancers,
    timestamp,
    checkEnvironment,
} = require('../../utils/common');
import Dashboard from '../../pageobjects/dashboard.page';
import ListLinodes from '../../pageobjects/list-linodes';
import VolumeDetail from '../../pageobjects/linode-detail/linode-detail-volume.page';
import ListDomains from '../../pageobjects/list-domains.page';
import ListNodeBalancers from '../../pageobjects/list-nodebalancers.page';

xdescribe('View All Links on Dashboard Entity Tables', () => {
    let linodes, volumes, domains, nodebalancers;

    const entities = ['Linodes','Volumes','NodeBalancers','Domains'];

    const expectedDataDisplays = (entity) => {
        browser.pause(500);
        switch (entity) {
          case 'Linodes':
              linodes.forEach((linode) => {
                  $(ListLinodes.getLinodeSelector(linode.label)).waitForDisplayed(constants.wait.normal);
              });
              break;
          case 'Volumes':
              volumes.forEach((volume) => {
                  VolumeDetail.volumeRow(volume.label).waitForDisplayed(constants.wait.normal);
              });
              break;
          case 'NodeBalancers':
              nodebalancers.forEach((nodebalancer) => {
                  ListNodeBalancers.nodeBlanacerRow(nodebalancer.label).waitForDisplayed(constants.wait.normal);
              });
              break;
          case 'Domains':
              domains.forEach((domain) => {
                  ListDomains.domainRow(domain.domain).waitForDisplayed(constants.wait.normal);
              });
        }
        browser.url(constants.routes.dashboard);
        Dashboard.baseElemsDisplay();
        browser.pause(2000);
    }

    beforeAll(() => {
        linodes = apiCreateMultipleLinodes([
            {linodeLabel: `Auto${timestamp()}`},
            {linodeLabel: `Auto1${timestamp()}`},
            {linodeLabel: `Auto2${timestamp()}`},
            {linodeLabel: `Auto3${timestamp()}`},
            {linodeLabel: `Auto4${timestamp()}`},
            {linodeLabel: `Auto5${timestamp()}`}
        ]);

        volumes = createVolumes([
            {label: `AutoV${timestamp()}`},
            {label: `AutoV1${timestamp()}`},
            {label: `AutoV2${timestamp()}`},
            {label: `AutoV3${timestamp()}`},
            {label: `AutoV4${timestamp()}`},
            {label: `AutoV5${timestamp()}`}
        ]);

        nodebalancers = apiCreateNodeBalancers([
            {label: `AutoNB${timestamp()}`},
            {label: `AutoNB1${timestamp()}`},
            {label: `AutoNB2${timestamp()}`},
            {label: `AutoNB3${timestamp()}`},
            {label: `AutoNB4${timestamp()}`},
            {label: `AutoNB5${timestamp()}`}
        ]);

        domains = apiCreateDomains([
            {domain: `autodomain${timestamp()}.org`},
            {domain: `autodomain1${timestamp()}.org`},
            {domain: `autodomain2${timestamp()}.org`},
            {domain: `autodomain3${timestamp()}.org`},
            {domain: `autodomain4${timestamp()}.org`},
            {domain: `autodomain5${timestamp()}.org`}
        ]);

        browser.url(constants.routes.dashboard);
        Dashboard.baseElemsDisplay();
        browser.pause(1000);
    });

    afterAll(() => {
        apiDeleteAllLinodes();
        apiDeleteAllVolumes();
        apiDeleteAllDomains();
        removeNodeBalancers('do not remove linodes');
    });

    entities.forEach((entity) => {
        it(`View all links display on the dashboard ${entity} table`, () => {
            Dashboard.viewAllLink(entity).waitForDisplayed(constants.wait.minute);
            expect(Dashboard.entityCount(entity)).toBe('6');
        });

        it(`View all link directs to the expected ${entity} listing page`, () => {
            Dashboard.viewAllLink(entity).click();
            expectedDataDisplays(entity);
        })
    });

});
