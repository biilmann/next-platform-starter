import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function uniqueName(): string {
  return uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: '-' });
}

export function uploadDisabled(): boolean {
  return false;
}

export function getResourceSize(url: string): string {
  try {
    const sizeMatch = /\d+x\d+/.exec(url);
    return sizeMatch ? sizeMatch[0] : '';
  } catch {
    return '';
  }
}