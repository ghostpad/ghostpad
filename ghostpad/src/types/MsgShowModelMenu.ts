export type LocalModel = {
    isDirectory?: boolean,
    isDownloaded?: boolean,
    isMenu: boolean,
    label: string,
    menu: string,
    name: string,
    path?: string,
    size: string
};

export type MsgShowModelMenu = {
    breadcrumbs: [string,string][],
    items: LocalModel[],
};
