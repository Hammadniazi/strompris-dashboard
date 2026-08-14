import { useEffect, useState } from "react";

export default function App() {
  const [prices, setPrices] = useState<unknown[]>([]);

  useEffect(() => {
    fetch("https://www.hvakosterstrommen.no/api/v1/prices/2026/08-14_NO5.json")
      .then((r) => r.json())
      .then(setPrices);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium">Strømpris NO5</h1>
      <pre className="mt-4 text-xs">{JSON.stringify(prices, null, 2)}</pre>
    </div>
  );
}
