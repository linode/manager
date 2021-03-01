import { accountMaintenanceFactory, linodeFactory } from 'src/factories';
import { addMaintenanceToLinodes } from './linodes.helpers';

describe('addMaintenanceToLinodes', () => {
  it('adds relevant maintenance items to Linodes', () => {
    const linodes = linodeFactory.buildList(2);
    const accountMaintenance = accountMaintenanceFactory.buildList(1);
    const result = addMaintenanceToLinodes(accountMaintenance, linodes);
    expect(result[0].maintenance).not.toBeNull();
    expect(result[1].maintenance).toBeNull();
    expect(result[0].maintenance?.when).toBe(accountMaintenance[0].when);
  });
});
