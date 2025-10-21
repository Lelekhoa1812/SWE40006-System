// Web Vitals placeholder - will be wired to Application Insights later
export function logWebVitals(metric: {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType: string;
}) {
  console.log('Web Vital:', {
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });
}

export function initMetrics() {
  // Placeholder for future Application Insights integration
  console.log('Metrics initialized (placeholder)');
}
