import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, resolve } from 'path';

declare interface Options {
  documentRootPath?: string;
  scanStartPath?: string;
  resolvePath?: string;
  collapsed?: boolean | null | undefined;
  collapseDepth?: number;
  hyphenToSpace?: boolean;
  underscoreToSpace?: boolean;
  capitalizeFirst?: boolean;
  capitalizeEachWords?: boolean;
  includeRootIndexFile?: boolean;
  includeFolderIndexFile?: boolean;
  useTitleFromFileHeading?: boolean;
  useTitleFromFrontmatter?: boolean;
  useFolderTitleFromIndexFile?: boolean;
  useFolderLinkFromIndexFile?: boolean;
  includeDotFiles?: boolean;
  convertSameNameSubFileToGroupIndexPage?: boolean;
  folderLinkNotIncludesFileName?: boolean;
  includeEmptyFolder?: boolean;
  sortMenusByName?: boolean;
  sortMenusByFrontmatterOrder?: boolean;
  sortMenusOrderByDescending?: boolean;
  sortMenusOrderNumerically?: boolean;
  keepMarkdownSyntaxFromTitle?: boolean;
  debugPrint?: boolean;
  manualSortFileNameByPriority?: string[];
  excludeFiles?: string[];
  excludeFolders?: string[];
  rootGroupText?: string;
  rootGroupLink?: string;
  rootGroupCollapsed?: boolean | null | undefined;
  frontmatterOrderDefaultValue?: number;
  /**
   * @deprecated
   */
  sortByFileName?: string[];
  /**
   * @deprecated
   */
  root?: string;
  /**
   * @deprecated
   */
  includeEmptyGroup?: boolean;
  /**
   * @deprecated
   */
  withIndex?: boolean;
  /**
   * @deprecated
   */
  useFolderLinkAsIndexPage?: boolean;
  /**
   * @deprecated
   */
  useIndexFileForFolderMenuInfo?: boolean;
}

declare interface SidebarListItem {
  [key: string]: any;
}

/*
 * Types from: `vitepress/types/default-theme.d.ts`
 */
export type SidebarItem = {
  text?: string;
  link?: string;
  items?: SidebarItem[];
  collapsed?: boolean;
};

export interface SidebarMultiItem {
  base: string;
  items: SidebarItem[];
}

export interface SidebarMulti {
  [path: string]: SidebarMultiItem;
}

export type Sidebar = SidebarItem[] | SidebarMulti;
/*
 * End
 * */

export default class VitePressSidebar {
  static generateSidebar(options: Options | Options[]): Sidebar {
    const optionItems: Options[] = Array.isArray(options) ? options : [options];
    const sidebar: Sidebar = {};
    const isMultipleSidebars = Array.isArray(options);
    let enableDebugPrint = false;

    for (let i = 0; i < optionItems.length; i += 1) {
      const optionItem = optionItems[i];

      if (Object.keys(optionItem).length > 0) {
        // Exceptions for changed option names
        if (optionItem.root) {
          throw new Error(VitePressSidebar.generateDeprecateMessage('root', 'documentRootPath'));
        }
        if (optionItem.withIndex) {
          throw new Error(
            VitePressSidebar.generateDeprecateMessage('withIndex', 'includeRootIndexFile')
          );
        }
        if (optionItem.includeEmptyGroup) {
          throw new Error(
            VitePressSidebar.generateDeprecateMessage('includeEmptyGroup', 'includeEmptyFolder')
          );
        }
        if (optionItem.sortByFileName) {
          throw new Error(
            VitePressSidebar.generateDeprecateMessage(
              'sortByFileName',
              'manualSortFileNameByPriority'
            )
          );
        }
        if (optionItem.useFolderLinkAsIndexPage) {
          throw new Error(
            VitePressSidebar.generateDeprecateMessage(
              'useFolderLinkAsIndexPage',
              'useIndexFileForFolderMenuInfo'
            )
          );
        }
        if (optionItem.useIndexFileForFolderMenuInfo) {
          throw new Error(
            VitePressSidebar.generateDeprecateMessage(
              'useIndexFileForFolderMenuInfo',
              'useFolderTitleFromIndexFile` and `useFolderLinkFromIndexFile'
            )
          );
        }
        if (optionItem.sortMenusByFrontmatterOrder && optionItem.sortMenusByName) {
          throw new Error(
            VitePressSidebar.generateNotTogetherMessage(
              'sortMenusByFrontmatterOrder',
              'sortMenusByName'
            )
          );
        }
        if (optionItem.sortMenusByFrontmatterOrder && optionItem.sortMenusOrderNumerically) {
          throw new Error(
            VitePressSidebar.generateNotTogetherMessage(
              'sortMenusByFrontmatterOrder',
              'sortMenusOrderNumerically'
            )
          );
        }
        if (optionItem.debugPrint && !enableDebugPrint) {
          enableDebugPrint = true;
        }

        optionItem.documentRootPath = optionItem?.documentRootPath ?? '/';

        if (!/^\//.test(optionItem.documentRootPath)) {
          optionItem.documentRootPath = `/${optionItem.documentRootPath}`;
        }

        if (optionItem.collapseDepth) {
          optionItem.collapsed = true;
        }

        optionItem.collapseDepth = optionItem?.collapseDepth ?? 1;
        optionItem.manualSortFileNameByPriority = optionItem?.manualSortFileNameByPriority ?? [];
        optionItem.excludeFiles = optionItem?.excludeFiles ?? [];
        optionItem.excludeFolders = optionItem?.excludeFolders ?? [];
        optionItem.frontmatterOrderDefaultValue = optionItem?.frontmatterOrderDefaultValue ?? 0;

        let scanPath = optionItem.documentRootPath;

        if (optionItem.scanStartPath) {
          scanPath = `${optionItem.documentRootPath}/${optionItem.scanStartPath}`
            .replace(/\/{2,}/g, '/')
            .replace('/$', '');
        }

        const sidebarResult: SidebarListItem = VitePressSidebar.generateSidebarItem(
          1,
          join(process.cwd(), scanPath),
          scanPath,
          null,
          optionItem
        );

        sidebar[optionItem.resolvePath || '/'] = {
          base: optionItem.resolvePath || '/',
          items:
            sidebarResult?.items ||
            (optionItem.rootGroupText ||
            optionItem.rootGroupLink ||
            optionItem.rootGroupCollapsed === true ||
            optionItem.rootGroupCollapsed === false
              ? [
                  {
                    text: optionItem.rootGroupText,
                    ...(optionItem.rootGroupLink ? { link: optionItem.rootGroupLink } : {}),
                    items: sidebarResult as SidebarItem[],
                    ...(optionItem.rootGroupCollapsed === null
                      ? {}
                      : { collapsed: optionItem.rootGroupCollapsed })
                  }
                ]
              : (sidebarResult as SidebarItem[]))
        };
      }
    }

    let sidebarResult;

    if (!isMultipleSidebars && Object.keys(sidebar).length === 1) {
      // Single sidebar
      sidebarResult = Object.values(sidebar)[0].items;
    } else {
      // Multiple sidebars
      sidebarResult = sidebar;
    }

    if (enableDebugPrint) {
      process.stdout.write(
        `\n${'='.repeat(50)}\n${JSON.stringify(optionItems, null, 2)}\n${'-'.repeat(
          50
        )}\n${JSON.stringify(sidebarResult, null, 2)}\n${'='.repeat(50)}\n\n`
      );
    }

    return sidebarResult;
  }

  private static generateDeprecateMessage(original: string, renameTo: string) {
    return `The \`${original}\` option was renamed to \`${renameTo}\`.`;
  }

  private static generateNotTogetherMessage(option1: string, option2: string) {
    return `The \`${option1}\` and \`${option2}\` options cannot be used together.`;
  }

  private static generateSidebarItem(
    depth: number,
    currentDir: string,
    displayDir: string,
    parentName: string | null,
    options: Options
  ): SidebarListItem {
    let directoryFiles: string[] = readdirSync(currentDir);

    if (options.manualSortFileNameByPriority!.length > 0) {
      const needSortItem = directoryFiles.filter(
        (x) => options.manualSortFileNameByPriority?.indexOf(x) !== -1
      );
      const remainItem = directoryFiles.filter(
        (x) => options.manualSortFileNameByPriority?.indexOf(x) === -1
      );

      needSortItem.sort(
        (a, b) =>
          options.manualSortFileNameByPriority!.indexOf(a) -
          options.manualSortFileNameByPriority!.indexOf(b)
      );

      directoryFiles = [...needSortItem, ...remainItem];
    }

    let sidebarItems: SidebarListItem = directoryFiles
      .map((x: string) => {
        const childItemPath = resolve(currentDir, x);
        let childItemPathDisplay = `${displayDir}/${x}`.replace(/\/{2}/, '/').replace(/\.md$/, '');

        if (options.documentRootPath && childItemPathDisplay.startsWith(options.documentRootPath)) {
          childItemPathDisplay = childItemPathDisplay.replace(
            new RegExp(`^${options.documentRootPath}`, 'g'),
            ''
          );

          if (options.scanStartPath || options.resolvePath) {
            childItemPathDisplay = childItemPathDisplay.replace(/^\//g, '');

            if (options.scanStartPath) {
              childItemPathDisplay = childItemPathDisplay.replace(
                new RegExp(`^${options.scanStartPath}`, 'g'),
                ''
              );
            }

            childItemPathDisplay = childItemPathDisplay.replace(/^\//g, '');
          } else if (!childItemPathDisplay.startsWith('/')) {
            childItemPathDisplay = `/${childItemPathDisplay}`;
          }
        }

        if (/\.vitepress/.test(childItemPath)) {
          return null;
        }

        if (depth === 1 && x === 'index.md' && !options.includeRootIndexFile) {
          return null;
        }

        if (depth !== 1 && x === 'index.md' && !options.includeFolderIndexFile) {
          return null;
        }

        if (!options.includeDotFiles && /^\./.test(x)) {
          return null;
        }

        if (statSync(childItemPath).isDirectory()) {
          if (options.excludeFolders?.includes(x)) {
            return null;
          }

          let directorySidebarItems =
            VitePressSidebar.generateSidebarItem(
              depth + 1,
              childItemPath,
              childItemPathDisplay,
              x,
              options
            ) || [];

          let newDirectoryText = VitePressSidebar.getTitleFromMd(x, childItemPath, options, true);
          let newDirectoryPagePath = childItemPath;
          let withDirectoryLink;

          if (options.convertSameNameSubFileToGroupIndexPage) {
            const findItem = directorySidebarItems.find((y: SidebarListItem) => y.text === x);

            if (findItem) {
              newDirectoryPagePath = resolve(childItemPath, `${findItem.text}.md`);
              newDirectoryText = VitePressSidebar.getTitleFromMd(
                x,
                newDirectoryPagePath,
                options,
                false
              );

              if (options.folderLinkNotIncludesFileName) {
                withDirectoryLink = childItemPathDisplay;
              } else {
                withDirectoryLink = findItem.link;
              }

              directorySidebarItems = directorySidebarItems.filter(
                (y: SidebarListItem) => y.text !== x
              );
            }
          } else {
            // If an index.md file exists in a folder subfile,
            // replace the name or link of the folder with what is set in index.md.
            // The index.md file can still be displayed if the value of `includeFolderIndexFile` is `true`.
            newDirectoryPagePath = `${childItemPath}/index.md`;

            if (existsSync(newDirectoryPagePath)) {
              if (options.useFolderTitleFromIndexFile) {
                newDirectoryText = VitePressSidebar.getTitleFromMd(
                  'index',
                  newDirectoryPagePath,
                  options
                );
              }
              if (options.useFolderLinkFromIndexFile) {
                withDirectoryLink = `${childItemPathDisplay}/`;
              }
            }
          }

          if (options.includeEmptyFolder || directorySidebarItems.length > 0) {
            return {
              text: newDirectoryText,
              ...(withDirectoryLink ? { link: withDirectoryLink } : {}),
              items: directorySidebarItems,
              ...(options.collapsed === null || options.collapsed === undefined
                ? {}
                : { collapsed: depth >= options.collapseDepth! && options.collapsed }),
              ...(options.sortMenusByFrontmatterOrder
                ? {
                    order: VitePressSidebar.getOrderFromFrontmatter(
                      newDirectoryPagePath,
                      options.frontmatterOrderDefaultValue!
                    )
                  }
                : {})
            };
          }

          return null;
        }

        if (childItemPath.endsWith('.md')) {
          if (options.excludeFiles?.includes(x)) {
            return null;
          }

          let childItemText;
          const childItemTextWithoutExt = x.replace(/\.md$/, '');

          if (
            options.convertSameNameSubFileToGroupIndexPage &&
            parentName === childItemTextWithoutExt
          ) {
            childItemText = childItemTextWithoutExt;
          } else {
            childItemText = VitePressSidebar.getTitleFromMd(x, childItemPath, options);
          }

          return {
            text: childItemText,
            link: childItemPathDisplay,
            ...(options.sortMenusByFrontmatterOrder
              ? {
                  order: VitePressSidebar.getOrderFromFrontmatter(
                    childItemPath,
                    options.frontmatterOrderDefaultValue!
                  )
                }
              : {})
          };
        }
        return null;
      })
      .filter((x) => x !== null);

    if (options.sortMenusByName) {
      sidebarItems = VitePressSidebar.sortByObjectKey(
        sidebarItems,
        'text',
        options.sortMenusOrderByDescending
      );
    }

    if (options.sortMenusByFrontmatterOrder) {
      sidebarItems = VitePressSidebar.sortByObjectKey(
        sidebarItems,
        'order',
        options.sortMenusOrderByDescending
      );

      VitePressSidebar.deepDeleteKey(sidebarItems, 'order');
    }

    if (options.sortMenusOrderNumerically) {
      sidebarItems = VitePressSidebar.sortByObjectKey(
        sidebarItems,
        'text',
        options.sortMenusOrderByDescending,
        true
      );
    }

    return sidebarItems;
  }

  private static getOrderFromFrontmatter(filePath: string, defaultOrder: number): number {
    try {
      const fileData = readFileSync(filePath, 'utf-8');

      // Try manual parsing
      const lines = fileData.split('\n');
      let frontmatterStart = false;

      for (let i = 0, len = lines.length; i < len; i += 1) {
        const str = lines[i].toString().replace('\r', '');

        if (/^---$/.test(str)) {
          frontmatterStart = true;
        }
        if (/^order: (.*)/.test(str) && frontmatterStart) {
          return parseInt(str.replace('order: ', ''), 10);
        }
      }
    } catch (e) {
      return defaultOrder;
    }

    return defaultOrder;
  }

  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private static formatTitle(options: Options, title: string): string {
    let result = title;

    if (options.hyphenToSpace) {
      result = result.replace(/-/g, ' ');
    }

    if (options.underscoreToSpace) {
      result = result.replace(/_/g, ' ');
    }

    if (options.capitalizeEachWords) {
      const splitStr = result.trim().toLowerCase().split(' ');

      for (let i = 0; i < splitStr.length; i += 1) {
        splitStr[i] = VitePressSidebar.capitalizeFirst(splitStr[i]);
      }

      result = splitStr.join(' ');
    } else if (options.capitalizeFirst) {
      result = VitePressSidebar.capitalizeFirst(result);
    }

    return result;
  }

  private static getTitleFromMd(
    fileName: string,
    filePath: string,
    options: Options,
    isDirectory = false
  ): string {
    if (isDirectory) {
      return VitePressSidebar.formatTitle(options, fileName);
    }

    if (options.useTitleFromFrontmatter) {
      // Use content frontmatter title value instead of file name
      try {
        const fileData = readFileSync(filePath, 'utf-8');

        // Try manual parsing
        const lines = fileData.split('\n');
        let frontmatterStart = false;

        for (let i = 0, len = lines.length; i < len; i += 1) {
          let str = lines[i].toString().replace('\r', '');

          if (/^---$/.test(str)) {
            frontmatterStart = true;
          }

          if (/^title: (.*)/.test(str) && frontmatterStart) {
            str = str.replace('title: ', '');

            return VitePressSidebar.formatTitle(options, str);
          }
        }
      } catch {
        return 'Unknown';
      }
    }

    if (options.useTitleFromFileHeading) {
      // Use content 'h1' string instead of file name
      try {
        const data = readFileSync(filePath, 'utf-8');
        const lines = data.split('\n');

        for (let i = 0, len = lines.length; i < len; i += 1) {
          let str = lines[i].toString().replace('\r', '');

          if (/^# /.test(str)) {
            str = str.replace(/^# /, '');

            if (/\[(.*)]\(.*\)/.test(str)) {
              // Remove hyperlink from h1 if exists
              const execValue = /(.*)?\[(.*)]\((.*)\)(.*)?/.exec(str) || '';

              str =
                execValue.length > 0
                  ? `${execValue[1] || ''}${execValue[2] || ''}${execValue[4] || ''}`
                  : '';
            }

            // Remove certain Markdown format
            if (!options.keepMarkdownSyntaxFromTitle) {
              str = str.replace(/\*{1,2}([^*]+?)\*{1,2}/g, '$1');
              str = str.replace(/_{1,2}([^_]+?)_{1,2}/g, '$1');
              str = str.replace(/~{1,2}([^~]+?)~{1,2}/g, '$1');
              str = str.replace(/`{1,3}([^`]+?)`{1,3}/g, '$1');
            }

            return VitePressSidebar.formatTitle(options, str);
          }
        }
      } catch {
        return 'Unknown';
      }
    }

    return VitePressSidebar.formatTitle(options, fileName.replace(/\.md$/, ''));
  }

  private static sortByObjectKey(
    arr: SidebarListItem,
    key: string,
    desc = false,
    numerically = false
  ): object[] {
    for (let i = 0; i < arr.length; i += 1) {
      if (arr[i].items && arr[i].items.length) {
        arr[i].items = VitePressSidebar.sortByObjectKey(arr[i].items, key, desc, numerically);
      }
    }

    if (numerically) {
      const collator = new Intl.Collator([], { numeric: true });

      const result = arr.sort((a: any, b: any) => collator.compare(a[key], b[key]));

      if (desc) {
        return result.reverse();
      }

      return result;
    }

    return arr.sort((a: any, b: any) => {
      if (!desc) {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;

        return 0;
      }
      if (a[key] > b[key]) return -1;
      if (a[key] < b[key]) return 1;

      return 0;
    });
  }

  private static deepDeleteKey(obj: SidebarListItem, key: string) {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    if (obj?.[key]) {
      delete obj[key];
    }

    Object.keys(obj).forEach((item) => {
      if (typeof obj[item] === 'object') {
        VitePressSidebar.deepDeleteKey(obj[item], key);
      }
    });
  }
}

export { VitePressSidebar };

export const { generateSidebar } = VitePressSidebar;