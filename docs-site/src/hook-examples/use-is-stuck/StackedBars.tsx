import { useIsStuck } from "@altalyst/hookify";
import { useState } from "react";

const BAR_HEIGHT = 36;

export const StackedBars = () => {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  // The toolbar sits below the title bar, so it sticks at `top: 36px`.
  const title = useIsStuck<HTMLDivElement>({ root });
  const toolbar = useIsStuck<HTMLDivElement>({ root, offset: BAR_HEIGHT });

  const bar = (stuck: boolean) =>
    ({
      height: BAR_HEIGHT,
      boxSizing: "border-box",
      padding: 8,
      background: stuck ? "Highlight" : "Canvas",
      color: stuck ? "HighlightText" : "CanvasText",
      borderBottom: "1px solid",
    }) as const;

  return (
    <div>
      <h2>Offset</h2>
      <p>
        Two stacked bars. The toolbar uses <code>top: {BAR_HEIGHT}</code>, so it
        passes <code>offset: {BAR_HEIGHT}</code> and is stuck when it reaches
        that line, not the edge. Title stuck:{" "}
        <strong>{String(title.isStuck)}</strong>, toolbar stuck:{" "}
        <strong>{String(toolbar.isStuck)}</strong>.
      </p>
      <div
        ref={setRoot}
        style={{
          height: 200,
          overflowY: "auto",
          border: "1px solid",
          borderRadius: 4,
        }}
      >
        <div
          ref={title.ref}
          style={{ ...bar(title.isStuck), position: "sticky", top: 0 }}
        >
          Title bar
        </div>
        <div style={{ padding: 8 }}>Some content between the bars.</div>
        <div
          ref={toolbar.ref}
          style={{
            ...bar(toolbar.isStuck),
            position: "sticky",
            top: BAR_HEIGHT,
          }}
        >
          Toolbar
        </div>
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i} style={{ margin: 0, padding: 8 }}>
            Row {i + 1}
          </p>
        ))}
      </div>
    </div>
  );
};
