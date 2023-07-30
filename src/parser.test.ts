import dedent from "dedent";
import { parse } from "./parser";

describe("parse", () => {
  it("should parse the content to a tree", () => {
    const html = dedent`
      <main>
        <h1>Main Heading</h1>
        
        <p>This is a paragraph below the main heading.</p>
        
        <p>
          <h2>Subheading 1</h2>
        </p>
        
        <p>This is a paragraph below the first subheading.</p>
        
        <h3>Subheading 1.1</h3>
        
        <p>This is a paragraph below the nested subheading.</p>
        
        <p>
          <h2>Subheading 2</h2>
        </p>
        
        <p>This is a paragraph below the second subheading.</p>
      </main>
    `;

    const output = parse(html);

    expect(output).toEqual({
      title: "Main Heading",
      content: "This is a paragraph below the main heading.",
      children: [
        {
          title: "Subheading 1",
          content: "This is a paragraph below the first subheading.",
          children: [
            {
              title: "Subheading 1.1",
              content: "This is a paragraph below the nested subheading.",
              children: [],
            },
          ],
        },
        {
          title: "Subheading 2",
          content: "This is a paragraph below the second subheading.",
          children: [],
        },
      ],
    });
  });
});
