export interface Tool {
  id: string;
  title: string;
  description: string;
  href: string;
  category: string;
}

export type ToolCategory = 'Encoding' | 'Conversion' | 'Validation' | 'Utilities' | 'Analysis';
