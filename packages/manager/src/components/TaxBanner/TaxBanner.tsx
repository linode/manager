import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Notice from 'src/components/Notice';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import { Link as LinkType } from 'src/featureFlags';
import useFlags from 'src/hooks/useFlags';

const VATBanner: React.FC<{}> = props => {
  const flags = useFlags();

  {
    /* 
    launch darkly is responsible for determining who and who doesn't see this banner
    based on country information we send to the service in IdentifyUser.tsx
  */
  }
  if (flags.vatBanner && !!Object.keys(flags.vatBanner).length) {
    const { text, links, preference_key } = flags.vatBanner!;

    return (
      <PreferenceToggle<boolean>
        preferenceKey={preference_key}
        preferenceOptions={[true, false]}
      >
        {({
          preference: isDismissed,
          togglePreference: dismissBanner
        }: ToggleProps<boolean>) => {
          return isDismissed ? (
            <React.Fragment />
          ) : (
            <Notice warning dismissible={true} onClose={dismissBanner}>
              {generateHTMLFromString(text, links)}
            </Notice>
          );
        }}
      </PreferenceToggle>
    );
  } else {
    return null;
  }
};

export const generateHTMLFromString = (
  text: string,
  links: Record<string, LinkType>
) => {
  return Object.keys(links).reduce((acc, eachKey) => {
    const { text_to_replace, type, link } = links[eachKey];

    if (acc.length > 0) {
      // nth iteration after the first
      return acc.map(eachValue => {
        if (typeof eachValue === 'string') {
          return wrapStringInLink(eachValue, text_to_replace, type, link);
        } else {
          /** is a react component so no need to wrap anything in a link */
          return eachValue;
        }
      });
    } else {
      return wrapStringInLink(text, text_to_replace, type, link);
    }
  }, []);
};

export const wrapStringInLink = (
  fullString: string,
  textToReplace: string,
  type: 'internal' | 'external',
  link: string
) => {
  /**
   * split the sentence up by phrases, including the matched text in the array
   *
   * For example:
   *
   * While "I am" being the text to match, "hello world I am Marty"
   *
   * becomes
   *
   * ["hello world", "I am", "Marty"]
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split#Splitting_with_a_RegExp_to_include_parts_of_the_separator_in_the_result
   * for information about splitting but keeping the matched value in the array
   *
   */
  const sentenceAsArray = fullString.split(
    new RegExp(`(${textToReplace})`, 'gmi')
  );

  /**
   * iterate over the array and if we have a matched word, wrap
   * in an anchor tag or react-router link depending on the link type
   */
  const arrayWithLink = sentenceAsArray.map(eachWord => {
    if (eachWord.match(new RegExp(textToReplace, 'gmi'))) {
      return type === 'external' ? (
        <a key={eachWord} href={link} target="_blank">
          {eachWord}
        </a>
      ) : (
        <Link key={eachWord} to={link}>
          {eachWord}
        </Link>
      );
    }
    return eachWord;
  });

  /**
   * so now we have an array that looks like
   * [
   *  "hello world",
   *  "<a>I am</a>"
   *  "Marty"
   * ]
   */
  return arrayWithLink;
};

export default compose<{}, {}>(React.memo)(VATBanner);
