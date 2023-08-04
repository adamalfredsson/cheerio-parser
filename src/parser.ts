import * as cheerio from "cheerio";
import TurndownService from "turndown";

interface Node {
  title: string;
  content?: string;
  anchor?: string;
  children: Node[];
}

export function parse(html: string): { content?: string; nodes: Node[] } {
  const $ = cheerio.load(html);
  let nodes: Node[] = [];
  let lastNodes: Node[] = [];
  const turndownService = new TurndownService();

  const createNode = (title: string, anchor?: string): Node => ({
    title,
    anchor,
    children: [],
  });

  let content: string | undefined;
  let nearestAnchor: string | undefined;

  let notTags = $("body").contents().filter((_, x) => x.type === 'text').map((_, x) => $(x)).toArray();
  let notTagIndex = 0;

  $("body *").each((_, el) => {
    const $el = $(el);

    const tagLevel = parseInt($el.prop("tagName")!.slice(1));
    if ($el.attr("id")) nearestAnchor = $el.attr("id");
    if (!isNaN(tagLevel)) {
      const node = createNode($el.text(), nearestAnchor ?? $el.attr("id"));
      nearestAnchor = undefined;
      if (tagLevel <= lastNodes.length) {
        lastNodes = lastNodes.slice(0, tagLevel - 1);
      }
      if (tagLevel === 1 || lastNodes.length === 0) {
        nodes.push(node);
      } else {
        const parentNode = lastNodes[lastNodes.length - 1];
        if (parentNode !== undefined) {
          parentNode.children.push(node);
        }
      }
      lastNodes.push(node);
    } else {
      const text = turndownService.turndown($el.html() || "");
      console.log($el.is("p"), "     ",text.includes('Bare Text'))
      if (text && lastNodes.length > 0) {
        const lastNode = lastNodes[lastNodes.length - 1];
        if (text && lastNode !== undefined) {
          // since we only do for one case
          if ($el.is("p") || $el.is("ul")) {
            lastNode.content =
              (lastNode.content ? lastNode.content + "\n" : "") + text;
          }
        }
      }
    }

    if (notTags.length > notTagIndex) {
      const textNode = notTags[notTagIndex];
      if (textNode) {
        const text = textNode.text().trim();
        if (text && lastNodes.length > 0) {
          const lastNode = lastNodes[lastNodes.length - 1];
          if (text && lastNode !== undefined) {
            lastNode.content =
              (lastNode.content ? lastNode.content + "\n" : "") + text;
          }
        }
        notTagIndex++;
      }
    }

    if (nodes.length === 0 && $el.is("p")) {
      content = (content ? content + "\n" : "") + $el.text();
    }
  });

  return { content, nodes };
}