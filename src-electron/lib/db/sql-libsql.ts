/* eslint-disable @typescript-eslint/no-non-null-assertion */
// sql.ts - A TypeScript SQL tagged template library for safe query parameterization

import type { InValue } from "@libsql/client";

/**
 * Tagged template literal function for safe SQL queries.
 * It converts interpolated values into parameterized placeholders ($1, $2, etc.)
 * to prevent SQL injection.
 *
 * @param strings - The static string parts of the template.
 * @param values - The dynamic values to interpolate.
 * @returns An object with the parameterized query text and values array.
 */
export function sql(
  strings: TemplateStringsArray,
  ...values: readonly (InValue | undefined)[]
): { args: InValue[]; sql: string } {
  let queryText = "";
  const params: Array<InValue> = [];

  // Build the query text with placeholders
  strings.forEach((str, i) => {
    queryText += str;
    if (i < values.length) {
      const value = values[i];
      let param: InValue = value === undefined ? null : value;
      // Trim string values to handle extra spaces
      if (typeof param === "string") {
        param = param.trim();
      }
      params.push(param);
      queryText += `?`;
    }
  });

  // Trim and clean up the final query text by replacing multiple whitespace characters (including newlines) with a single space.
  queryText = queryText.replace(/\s+/g, " ").trim();
  return {
    sql: queryText,
    args: params,
  };
}

/**
 * Unsafe function that takes the output of the safe sql template and directly substitutes
 * the values into the query string without parameterization. This can lead to SQL injection
 * if used with untrusted input, so use with caution (e.g., for debugging or trusted values only).
 *
 * @param query - The object returned from the sql tagged template, containing sql and args.
 * @returns The fully substituted SQL string.
 */
export function unsafe(query: { sql: string; args: InValue[] }): string {
  const parts = query.sql.split("?");

  if (parts.length !== query.args.length + 1) {
    throw new Error("Mismatch between placeholders and arguments");
  }

  let result = parts[0];

  if (result === undefined) {
    throw new Error("parts[0] of sql is undefined");
  }

  for (let i = 0; i < query.args.length; i++) {
    result += query.args[i]!.toString();
    result += parts[i + 1];
  }

  return result;
}

/**
 * Unsafe function that takes the output of the safe sql template and directly substitutes
 * the values into the query string without parameterization. This can lead to SQL injection
 * if used with untrusted input, so use with caution (e.g., for debugging or trusted values only).
 *
 * @param query - The object returned from the sql tagged template, containing sql and args.
 * @returns The fully substituted SQL string.
 */
export function unsafeSQL(query: { sql: string; args: InValue[] }): string {
  const parts = query.sql.split("?");

  if (parts.length !== query.args.length + 1) {
    throw new Error("Mismatch between placeholders and arguments");
  }

  let result = parts[0];
  if (result === undefined) {
    throw new Error("parts[0] of sql is undefined");
  }
  for (let i = 0; i < query.args.length; i++) {
    result += query.args[i]!.toString();
    result += parts[i + 1];
  }

  return result;
}

// /* eslint-disable @typescript-eslint/no-non-null-assertion */
// // sql.ts - A TypeScript SQL tagged template library for safe query parameterization

// import type { InStatement, InValue } from "@libsql/client";

// /**
//  * Tagged template literal function for safe SQL queries.
//  * It converts interpolated values into parameterized placeholders ($1, $2, etc.)
//  * to prevent SQL injection.
//  *
//  * @param strings - The static string parts of the template.
//  * @param values - The dynamic values to interpolate.
//  * @returns An object with the parameterized query text and values array.
//  */
// export function sql(
//   strings: TemplateStringsArray,
//   ...values: InValue[]
// ): InStatement & { unSafe: string } {
//   let queryText = "";
//   const params: Array<InValue> = [];

//   // Build the query text with placeholders
//   strings.forEach((str, i) => {
//     queryText += str;
//     if (i < values.length) {
//       params.push(values[i]!);
//       queryText += `?`;
//     }
//   });

//   return {
//     sql: queryText,
//     args: params,
//     unSafe: "",
//   };
// }

// export function unSafe(sql: { args: InValue[]; sql: string }) {
//   return {
//     sql: sql.sql.replace(/\?/g, () => {
//       const arg = sql.args.shift();
//       if (typeof arg === "string") {
//         return `${arg}`;
//       }
//       return `${arg}`;
//     }),
//   };
// }

// export function unSafe(sqlObj: { args: InValue[]; sql: string }) {
//   const replacedSql = sqlObj.sql.replace(/\?/g, () => {
//     const arg = sqlObj.args.shift();
//     if (typeof arg === "string") {
//       return `${arg}`;
//     }
//     return `${arg}`;
//   });
//   return { sql: replacedSql, args: [] }; // Agora retorna objeto compatível com batch
// }
