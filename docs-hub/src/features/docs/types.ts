export type DocKind = 'html' | 'pdf' | 'markdown' | 'image' | 'video' | 'code';

export interface DocRecord {
  id: string;
  title: string;
  kind: DocKind;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: number;
  body: Blob;
}

export type DocMeta = Omit<DocRecord, 'body'>;

export interface TocItem {
  level: number;
  text: string;
  id: string;
}
