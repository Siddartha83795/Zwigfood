
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isTimestamp(value: any): value is { toDate: () => Date } {
    return value && typeof value.toDate === 'function';
}

    