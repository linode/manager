export interface CloudNAT {
  addresses: string[];
  default_ports_per_interface: number;
  id: number;
  label: string;
  region: string;
}

export interface CreateCloudNATRequest {
  addresses?: Array<{ address: string }>;
  default_ports_per_interface?: ValidPortSize;
  label: string;
  region: string;
}

export interface UpdateCloudNATRequest {
  label?: string;
}

export interface PaginatedCloudNATResponse {
  data: CloudNAT[];
  page: number;
  pages: number;
  results: number;
}

export const VALID_PORT_SIZES = [
  64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
] as const;

export type ValidPortSize = (typeof VALID_PORT_SIZES)[number];
