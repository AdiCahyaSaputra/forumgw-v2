import { type ClassValue, clsx } from 'clsx';
import { sql, type SQL } from 'drizzle-orm';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sendTRPCResponse<T = void>(
  baseResponse: { status: number; message: string },
  data: T | undefined = undefined
) {
  return {
    ...baseResponse,
    data: data as T
  };
}

export function drizzleWhen<T>(condition: SQL<unknown>, value: T): SQL<T> {
  return sql`when ${condition} then ${value}`;
}

export function drizzleElse<T>(value: T): SQL<T> {
  return sql`else ${value}`;
}

export function drizzleCase<TRuleReturn>(...rules: SQL<TRuleReturn>[]): SQL<TRuleReturn> {
  const query = sql<TRuleReturn>`case`;

  rules.forEach(rule => {
    query.append(rule);
  });

  query.append(sql`end`);

  return query;
}
