// will need to change from beta to regular eventually
import { deleteByIdBeta, getAllBeta } from './common';
export const getFirewalls = () => getAllBeta('networking/firewalls');

export const deleteFirewallByLabel = firewall => {
  getFirewalls().then(resp => {
    const firewallToDelete = resp.body.data.find(f => f.label === firewall);
    deleteFirewallById(firewallToDelete.id);
  });
};

export const deleteFirewallById = (firewallId: number) =>
  deleteByIdBeta('networking/firewalls', firewallId);
