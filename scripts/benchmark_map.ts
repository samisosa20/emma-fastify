
const iterations = 5000;
const arraySize = 1000;
const data = Array.from({ length: arraySize }, (_, i) => ({ id: i.toString(), name: `Item ${i}` }));

console.log(`Benchmarking Map construction with array size ${arraySize} over ${iterations} iterations...`);

console.time("new Map(data.map)");
for (let i = 0; i < iterations; i++) {
  const map = new Map(data.map(item => [item.id, item]));
}
console.timeEnd("new Map(data.map)");

console.time("for...of loop");
for (let i = 0; i < iterations; i++) {
  const map = new Map();
  for (const item of data) {
    map.set(item.id, item);
  }
}
console.timeEnd("for...of loop");

console.time("for loop (indexed)");
for (let i = 0; i < iterations; i++) {
  const map = new Map();
  const len = data.length;
  for (let j = 0; j < len; j++) {
    const item = data[j];
    map.set(item.id, item);
  }
}
console.timeEnd("for loop (indexed)");
