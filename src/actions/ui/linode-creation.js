export const CHANGE_SOURCE_TAB = "@@ui@@linode-creation@@CHANGE_SOURCE_TAB";
export const SELECT_DISTRO = "@@ui@@linode-creation@@SELECT_DISTRO";

export function changeSourceTab(tab) {
    return { type: CHANGE_SOURCE_TAB, tab };
}

export function selectDistro(distro) {
    return { type: SELECT_DISTRO, distro };
}
