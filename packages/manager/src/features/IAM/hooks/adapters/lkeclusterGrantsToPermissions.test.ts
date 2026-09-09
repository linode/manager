import { lkeclusterGrantsToPermissions } from './lkeclusterGrantsToPermissions';

describe('lkeclusterGrantsToPermissions', () => {
  it('should grant all permissions for unrestricted users', () => {
    const result = lkeclusterGrantsToPermissions(undefined, false);

    expect(result.view_lkecluster).toBe(true);
    expect(result.view_lkecluster_kubeconfig).toBe(true);
    expect(result.delete_lkecluster).toBe(true);
    expect(result.update_lkecluster).toBe(true);
  });

  it('should grant view permissions only for read_only grant level', () => {
    const result = lkeclusterGrantsToPermissions('read_only', true);

    expect(result.view_lkecluster).toBe(true);
    expect(result.view_lkecluster_nodepool).toBe(true);
    expect(result.view_lkecluster_kubeconfig).toBe(false);
    expect(result.delete_lkecluster).toBe(false);
    expect(result.update_lkecluster).toBe(false);
    expect(result.create_lkecluster_nodepool).toBe(false);
  });

  it('should grant all permissions for read_write grant level', () => {
    const result = lkeclusterGrantsToPermissions('read_write', true);

    expect(result.view_lkecluster).toBe(true);
    expect(result.view_lkecluster_kubeconfig).toBe(true);
    expect(result.delete_lkecluster).toBe(true);
    expect(result.recycle_lkecluster_nodepool_nodes).toBe(true);
  });
});
