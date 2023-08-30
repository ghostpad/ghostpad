export type Model = {
  // The GPU id followed by "_Layers" is used as a key.
  [key: string]: string | string[] | number | undefined;
  CPU_Layers?: number;
  Disk_Layers?: number;
  class: string;
  id: string;
  isdirectory?: string;
  isdownloaded?: string;
  custom_model_name?: string;
  ismenu: string;
  label: string;
  menu: string;
  name: string;
  path?: string;
  plugin?: string;
  size: string;
  valid_backends?: string[];
};
