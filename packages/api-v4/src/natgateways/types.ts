export interface NATGateway {
  address_autoscale_max: number;
  addresses: NATGatewayAddress[];
  created: string;
  default_ports_per_interface: number;
  id: number;
  label: string;
  portset_assignments: number;
  portset_capacity: number;
  region: string;
  updated: string;
  vpc_subnet: NATGatewayVPCSubnet | null;
}

export interface NATGatewayVPCSubnet {
  id: number;
  label: string;
  vpc_id: number;
  vpc_label: string;
}

export interface CreateNATGatewayPayload {
  addresses?: NATGatewayAddress[];
  default_ports_per_interface?: number;
  label: string;
  region: string;
  use_autoscaling?: boolean;
  vpc_subnet_id?: number;
}

export interface UpdateNATGatewayPayload {
  label?: string;
}

export interface NATGatewayAddress {
  address: string;
}

export interface NATGatewayAddressDetail {
  address: string;
  in_use: boolean;
  interface_count: number;
  interface_url: string;
  portset_assignments: number;
  portset_capacity: number;
}

export interface NATGatewayInterface {
  addresses: string[];
  id: number;
  linode: {
    id: number;
    label: string;
    type: string;
    url: string;
  };
  portsets?: NATGatewayPortset[];
}

export interface NATGatewayPortset {
  address: string;
  ports: NATGatewayPortRange[];
}

export interface NATGatewayPortRange {
  end: number;
  start: number;
}

export interface NATGatewaySettings {
  allowed_ports_per_interface: number[];
  maximum_autoscaling_addresses_per_natgateway: number;
  maximum_reserved_addresses_per_natgateway: number;
}

// For VPC subnet integration
export interface VPCSubnetNATGateway {
  addresses: string[];
  id: number;
  label: string;
  portsets?: NATGatewayPortset[];
}

// For interface integration - NAT usage object shown on interfaces
export interface InterfaceNATGateway {
  addresses: string[];
  id: number;
  label: string;
  portsets?: NATGatewayPortset[];
}
