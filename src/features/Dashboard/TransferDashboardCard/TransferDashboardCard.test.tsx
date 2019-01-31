import { renderPercentageString } from './TransferDashboardCard';

describe('TransferDashboardCard component', () => {
  describe('renderPercentageString function', () => {
    it('should render a percentage', () => {
      expect(renderPercentageString(25)).toEqual('25%');
    });
    it('should use a < sign for small percentages', () => {
      expect(renderPercentageString(0.01)).toEqual('<1%');
    });
    it('should not display decimals', () => {
      expect(renderPercentageString(78.9743)).toEqual('78%');
      expect(renderPercentageString(1.0000001)).toEqual('1%');
    });
    it('should not round up to 100% for large values', () => {
      expect(renderPercentageString(99.99)).toEqual('99%');
    });
  });
});
