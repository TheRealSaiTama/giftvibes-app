interface DiaryCsvDescriptor {
  name: string;
  url: URL;
}

export const diaryCsvFiles: DiaryCsvDescriptor[] = [
  {
    name: 'RE Products Page - Premium PU Leather Diaries.csv',
    url: new URL('../../csv/RE Products Page - Premium PU Leather Diaries.csv', import.meta.url),
  },
  {
    name: 'RE Products Page - Hardbound Diaries.csv',
    url: new URL('../../csv/RE Products Page - Hardbound Diaries.csv', import.meta.url),
  },
];
