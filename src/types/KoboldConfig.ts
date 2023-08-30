import { Action } from "./Action";
export type Timestamps = {
  [key: string]: {
    [key: string]: number;
  };
};
export type Prompt = {
  text: string;
  "WI matches": unknown;
  "WI Text": string;
}[];

export type Preset = Partial<{
  preset: string;
  description: string;
  Match: string;
  "Preset Category": string;
  temp: number;
  genamt: number;
  top_k: number;
  top_p: number;
  top_a: number;
  typical: number;
  tfs: number;
  rep_pen: number;
  rep_pen_range: number;
  rep_pen_slope: number;
  sampler_order: number[];
}>;

export type PresetSubmenu = {
  Official: Preset[];
  Custom: Preset[];
};

export type PresetMenu = {
  Recommended: PresetSubmenu;
  "Same Class": PresetSubmenu;
  Other: PresetSubmenu;
};

export type Substitution = {
  target: string;
  substitution: string;
  trueTarget: string;
  enabled: boolean;
};

export type ContextItem = {
  type: string;
  text: string;
  tokens: [number, string][];
  attention_multiplier?: number;
  uid?: number;
  action_ids?: number[];
}

export type KoboldConfig = {
  model: {
    simple_randomness: number;
    simple_creativity: number;
    simple_repitition: number;
    max_length: number;
    ikmax: number;
    genamt: number;
    ikgen: number;
    rep_pen: number;
    rep_pen_slope: number;
    rep_pen_range: number;
    temp: number;
    top_p: number;
    top_k: number;
    top_a: number;
    tfs: number;
    typical: number;
    numseqs: number;
    generated_tkns: number;
    fp32_model: boolean;
    modeldim: number;
    sampler_order: number[];
    newlinemode: string;
    lazy_load: boolean;
    presets: PresetMenu;
    selected_preset: string;
    uid_presets: {
      [key: string]: unknown;
    };
    horde_wait_time: number;
    horde_queue_position: number;
    horde_queue_size: number;
    use_alt_rep_pen: boolean;
    model: string;
    model_type: string;
    modelconfig: {
      [key: string]: unknown;
    };
    custmodpth: string;
    loaded_layers: number;
    total_layers: number;
    total_download_chunks: number;
    downloaded_chunks: number;
    tqdm_progress: number;
    tqdm_rem_time: number;
    url: string;
    oaiurl: string;
    oaiengines: string;
    colaurl: string;
    oaiaapikey: string;
    configname: string;
    online_model: string;
    welcome_default: string;
    welcome: string;
    alt_multi_gen: boolean;
  };
  user: {
    wirmvwhtsp: boolean;
    widepth: number;
    formatoptns: {
      [key: string]: boolean;
    };
    frmttriminc: boolean;
    frmtrmblln: boolean;
    frmtrmspch: boolean;
    frmtadsnsp: boolean;
    singleline: boolean;
    remove_double_space: boolean;
    importnum: number;
    loadselect: string;
    spselect: string;
    svowname: string;
    saveow: boolean;
    sid: string;
    username: string;
    nopromptgen: boolean;
    rngpersist: boolean;
    nogenmod: boolean;
    debug: boolean;
    output_streaming: boolean;
    show_probs: boolean;
    beep_on_complete: boolean;
    img_gen_priority: number;
    show_budget: boolean;
    ui_level: number;
    img_gen_api_url: string;
    img_gen_art_guide: string;
    img_gen_negative_prompt: string;
    img_gen_steps: number;
    img_gen_cfg_scale: number;
    cluster_requested_models: unknown[];
    wigen_use_own_wi: boolean;
    wigen_amount: number;
    screenshot_show_story_title: boolean;
    screenshot_show_author_name: boolean;
    screenshot_author_name: string;
    screenshot_use_boring_colors: boolean;
  };
  system: {
    noai: boolean;
    aibusy: boolean;
    status_message: string;
    lua_running: boolean;
    abort: boolean;
    compiling: boolean;
    checking: boolean;
    sp_changed: boolean;
    spfilename: string;
    userscripts: string[];
    last_userscripts: unknown[];
    corescript: string;
    gpu_device: number;
    savedir: string;
    hascuda: boolean;
    usegpu: boolean;
    splist: unknown[];
    spselect: string;
    spname: string;
    sp_length: number;
    has_genmod: boolean;
    breakmodel: boolean;
    bmsupported: boolean;
    nobreakmodel: boolean;
    smandelete: boolean;
    smanrename: boolean;
    allowsp: boolean;
    host: boolean;
    flaskwebgui: boolean;
    quiet: boolean;
    use_colab_tpu: boolean;
    aria2_port: number;
    standalone: boolean;
    disable_set_aibusy: boolean;
    disable_input_formatting: boolean;
    disable_output_formatting: boolean;
    full_determinism: boolean;
    seed_specified: boolean;
    seed: number;
    alt_gen: boolean;
    theme_list: string[];
    cloudflare_link: string;
    story_loads: {
      [key: string]: string;
    };
    port: number;
    on_colab: boolean;
    horde_share: boolean;
    sh_apikey: string;
    generating_image: boolean;
    keep_img_gen_in_memory: boolean;
    cookies: {
      [key: string]: unknown;
    };
    experimental_features: boolean;
    bit_8_available: boolean;
    seen_messages: number[];
  };
  story: {
    privacy_mode: boolean;
    privacy_password: string;
    story_name: string;
    lastact: string;
    submission: string;
    lastctx: string;
    gamestarted: boolean;
    gamesaved: boolean;
    autosave: boolean;
    prompt_wi_highlighted_text: Prompt;
    memory: string;
    auto_memory: string;
    authornote: string;
    authornotetemplate: string;
    setauthornotetemplate: string;
    andepth: number;
    actions: Action[];
    actions_metadata: unknown;
    worldinfo: unknown[];
    worldinfo_i: unknown[];
    worldinfo_u: unknown;
    wifolders_d: {
      [key: string]: {
        name: string;
        collapsed: boolean;
      }
    };
    wifolders_l: number[];
    wifolders_u: unknown;
    lua_edited: unknown[];
    lua_deleted: unknown[];
    mode: string;
    editln: number;
    genseqs: unknown[];
    recentback: boolean;
    useprompt: boolean;
    chatmode: boolean;
    botname: string;
    chatname: string;
    adventure: boolean;
    actionmode: number;
    storymode: number;
    dynamicscan: boolean;
    recentedit: boolean;
    notes: string;
    hidden_prompt: string;
    biases: unknown;
    story_id: number;
    memory_length: number;
    prompt_length: number;
    authornote_length: number;
    max_memory_fraction: number;
    max_prompt_length: number;
    max_authornote_length: number;
    prompt_in_ai: boolean;
    context: ContextItem[];
    picture: string;
    picture_prompt: string;
    substitutions: Substitution[];
    gen_audio: boolean;
    prompt_picture_filename: string;
    prompt_picture_prompt: string;
    genres: unknown[];
    memory_attn_bias: number;
    an_attn_bias: number;
    chat_style: number;
    commentary_chance: number;
    commentary_enabled: boolean;
  };
  actions: {
    "Action Count": number;
  };
};
