
import { Decimal } from "@prisma/client/runtime/library";

function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function toManualUTCDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
}

const iterations = 100000;
const testDate = new Date("2024-05-20T12:00:00Z");

console.log(`Running benchmark for ${iterations} iterations...`);

console.time("toISOString().split('T')[0]");
for (let i = 0; i < iterations; i++) {
  toISODate(testDate);
}
console.timeEnd("toISOString().split('T')[0]");

console.time("Manual UTC formatting");
for (let i = 0; i < iterations; i++) {
  toManualUTCDate(testDate);
}
console.timeEnd("Manual UTC formatting");

// Verification
const iso = toISODate(testDate);
const manual = toManualUTCDate(testDate);
console.log(`ISO result:    ${iso}`);
console.log(`Manual result: ${manual}`);
if (iso !== manual) {
  console.error("ERROR: Manual format does not match ISO format!");
  // @ts-ignore
  if (typeof process !== 'undefined') process.exit(1);
}
