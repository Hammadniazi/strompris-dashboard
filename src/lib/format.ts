export function formatOre(nokPerKwh: number): string {
  return `${(nokPerKwh * 100).toLocaleString("nb-NO", { maximumFractionDigits: 1 })} øre`;
}

export function formatNok(value: number): string {
  return value.toLocaleString("nb-NO", { style: "currency", currency: "NOK" });
}
