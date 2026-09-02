import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PriceUnavailableError } from "@/features/prices/api";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retrying a "not published yet" or "before our history starts" 404
      // can't ever succeed - the answer won't change - so skip the default
      // retry-with-backoff for that case specifically, but keep it (up to
      // the default of 3) for real transient failures. Set here rather
      // than on the useQuery call itself, so a test file's own QueryClient
      // (e.g. retry: false) can still override this per-query default
      // instead of being silently overridden by it.
      retry: (failureCount, error) =>
        error instanceof PriceUnavailableError ? false : failureCount < 3,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Optional segment (react-router v6.5+): one Route instance for
              both "/" and "/no1" so the initial redirect from "/" to the
              persisted zone's URL doesn't remount App. */}
          <Route path="/:zone?" element={<App />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
