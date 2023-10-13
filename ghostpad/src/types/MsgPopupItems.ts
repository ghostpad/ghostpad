export type ExtraStoryParams = [string, number, number];
export type ExtraScriptParams = [string, string];

export type MsgPopupItems = {
    show_filename: boolean;
    // This message is an RPC style trigger for a popup. We're not using that part of it, but will sync our state with data from this message.
    // items is an array of arrays, each containing:
    // [0] - "not valid v3 story" boolean. Should be false 99% of the time.
    // [1] - The path to the file.
    // [2] - The name of the file.
    // [3] - A boolean indicating whether or not the file is valid.
    // [4] - An array containing extra parameters. 
    //   For stories:
    //   [4][0] - The name of the story.
    //   [4][1] - The action count of the story.
    //   [4][2] - The timestamp of the story.
    //   For userscripts:
    //   [4][0] - The name of the script.
    //   [4][1] - The description of the script
    items: [boolean, string, string, boolean, ExtraStoryParams | ExtraScriptParams][];
    // Unused RPC stuff
    column_names: string[];
    column_widths: string[];
}