export function arrayRotate<V>(items: Array<V>, nextIndex: number): Array<V> {
  if (!Array.isArray(items)) {
    throw new TypeError(`Expected an array, got ${typeof items}`);
  }

  const x = items.slice();
  const num = typeof nextIndex === 'number' ? nextIndex : 0;

  return x.splice(-num % x.length).concat(x);
}