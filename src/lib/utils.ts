import { type ClassValue, clsx } from 'clsx';
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
