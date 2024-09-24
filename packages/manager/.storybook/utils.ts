import glob from 'glob';

const PATTERN = 'src/**/*.stories.tsx';

/**
 * Find all storybook files, then return the glob containing the parent component/feature.
 * To be used in main.ts to tell react-docgen-typescript which files to compile.
 * https://github.com/linode/manager/pull/10762
 *
 * Example: src/components/Button/Button.stories.tsx -> src/components/Button/**\/*.{ts,tsx}
 */
export const getReactDocgenTSFileGlobs = () => {
  const filesWithStories = glob.sync(PATTERN);
  const files: string[] = [];

  filesWithStories.forEach((file) => {
    const execArr = /(src\/(components|features)\/[a-zA-Z]*(.|\/))/.exec(file);
    if (execArr) {
      const isDirectory = execArr[3] === '/';
      const fileBlob = `${execArr[0]}${isDirectory ? '**/*.' : ''}{ts,tsx}`;
      if (!files.includes(fileBlob)) {
        files.push(fileBlob);
      }
    }
  });

  return files;
};
