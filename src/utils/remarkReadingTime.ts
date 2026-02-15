import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime() {
  return function (_tree: unknown, file: { data: { astro: { frontmatter: Record<string, unknown> } } }) {
    const textOnPage = toString(_tree as import('mdast').Root);
    const readingTime = getReadingTime(textOnPage);
    file.data.astro.frontmatter.minutesRead = readingTime.text;
  };
}
