class LinodeSummary {
    get volumesAttached() { return $('[data-qa-volumes]'); }
}

export default new LinodeSummary();
