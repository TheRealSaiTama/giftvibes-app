import diaries from '@/data/diaries.json';

export type DiaryRow = {
  [key: string]: string;
};

export function getDiaryRows(): DiaryRow[] {
  return diaries as DiaryRow[];
}
