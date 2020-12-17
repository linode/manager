// will need to change from beta to regular eventually
import { deleteByIdBeta, getAllBeta, isTestEntity } from './common';
export const getFirewalls = (page: number = 1) =>
  // get firewalls up to 500 per page. if no page number specified, defaults to 1
  getAllBeta(`networking/firewalls?page=${page}&page_size=500`);

export const deleteFirewallByLabel = firewall => {
  getFirewalls().then(resp => {
    const firewallToDelete = resp.body.data.find(f => f.label === firewall);
    deleteFirewallById(firewallToDelete.id);
  });
};

const deleteTestEntities = resp => {
  resp.body.data.forEach(firewall => {
    if (isTestEntity(firewall)) {
      deleteFirewallById(firewall.id);
    }
  });
};

export const deleteAllTestFirewalls = () => {
  /* get all firewalls, but request without page number specified only yields first page,
  so it gets number of pages as well */
  getFirewalls().then(resp => {
    const pageNumber = resp.body.pages;
    /* do this if there's more than one page(500 items), get each page and delete the test entities from it.
    It probably won't be necessary very often if ever, but here just in case. */
    if (pageNumber > 1) {
      for (let currentPage = 1; currentPage <= pageNumber; currentPage++) {
        getFirewalls(currentPage).then(resp => {
          deleteTestEntities(resp);
        });
      }
    } else {
      deleteTestEntities(resp);
    }
  });
};

export const deleteFirewallById = (firewallId: number) =>
  deleteByIdBeta('networking/firewalls', firewallId);
