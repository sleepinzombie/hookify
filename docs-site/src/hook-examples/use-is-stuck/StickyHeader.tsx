import { useIsStuck } from "@altalyst/hookify";
import { useState } from "react";

export const StickyHeader = () => {
  // The header sticks inside this scroll container, so it is the observer root.
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const { ref, isStuck } = useIsStuck<HTMLElement>({ root });

  return (
    <div>
      <h2>Sticky header</h2>
      <p>
        Scroll the box. The header gets a shadow only while it is stuck to the
        top. Stuck: <strong>{String(isStuck)}</strong>.
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
        <div style={{ padding: 8 }}>Intro text above the header.</div>
        <header
          ref={ref}
          style={{
            position: "sticky",
            top: 0,
            padding: 8,
            fontWeight: "bold",
            background: "Canvas",
            borderBottom: "1px solid",
            boxShadow: isStuck ? "0 2px 8px rgba(0, 0, 0, 0.3)" : "none",
            transition: "box-shadow 150ms",
          }}
        >
          {isStuck ? "Pinned header" : "Header"}
        </header>
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i} style={{ margin: 0, padding: 8 }}>
            Row {i + 1}
          </p>
        ))}
      </div>
    </div>
  );
};
