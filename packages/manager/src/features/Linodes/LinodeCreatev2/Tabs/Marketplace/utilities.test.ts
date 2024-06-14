import { stackScriptFactory } from 'src/factories';

import { getFilteredApps } from './utilities';

describe('getFilteredApps', () => {
  it('should not perform any filtering if the search is empty', () => {
    const stackscripts = stackScriptFactory.buildList(10);

    const result = getFilteredApps({
      category: undefined,
      query: '',
      stackscripts,
    });

    expect(result).toStrictEqual(stackscripts);
  });

  it('should allow a simple filter on label', () => {
    const mysql = stackScriptFactory.build({ id: 607026, label: 'MySQL' });
    const piHole = stackScriptFactory.build({ id: 970522, label: 'Pi-Hole' });
    const vault = stackScriptFactory.build({ id: 1037038, label: 'Vault' });

    const stackscripts = [mysql, piHole, vault];

    const result = getFilteredApps({
      category: undefined,
      query: 'mysql',
      stackscripts,
    });

    expect(result).toStrictEqual([mysql]);
  });

  it('should allow a filter on label and catergory', () => {
    const mysql = stackScriptFactory.build({ id: 607026, label: 'MySQL' });
    const piHole = stackScriptFactory.build({ id: 970522, label: 'Pi-Hole' });
    const vault = stackScriptFactory.build({ id: 1037038, label: 'Vault' });

    const stackscripts = [mysql, piHole, vault];

    const result = getFilteredApps({
      category: undefined,
      query: 'mysql, database',
      stackscripts,
    });

    expect(result).toStrictEqual([mysql]);
  });

  it('should allow filtering on StackScript id', () => {
    const mysql = stackScriptFactory.build({ id: 607026, label: 'MySQL' });
    const piHole = stackScriptFactory.build({ id: 970522, label: 'Pi-Hole' });
    const vault = stackScriptFactory.build({ id: 1037038, label: 'Vault' });

    const stackscripts = [mysql, piHole, vault];

    const result = getFilteredApps({
      category: undefined,
      query: '1037038',
      stackscripts,
    });

    expect(result).toStrictEqual([vault]);
  });

  it('should allow filtering on alt description with many words', () => {
    const mysql = stackScriptFactory.build({ id: 607026, label: 'MySQL' });
    const piHole = stackScriptFactory.build({ id: 970522, label: 'Pi-Hole' });
    const vault = stackScriptFactory.build({ id: 1037038, label: 'Vault' });

    const stackscripts = [mysql, piHole, vault];

    const result = getFilteredApps({
      category: undefined,
      query: 'HashiCorp password',
      stackscripts,
    });

    expect(result).toStrictEqual([vault]);
  });

  it('should filter if a category is selected in the category dropdown', () => {
    const mysql = stackScriptFactory.build({ id: 607026, label: 'MySQL' });
    const piHole = stackScriptFactory.build({ id: 970522, label: 'Pi-Hole' });
    const vault = stackScriptFactory.build({ id: 1037038, label: 'Vault' });

    const stackscripts = [mysql, piHole, vault];

    const result = getFilteredApps({
      category: 'Databases',
      query: '',
      stackscripts,
    });

    expect(result).toStrictEqual([mysql]);
  });

  it('should ignore "category" if a search query is passed', () => {
    const mysql = stackScriptFactory.build({ id: 607026, label: 'MySQL' });
    const piHole = stackScriptFactory.build({ id: 970522, label: 'Pi-Hole' });
    const vault = stackScriptFactory.build({ id: 1037038, label: 'Vault' });

    const stackscripts = [mysql, piHole, vault];

    const result = getFilteredApps({
      category: 'Databases',
      query: 'HashiCorp',
      stackscripts,
    });

    expect(result).toStrictEqual([vault]);
  });
});
