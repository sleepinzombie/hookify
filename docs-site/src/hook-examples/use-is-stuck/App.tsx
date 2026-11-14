import { ActionBar } from "./ActionBar";
import { StackedBars } from "./StackedBars";
import { StickyHeader } from "./StickyHeader";

export default function App() {
  return (
    <>
      <StickyHeader />
      <ActionBar />
      <StackedBars />
    </>
  );
}
