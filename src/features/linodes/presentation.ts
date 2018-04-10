function titlecase(string: string): string {
  return `${string.substr(0, 1).toUpperCase()}${string.substr(1)}`;
}

export function formatRegion(region: string) {
  if (region.indexOf('-') < 0) {
    return titlecase(region);
  }
  const [countryCode, area] = region.split('-');
  return `${countryCode.toUpperCase()} ${titlecase(area)}`;
}

export function typeLabelLong(memory?: number, disk?: number, cpus?: number) {
  return `${typeLabel(memory)} ${typeLabelDetails(memory, disk, cpus)}`;
}

export function typeLabelDetails(memory?: number, disk?: number, cpus?: number) {
  if (!memory || !disk || !cpus) { return; }
  const memG = memory / 1024;
  const diskG = disk / 1024;
  return `${cpus} CPU, ${diskG}G Storage, ${memG}G RAM`;
}

export function typeLabel(memory?: number) {
  if (!memory) { return; }
  return `Linode ${memory / 1024}G`;
}

export function displayLabel(memory?: number): string | undefined {
  if (!memory) { return; }
  return `${typeLabel(memory)}`;
}
