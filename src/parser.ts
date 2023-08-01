interface Node {
  title: string;
  content?: string;
  anchor?: string;
  children: Node[];
}

export function parse(html: string): { content?: string; nodes: Node[] } {
  throw new Error("Not implemented");
}
