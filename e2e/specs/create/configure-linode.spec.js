const { constants } = require('../../constants');
import Create from '../../pageobjects/create';
import ConfigureLinode from '../../pageobjects/configurelinode';

describe('Create Linode - Configure Linode Suite', () => {
    beforeAll(() => {
        Create.menuButton.click();
        Create.linode();
    });

    it('should display configure elements', () => {
        ConfigureLinode.elementsDisplay();
    });
});
