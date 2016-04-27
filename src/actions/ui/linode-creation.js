export const CHANGE_SOURCE_TAB = "@@ui@@linode-creation@@CHANGE_SOURCE_TAB";
export const SELECT_SOURCE = "@@ui@@linode-creation@@SELECT_SOURCE";
export const SELECT_DATACENTER = "@@ui@@linode-creation@@SELECT_DATACENTER";
export const SELECT_SERVICE = "@@ui@@linode-creation@@SELECT_SERVICE";

export function changeSourceTab(tab) {
    return { type: CHANGE_SOURCE_TAB, tab };
}

export function selectSource(source) {
    return { type: SELECT_SOURCE, source };
}

export function selectDatacenter(datacenter) {
    return { type: SELECT_DATACENTER, datacenter };
}

export function selectService(service) {
    return { type: SELECT_SERVICE, service };
}
