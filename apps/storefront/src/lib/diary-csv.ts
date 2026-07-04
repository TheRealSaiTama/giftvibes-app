import { fileURLToPath } from 'url';

interface DiaryCsvDescriptor {
  name: string;
  url: URL;
  path: string;
}

function createDescriptor(name: string, relativePath: string): DiaryCsvDescriptor {
  const url = new URL(relativePath, import.meta.url);
  const path = fileURLToPath(url);
  return { name, url, path };
}

export const diaryCsvFiles: DiaryCsvDescriptor[] = [
  createDescriptor(
    'RE Products Page - Premium PU Leather Diaries.csv',
    '../../csv/RE Products Page - Premium PU Leather Diaries.csv'
  ),
  createDescriptor(
    'RE Products Page - Hardbound Diaries.csv',
    '../../csv/RE Products Page - Hardbound Diaries.csv'
  ),
];
