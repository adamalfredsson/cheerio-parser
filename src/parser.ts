import { AnyNode, Element, Cheerio, load, CheerioAPI } from "cheerio";

interface Node {
  title: string;
  content?: string;
  anchor?: string;
  children: Node[];
}

function extractHtmlBetween($from: Cheerio<Element>, $to: Cheerio<Element>) {
  const $ = $from.clone();
  let $current = $from;
  while ($current.next()[0] !== $to[0]) {
    $current = $current.next();
    $.append($current.clone());
  }
  return $.html() || undefined;
}

interface CheerioNode {
  $: Cheerio<Element>;
  children: CheerioNode[];
}

function findNodeByLevel(nodes: CheerioNode[], level: number) {
  return nodes.find((node) => {
    const nodeLevel = parseInt(node.$.prop("tagName").slice(1));
    return nodeLevel === level;
  });
}

function createCheerioTree($: CheerioAPI): CheerioNode[] {
  const nodes: CheerioNode[] = [];
  let $previousNode: Cheerio<Element> | undefined;

  $.root()
    .find("h1, h2, h3, h4, h5, h6")
    .each((_, el) => {
      const $el = $(el);
      const previousNodeLevel = parseInt(
        $previousNode?.prop("tagName").slice(1) || "0"
      );
      const parentNode = findNodeByLevel(nodes, previousNodeLevel);

      (parentNode?.children || nodes).push({
        $: $el,
        children: [],
      });

      $previousNode = $el;
    });

  return nodes;
}

function parseCheerioNode(node: CheerioNode, nextNode: CheerioNode): Node {
  const $el = node.$;
  const title = $el.text();
  const content = extractHtmlBetween($el, nextNode.$);
  const anchor = $el.attr("id");
  return {
    title,
    content,
    anchor,
    children: node.children.map((childNode, index) =>
      parseCheerioNode(childNode, node.children[index + 1] || nextNode)
    ),
  };
}
 

export function parse(html: string): { content?: string; nodes: Node[] } {
  const $ = load(html);
  const nodes: Node[] = [];
  let $previousNode: Cheerio<Element> | undefined;

  createCheerioTree($).forEach((node) => {
    const $el = node.$;
    if ($previousNode) {
      
    }
  });


  return { nodes };
}
