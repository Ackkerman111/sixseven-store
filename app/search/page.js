import { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading search…</div>}>
      <SearchClient />
    </Suspense>
  );
}
