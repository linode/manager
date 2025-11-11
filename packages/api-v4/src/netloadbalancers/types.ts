import type { LKEClusterInfo } from '../nodebalancers/types';

export interface LinodeInfo {
  id: number;
  label: string;
  type: 'linode';
  url: string;
}

export type NetworkLoadBalancerStatus = 'active' | 'canceled' | 'suspended';

export type NetworkLoadBalancerListenerProtocol = 'tcp' | 'udp';

export interface NetworkLoadBalancerListener {
  created: string;
  /**
   * The unique ID of this listener
   */
  id: number;
  /**
   * The label for this listener
   */
  label: string;
  /**
   * The port the listener is configured to listen on
   */
  port: number;
  /**
   * The protocol used by this listener
   */
  protocol: NetworkLoadBalancerListenerProtocol;
  updated: string;
}

export interface NetworkLoadBalancerNode {
  /**
   * The IPv6 address of the node
   */
  address_v6: string;
  created: string;
  /**
   * The unique ID of this node
   */
  id: number;
  /**
   * The label for this node
   */
  label: string;
  /**
   * Information about the Linode this node is associated with (if available)
   */
  linode_id: number;
  updated: string;
  weight: number;
  weight_updated: string;
}

export interface NetworkLoadBalancer {
  /**
   * When this Network Load Balancer was created
   */
  created: string;
  /**
   * The unique ID of this Network Load Balancer
   */
  id: number;
  /**
   * Virtual IP addresses assigned to this Network Load Balancer
   */
  ipv4: string;
  ipv6: string;
  /**
   * The label for this Network Load Balancer
   */
  label: string;
  last_composite_updated: string;
  /**
   * Listeners configured on this Network Load Balancer
   */
  listeners: NetworkLoadBalancerListener[];
  /**
   * Information about the LKE cluster this NLB is associated with
   */
  lke_cluster: LKEClusterInfo;
  /**
   * The region where this Network Load Balancer is deployed
   */
  region: string;
  /**
   * The current status of this Network Load Balancer
   */
  status: NetworkLoadBalancerStatus;
  /**
   * When this Network Load Balancer was last updated
   */
  updated: string;
}
