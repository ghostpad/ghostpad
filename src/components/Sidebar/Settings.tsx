import { saveGhostpadConfig } from "@/ghostpadApi/saveGhostpadConfig";
import { GhostpadConfig, updateGhostpadConfig } from "@/store/configSlice";
import { SocketState, updateSocketState } from "@/store/connectionSlice";
import { RootState } from "@/store/store";
import { debounce } from "@/util/debounce";
import { Dispatch } from "@reduxjs/toolkit";
import { ChangeEvent, Fragment, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SpeechSynthesisContext } from "../SpeechSynthesisProvider";

// DaisyUI themes.
// See https://daisyui.com/docs/themes/#-4 for info on adding your own.
const availableThemes = [
  "acid",
  "aqua",
  "autumn",
  "black",
  "bumblebee",
  "business",
  "corporate",
  "cupcake",
  "dark",
  "dracula",
  "emerald",
  "fantasy",
  "garden",
  "halloween",
  "lemonade",
  "light",
  "lofi",
  "night",
  "retro",
  "synthwave",
  "valentine",
  "winter",
  "wireframe",
];

type GoogleFont = {
  linkFamily: string;
  cssFamily: string;
};

type GoogleFontCategory = {
  name: string;
  items: GoogleFont[];
};

const availableGoogleFonts: GoogleFontCategory[] = [
  {
    name: "Serif",
    items: [
      {
        linkFamily: "Rasa",
        cssFamily: "Rasa",
      },
      {
        linkFamily: "Lora",
        cssFamily: "Lora",
      },
      {
        linkFamily: "Alegreya",
        cssFamily: "Alegreya",
      },
      {
        linkFamily: "Roboto+Slab",
        cssFamily: "Roboto Slab",
      },
      {
        linkFamily: "Merriweather",
        cssFamily: "Merriweather",
      },
      {
        linkFamily: "PT+Serif",
        cssFamily: "PT Serif",
      },
      {
        linkFamily: "Noto+Serif",
        cssFamily: "Noto Serif",
      },
      {
        linkFamily: "Libre+Baskerville",
        cssFamily: "Libre Baskerville",
      },
      {
        linkFamily: "Source+Serif+Pro",
        cssFamily: "Source Serif Pro",
      },
      {
        linkFamily: "Bitter",
        cssFamily: "Bitter",
      },
      {
        linkFamily: "EB+Garamond",
        cssFamily: "EB Garamond",
      },
      {
        linkFamily: "Crimson+Text",
        cssFamily: "Crimson Text",
      },
    ],
  },
  {
    name: "Sans-Serif",
    items: [
      {
        linkFamily: "Roboto",
        cssFamily: "Roboto",
      },
      {
        linkFamily: "Lato",
        cssFamily: "Lato",
      },
      {
        linkFamily: "Manrope",
        cssFamily: "Manrope",
      },
      {
        linkFamily: "Geologica",
        cssFamily: "Geologica",
      },
      {
        linkFamily: "Open+Sans",
        cssFamily: "Open Sans",
      },
      {
        linkFamily: "Source+Sans+Pro",
        cssFamily: "Source Sans Pro",
      },
      {
        linkFamily: "Inter",
        cssFamily: "Inter",
      },
      {
        linkFamily: "Noto+Sans",
        cssFamily: "Noto Sans",
      },
      {
        linkFamily: "Rubik",
        cssFamily: "Rubik",
      },
      {
        linkFamily: "Heebo",
        cssFamily: "Heebo",
      },
      {
        linkFamily: "IBM+Plex+Sans",
        cssFamily: "IBM Plex Sans",
      },
    ],
  },
  {
    name: "Monospaced",
    items: [
      {
        linkFamily: "Inconsolata",
        cssFamily: "Inconsolata",
      },
      {
        linkFamily: "VT323",
        cssFamily: "VT323",
      },
      {
        linkFamily: "Anonymous+Pro",
        cssFamily: "Anonymous Pro",
      },
      {
        linkFamily: "Roboto+Mono",
        cssFamily: "Roboto Mono",
      },
      {
        linkFamily: "Fira+Code",
        cssFamily: "Fira Code",
      },
      {
        linkFamily: "Source+Code+Pro",
        cssFamily: "Source Code Pro",
      },
      {
        linkFamily: "IBM+Plex+Mono",
        cssFamily: "IBM Plex Mono",
      },
      {
        linkFamily: "Cousine",
        cssFamily: "Cousine",
      },
      {
        linkFamily: "Courier+Prime",
        cssFamily: "Courier Prime",
      },
      {
        linkFamily: "JetBrains+Mono",
        cssFamily: "JetBrains Mono",
      },
      {
        linkFamily: "Noto+Sans+Mono",
        cssFamily: "Noto Sans Mono",
      },
    ],
  },
];

const syncConfig = debounce(
  async (configUpdate: Partial<GhostpadConfig>, dispatch: Dispatch) => {
    const res = await saveGhostpadConfig(configUpdate);
    const updatedConfig = await res.json();
    dispatch(updateGhostpadConfig(updatedConfig));
    if (configUpdate.host) {
      dispatch(
        updateSocketState({ socketState: SocketState.READY_TO_CONNECT })
      );
    }
  },
  500
);

const Settings = () => {
  const { speechSynthesisSupported, voicesByLanguage } = useContext(SpeechSynthesisContext);
  const ghostpadConfig = useSelector((state: RootState) => {
    return state.config.ghostpadConfig;
  });
  const dispatch = useDispatch();

  const updateConfig = async (configUpdate: Partial<GhostpadConfig>) => {
    // There are two updates here that _should_ be redundant.
    // The local state is updated immediately for responsiveness, but the server response is the source of truth.
    // This becomes more important if we need to validate/sanitize the config on the server, since that might create differences.
    dispatch(updateGhostpadConfig({ ...ghostpadConfig, ...configUpdate }));
    await syncConfig(configUpdate, dispatch);
  };

  const handleHostChange = async (evt: ChangeEvent<HTMLInputElement>) => {
    await updateConfig({ host: evt.target.value });
  };

  const handleLocalFontChange = async (evt: ChangeEvent<HTMLInputElement>) => {
    await updateConfig({ editorLocalFont: evt.target.value });
  };

  const handleThemeChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    updateConfig({ theme: evt.target.value });
  };

  const handleGoogleFontChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    updateConfig({
      editorGoogleFont: {
        linkFamily: evt.target.value,
        cssFamily: evt.target.options[evt.target.selectedIndex]?.text || "",
      },
    });
  };

  const handleToggleGoogleFonts = (evt: ChangeEvent<HTMLInputElement>) => {
    updateConfig({ useGoogleFont: evt.target.checked });
  };

  const handleFontSizeChange = (evt: ChangeEvent<HTMLInputElement>) => {
    updateConfig({ editorFontSize: parseInt(evt.target.value) });
  };

  return (
    <div className="px-6 py-3">
      <h2 className="px-6 pb-3 font-bold text-center">Ghostpad Settings</h2>
      <div
        className="form-control w-full max-w-xs mb-2"
        title={`The hostname of the currently running KoboldAI server, specified in the format "host:port"`}
      >
        <label className="label pt-0 pl-0" htmlFor="settings-hostname">
          <span className="label-text">Hostname</span>
        </label>
        <input
          id="settings-hostname"
          className="input input-bordered input-md w-full bg-base-200"
          type="text"
          defaultValue={ghostpadConfig.host}
          onChange={handleHostChange}
        />
      </div>
      <div
        className="form-control w-full max-w-xs mb-2"
        title="Switch between different DaisyUI themes."
      >
        <label className="label pt-0 pl-0">
          <span className="label-text">Theme</span>
        </label>
        <select
          onChange={handleThemeChange}
          className="select select-bordered bg-base-200 w-full max-w-xs"
          value={ghostpadConfig.theme}
        >
          {availableThemes.map((themeName) => (
            <option key={themeName}>{themeName}</option>
          ))}
        </select>
      </div>
      <div className="form-control w-full max-w-xs mb-2">
        <div title="When enabled, you will be presented with a curated list of Google Fonts. When disabled, you will instead see a text input where you can enter a local font name.">
          <label className="label pt-0 pl-0">
            <span className="label-text">Enable Google Fonts</span>
          </label>
          <input
            type="checkbox"
            defaultChecked={ghostpadConfig.useGoogleFont}
            onChange={handleToggleGoogleFonts}
            className="toggle mb-2 ml-1"
          />
        </div>
        <label className="label pt-0 pl-0">
          <span className="label-text">Editor Font</span>
        </label>
        {ghostpadConfig.useGoogleFont && (
          <select
            title="Select a font from a curated list of Google Fonts."
            onChange={handleGoogleFontChange}
            value={ghostpadConfig.editorGoogleFont.linkFamily}
            className="select select-bordered bg-base-200 w-full max-w-xs"
          >
            {availableGoogleFonts.map((category) => (
              <Fragment key={category.name}>
                <option className="font-bold italic" disabled>
                  {category.name}
                </option>
                {category.items.map((font) => (
                  <option key={font.linkFamily} value={font.linkFamily}>
                    {font.cssFamily}
                  </option>
                ))}
              </Fragment>
            ))}
          </select>
        )}
        {!ghostpadConfig.useGoogleFont && (
          <input
            title="Enter the name of a font installed on your system."
            type="text"
            className="input input-bordered input-md w-full bg-base-200"
            defaultValue={ghostpadConfig.editorLocalFont}
            onChange={handleLocalFontChange}
          />
        )}
      </div>
      <div
        className="form-control w-full max-w-xs mb-2"
        title="The size of the text in the story editor, defined in px."
      >
        <label className="label pt-0 pl-0" htmlFor="settings-fontsize">
          <span className="label-text">Editor Font Size</span>
        </label>
        <input
          id="settings-fontsize"
          type="number"
          min={1}
          max={99}
          step={1}
          defaultValue={ghostpadConfig.editorFontSize}
          className="input input-bordered bg-base-200"
          onChange={handleFontSizeChange}
        />
      </div>
      <div className="form-control w-full mb-2">
        <label className="label pt-0 pl-0">
          <span className="label-text">Font Preview</span>
        </label>
        <p className="border border-neutral rounded p-4 bg-base-200">
          <span className="font-preview">
            The quick brown fox jumps over the lazy dog.
          </span>
        </p>
      </div>

      {speechSynthesisSupported && (
        <>
          <label className="label pt-0 pl-0">
            <span className="label-text">Speech Synthesis Language</span>
          </label>
          <select
            className="select select-bordered bg-base-200 w-full max-w-xs"
            value={ghostpadConfig.speechSynthesisLanguage || ""}
            onChange={(evt) =>
              updateConfig({ speechSynthesisLanguage: evt.target.value })
            }
          >
            <option value="">None</option>
            {Object.entries(voicesByLanguage)
              .sort()
              .map(([lang]) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
          </select>

          {ghostpadConfig.speechSynthesisLanguage && (
            <>
              <label className="label pt-0 pl-0">
                <span className="label-text">Speech Synthesis Voice</span>
              </label>
              <select
                className="select select-bordered bg-base-200 w-full max-w-xs"
                value={ghostpadConfig.speechSynthesisVoice || ""}
                onChange={(evt) =>
                  updateConfig({ speechSynthesisVoice: evt.target.value })
                }
              >
                <option value="">None</option>
                {voicesByLanguage[ghostpadConfig.speechSynthesisLanguage]?.map(
                  (voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {!voice.localService && "[Non-Local] "}{voice.name}
                    </option>
                  )
                )}
              </select>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Settings;
