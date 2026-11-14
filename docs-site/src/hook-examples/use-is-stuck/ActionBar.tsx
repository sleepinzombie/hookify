import { useIsStuck } from "@altalyst/hookify";
import { useState } from "react";

export const ActionBar = () => {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  // The bar sticks to the bottom edge, so it looks at the bottom side.
  const { ref, isStuck } = useIsStuck<HTMLDivElement>({
    root,
    side: "bottom",
  });

  return (
    <div>
      <h2>Bottom action bar</h2>
      <p>
        <code>side: "bottom"</code>. The bar has a top border and shadow while
        it floats over the content, and looks flat once you reach the end of the
        form.
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
        {Array.from({ length: 8 }, (_, i) => (
          <label key={i} style={{ display: "block", padding: 8 }}>
            Field {i + 1} <input />
          </label>
        ))}
        <div
          ref={ref}
          style={{
            position: "sticky",
            bottom: 0,
            display: "flex",
            gap: 8,
            padding: 8,
            background: "Canvas",
            borderTop: isStuck ? "1px solid" : "1px solid transparent",
            boxShadow: isStuck ? "0 -2px 8px rgba(0, 0, 0, 0.3)" : "none",
            transition: "box-shadow 150ms",
          }}
        >
          <button>Save</button>
          <button>Cancel</button>
        </div>
      </div>
    </div>
  );
};
