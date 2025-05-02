import {
  community_answer,
  community_question,
  docs_result,
} from 'src/__data__/searchResults';
import { COMMUNITY_BASE_URL, DOCS_BASE_URL } from 'src/constants';

import {
  cleanDescription,
  convertCommunityToItems,
  convertDocsToItems,
  getCommunityResultLabel,
  getCommunityUrl,
  getDocsResultLabel,
} from './SearchHOC';

describe('internal methods', () => {
  describe('getDocsResultLabel', () => {
    it('should return a label with highlighted content marked as <em>', () => {
      const label = getDocsResultLabel(docs_result, true);
      expect(label).toBe(docs_result._highlightResult.title.value);
    });
    it('should use the unformatted title when highlighting is set to false', () => {
      const label2 = getDocsResultLabel(docs_result, false);
      expect(label2).toBe(docs_result.title);
    });
    it('should return an unformatted label if there is no highlighted result', () => {
      const result = { ...docs_result } as any;
      result._highlightResult = {};
      const label3 = getDocsResultLabel(result, true);
      expect(label3).toBe(result.title);
    });
  });
  describe('getCommunityUrl', () => {
    it('should parse a community question', () => {
      expect(getCommunityUrl('q_123')).toMatch('/questions/123');
    });
    it('should parse a community answer', () => {
      expect(getCommunityUrl('a_123')).toMatch('/questions/answer/123');
    });
    it('should handle strange input', () => {
      expect(getCommunityUrl("I'm not a URL")).toEqual(COMMUNITY_BASE_URL);
    });
  });
  describe('cleanDescription', () => {
    it('should return a normal string unchanged', () => {
      expect(cleanDescription('just a description')).toBe('just a description');
    });

    it('should trim a <t> tag', () => {
      expect(cleanDescription('<t>I have a tag')).toBe('I have a tag');
    });
    it('should trim a <r> tag', () => {
      expect(cleanDescription('<r>I also have a tag')).toBe(
        'I also have a tag'
      );
    });
  });

  describe('getCommunityResultLabel', () => {
    it('should use the highlighted title if available', () => {
      const label4 = getCommunityResultLabel(community_question, true);
      expect(label4).toBe(community_question._highlightResult.title.value);
    });
    it('should use the unformatted title if highlight is false', () => {
      const label5 = getCommunityResultLabel(community_question, false);
      expect(label5).toBe(community_question.title);
    });
    it('should use the description if no title is available', () => {
      const label6 = getCommunityResultLabel(community_answer, true);
      expect(label6).toBe(community_answer.description);
    });
    it('should truncate the title', () => {
      const result = { ...community_answer } as any;
      result.description =
        "A much longer description that can't possibly fit on one line of a results list.";
      const label7 = getCommunityResultLabel(result, true);
      expect(label7).toBe('A much longer description that can ...');
    });
  });
  describe('convertDocsToItems', () => {
    it('should convert docs to a correctly formatted Item[]', () => {
      const formattedResults = convertDocsToItems(false, [docs_result]);
      expect(formattedResults).toEqual([
        {
          data: {
            href: DOCS_BASE_URL + docs_result.href,
            source: 'Linode documentation',
          },
          label: docs_result.title,
          value: 0,
        },
      ]);
    });
    it('should handle empty results lists correctly', () => {
      const results = convertDocsToItems(false, []);
      expect(results).toEqual([]);
    });
  });
  describe('convertCommunityToItems', () => {
    it('should convert a community question to a correctly formatted Item', () => {
      const formattedResults = convertCommunityToItems(false, [
        community_question,
      ] as any);
      expect(formattedResults).toEqual([
        {
          data: {
            href: expect.any(String),
            source: 'Linode Community Site',
          },
          label: community_question.title,
          value: 0,
        },
      ]);
    });
    it('should convert a community answer to a correctly formatted Item', () => {
      const formattedResults = convertCommunityToItems(false, [
        community_answer,
      ] as any);
      expect(formattedResults).toEqual([
        {
          data: {
            href: expect.any(String),
            source: 'Linode Community Site',
          },
          label: community_question.description,
          value: 0,
        },
      ]);
    });
  });
});
