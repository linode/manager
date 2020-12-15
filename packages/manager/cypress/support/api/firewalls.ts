// will need to change from beta to regular eventually
import { deleteByIdBeta, getAllBeta, isTestEntity } from './common';
import { deleteLinodeById } from './linodes';
export const getFirewalls = () => getAllBeta('networking/firewalls');

export const deleteFirewallByLabel = firewall => {
  getFirewalls().then(resp => {
    const firewallToDelete = resp.body.data.find(f => f.label === firewall);
    deleteFirewallById(firewallToDelete.id);
  });
};

export const deleteAllTestFirewalls = () => {
  getFirewalls().then(resp => {
    const pages = resp.body.pages;
    for (let page = 1; page <= pages; page++) {
      getFirewalls().then(resp => {
        resp.body.data.forEach(firewall => {
          if (isTestEntity(firewall)) {
            deleteFirewallById(firewall.id);
          }
        });
      });
    }
  });
};

export const deleteFirewallById = (firewallId: number) =>
  deleteByIdBeta('networking/firewalls', firewallId);
