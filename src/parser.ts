import { load } from "cheerio";

type Node = {
  title: string;
  content: string;
  children: Node[];
};

export function parse(html: string): Node {
  const cheerio = load(html);

  throw new Error("Not implemented");
}
