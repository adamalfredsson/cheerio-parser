import dedent from "dedent";
import { parse } from "./parser";

describe("parse", () => {
  it("should parse the content to a tree", () => {
    const html = dedent`
      <h1>Heading 1</h1>
      This is a paragraph below the main heading.
      <h1>Heading 2</h1>
      This is a paragraph below the second heading.
      <h2>Subheading 2.1</h2>
      This is a paragraph below the nested subheading.
    `;

    const output = parse(html);

    expect(output).toEqual({
      nodes: [
        {
          title: "Heading 1",
          content: "This is a paragraph below the main heading.",
          anchor: undefined,
          children: [],
        },
        {
          title: "Heading 2",
          content: "This is a paragraph below the second heading.",
          anchor: undefined,
          children: [
            {
              title: "Subheading 2.1",
              content: "This is a paragraph below the nested subheading.",
              anchor: undefined,
              children: [],
            },
          ],
        },
      ],
    });
  });

  it("should parse nodes without content", () => {
    const html = dedent`
      <h1>Main Heading</h1>
      <h2>Subheading 1</h2>
      <h3>Subheading 1.1</h3>
      <p>Content for first subheading.</p>
    `;

    const output = parse(html);

    expect(output).toEqual({
      nodes: [
        {
          title: "Main Heading",
          content: undefined,
          anchor: undefined,
          children: [
            {
              title: "Subheading 1",
              content: undefined,
              anchor: undefined,
              children: [
                {
                  title: "Subheading 1.1",
                  content: "Content for first subheading.",
                  anchor: undefined,
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it("should return text without parent", () => {
    const html = dedent`
      <p>No heading</p>
      <h1>Main Heading</h1>
      <p>This is a paragraph below the main heading.</p>
    `;

    const output = parse(html);

    expect(output).toEqual({
      content: "No heading",
      nodes: [
        {
          title: "Main Heading",
          content: "This is a paragraph below the main heading.",
          anchor: undefined,
          children: [],
        },
      ],
    });
  });

  it("should parse nodes for nested headings", () => {
    const html = dedent`
      <main>
        <h1>Main Heading</h1>
        <p>This is a paragraph below the main heading.</p>

        <div>
          <h2>Subheading 1</h2>
        </div>

        <p>Content for first subheading.</p>
      </main>
    `;

    const output = parse(html);

    expect(output).toEqual({
      nodes: [
        {
          title: "Main Heading",
          content: "This is a paragraph below the main heading.",
          anchor: undefined,
          children: [
            {
              title: "Subheading 1",
              content: "Content for first subheading.",
              anchor: undefined,
              children: [],
            },
          ],
        },
      ],
    });
  });

  it("should parse content to markdown", () => {
    const html = dedent`
      <main>
        <h1>Main Heading</h1>

        <h2>Subheading 1</h2>

        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </main>
    `;

    const output = parse(html);

    expect(output).toEqual({
      nodes: [
        {
          title: "Main Heading",
          content: undefined,
          anchor: undefined,
          children: [
            {
              title: "Subheading 1",
              content: dedent`
                *   Item 1
                *   Item 2
              `,
              anchor: undefined,
              children: [],
            },
          ],
        },
      ],
    });
  });

  it("should apply nearest anchor", () => {
    const html = dedent`
      <main>
        <h1>Main Heading</h1>
        <section id="section-1">
          <p>Shame on me</p>
          <h2>Subheading 1</h2>
          <p>Content for first subheading.</p>
        </section>
        <section id="section-2">
          <p>Content before second subheading.</p>
          <h2 id="subheading-2">Subheading 2</h2>
          <p>Content for second subheading.</p>
        </section>
      </main>
    `;

    const output = parse(html);

    expect(output).toEqual({
      nodes: [
        {
          title: "Main Heading",
          content: "Shame on me",
          anchor: undefined,
          children: [
            {
              title: "Subheading 1",
              content: dedent`
                Content for first subheading.
                Content before second subheading.
              `,
              anchor: "section-1",
              children: [],
            },
            {
              title: "Subheading 2",
              content: "Content for second subheading.",
              anchor: "subheading-2",
              children: [],
            },
          ],
        },
      ],
    });
  });

  it("should test everything", () => {
    const html = dedent`
      <main>
        <h1>Main Heading</h1>
        
        <p>This is a paragraph below the main heading.</p>
        
        <section id="section-1">
          <p>
            <h2>Subheading 1</h2>
            <p>This is a paragraph below the first subheading.</p>
          </p>
          
          <p>Content for first subheading.</p>
          
          <h3>Subheading 1.1</h3>
          
          <p>This is a paragraph below the nested subheading.</p>
          
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </section>

          <h2 id="subheading-2">Subheading 2</h2>
          <p>Bare text</p>
        
        <p>This is a paragraph <strong>below</strong> the second subheading.</p>
      </main>
    `;

    const output = parse(html);

    expect(output).toEqual({
      nodes: [
        {
          title: "Main Heading",
          content: "This is a paragraph below the main heading.",
          anchor: undefined,
          children: [
            {
              title: "Subheading 1",
              content: dedent`
                This is a paragraph below the first subheading.
                Content for first subheading.
              `,
              anchor: "section-1",
              children: [
                {
                  title: "Subheading 1.1",
                  anchor: undefined,
                  content: dedent`
                    This is a paragraph below the nested subheading.
                    *   Item 1
                    *   Item 2
                  `,
                  children: [],
                },
              ],
            },
            {
              title: "Subheading 2",
              anchor: "subheading-2",
              content: dedent`
                Bare text
                This is a paragraph **below** the second subheading.
              `,
              children: [],
            },
          ],
        },
      ],
    });
  });
});