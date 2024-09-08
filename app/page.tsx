import { Suspense } from "react";
import Dashboard from "./dashboard/Dashboard";

export default function Home() {
  {
    /* Render the component based on URL */
  }
  return (
    <Suspense fallback={"Loading..."}>
      <Dashboard />
    </Suspense>
  );
}
