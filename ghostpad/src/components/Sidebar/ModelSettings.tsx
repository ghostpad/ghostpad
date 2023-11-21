import { RootState } from "@/store/store";
import { Preset } from "@/types/KoboldConfig";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openModal } from "@/store/uiSlice";
import { BiX } from "react-icons/bi";
import { VarToggle } from "../Forms/VarToggle";
import { VarRange } from "../Forms/VarRange";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { VarInput } from "../Forms/VarInput";

const PresetOption = ({
  preset,
}: {
  preset: Preset;
}) => (
  <>
    <option>{preset.preset}</option>
    {preset.description && (
      <option disabled className="italic">
        {preset.description}
      </option>
    )}
  </>
);

const ModelSettings = () => {
  const { koboldConfig } = useSelector(
    (state: RootState) => state.config
  );
  const presets = koboldConfig.model?.presets;
  const selectedPreset = koboldConfig.model?.selected_preset;
  const socketApi = useContext(SocketApiContext);
  const dispatch = useDispatch();
  const sortedPresets = {
    Recommended: [
      ...(presets?.Recommended?.Official || []),
      ...(presets?.Recommended?.Custom || []),
    ],
    "Same Class": [
      ...(presets?.["Same Class"]?.Official || []),
      ...(presets?.["Same Class"]?.Custom || []),
    ],
    Other: [
      ...(presets?.Other?.Official || []),
      ...(presets?.Other?.Custom || []),
    ],
  };
  return (
    <div className="px-6 py-3">
      <h2 className="px-6 pb-3 font-bold text-center">Model Settings</h2>
      <div className="text-center mb-2">
        <label className="label">Preset</label>
        <select
          value={selectedPreset}
          onChange={(evt) => {
            socketApi?.varChange("model_selected_preset", evt.target.value);
          }}
          className="select select-bordered bg-base-200 w-full"
        >
          {sortedPresets.Recommended?.length > 0 && (
            <>
              <option className="font-bold" disabled>
                ‣ Recommended
              </option>
              {sortedPresets.Recommended?.map((preset) => (
                <PresetOption
                  key={preset.preset}
                  preset={preset}
                />
              ))}
            </>
          )}
          {sortedPresets["Same Class"]?.length > 0 && (
            <>
              <option className="font-bold" disabled>
                ‣ Same Class
              </option>
              {sortedPresets["Same Class"]?.map((preset) => (
                <PresetOption
                  key={preset.preset}
                  preset={preset}
                />
              ))}
            </>
          )}
          {sortedPresets.Other?.length > 0 && (
            <>
              <option className="font-bold" disabled>
                ‣ Other
              </option>
              {sortedPresets.Other?.map((preset) => (
                <PresetOption
                  key={preset.preset}
                  preset={preset}
                />
              ))}
            </>
          )}
        </select>
        <button
          className="btn btn-md btn-primary mt-4 mb-2 mx-2"
          onClick={() => {
            dispatch(openModal({ name: "savePreset" }));
          }}
        >
          Save Preset
        </button>
      </div>
      <div className="collapse collapse-arrow border border-neutral bg-base-200 rounded-box mt-4">
        <input type="checkbox" defaultChecked />
        <div className="collapse-title h-8 text-md">Generation</div>
        <div className="collapse-content flex flex-row flex-wrap justify-center gp-range-group">
          <VarRange
            label="Output Length"
            varName="model_genamt"
            min={16}
            max={512}
            step={1}
            title="Number of tokens to be generated. Higher values will take longer to generate."
          />
          <VarRange
            label="Temperature"
            varName="model_temp"
            min={0.1}
            max={2}
            step={0.01}
            title="Randomness of sampling. Higher values can increase creativity, but make the output less meaningful. Lower values will make the output more predictable, but it may become more repetitive."
          />
          <VarRange
            label="Context Tokens"
            varName="model_max_length"
            min={512}
            max={8192}
            step={1}
            title="Number of context tokens to submit to the AI for sampling. Make sure this is higher than Output Length. Higher values increase VRAM/RAM usage."
          />
          <VarRange
            label="Gens Per Action"
            varName="model_numseqs"
            min={1}
            max={5}
            step={1}
            title="Number of generated output choices. Increases VRAM/RAM usage."
          />
        </div>
      </div>
      <div className="collapse collapse-arrow border border-neutral bg-base-200 rounded-box mt-4">
        <input type="checkbox" defaultChecked />
        <div className="collapse-title h-8 text-md">Sampling</div>
        <div className="collapse-content flex flex-row flex-wrap justify-center gp-range-group">
          <VarRange
            label="Top P Sampling"
            varName="model_top_p"
            min={0}
            max={1}
            step={0.01}
            title="Used to discard unlikely text in the sampling process. Lower values will make the output more predictable, but also repetitive. (Put this value on 1 to disable its effect)"
          />
          <VarRange
            label="Top K Sampling"
            varName="model_top_k"
            min={0}
            max={100}
            step={1}
            title="Alternative sampling method. Can be combined with top_p."
          />
          <VarRange
            label="Tail Free Sampling"
            varName="model_tfs"
            min={0}
            max={1}
            step={0.01}
            title="Alternative sampling method. It is recommended to disable (set to 0) top_p and top_k if this setting is used. 0.95 is a suggested value for this setting. (Put this value on 1 to disable its effect)"
          />
          <VarRange
            label="Typical Sampling"
            varName="model_typical"
            min={0}
            max={1}
            step={0.01}
            title={`Alternative sampling method. Described in the paper "Typical Decoding for Natural Language Generation" (10.48550/ARXIV.2202.00666). The paper indicates 0.2 as a suggested value for this setting. (Put this value on 1 to disable its effect)`}
          />
          <VarRange
            label="Top A Sampling"
            varName="model_top_a"
            min={0}
            max={1}
            step={0.01}
            title="Alternative sampling method. Reduces the randomness of the AI whenever the probability of one token is much higher than all the others. Higher values have a stronger effect. (Put this value on 0 to disable its effect)"
          />
          <div className="min-w-1/2 p-2">
            <button
              onClick={() => {
                dispatch(openModal({ name: "samplerOrder" }));
              }}
              title="Changes the order of the samplers to have a considerably different effect than just leaving the samplers at their default order."
              className="btn btn-primary w-full"
            >
              Sampler Order
            </button>
          </div>
        </div>
      </div>
      <div className="collapse collapse-arrow border border-neutral bg-base-200 rounded-box mt-4">
        <input type="checkbox" defaultChecked />
        <div className="collapse-title h-8 text-md">Repetition</div>
        <div className="collapse-content flex flex-row flex-wrap justify-center gp-range-group">
          <VarRange
            label="Repetition Penalty"
            varName="model_rep_pen"
            min={1}
            max={3}
            step={0.01}
            title="Used to penalize words that were already generated or belong to the context."
          />
          <VarRange
            label="Rep Pen Range"
            varName="model_rep_pen_range"
            min={0}
            max={4096}
            step={1}
            title="Repetition penalty range. If set higher than 0, only applies repetition penalty to the last few tokens of the story rather than applying it to the entire story. The slider controls the amount of tokens at the end of your story to apply it to."
          />
          <VarRange
            label="Rep Pen Slope"
            varName="model_rep_pen_slope"
            min={0}
            max={10}
            step={0.1}
            title="Repetition penalty slope. If both this setting and Rep Penalty Range are set higher than 0, will use sigmoid interpolation to apply repetition penalty more strongly on tokens that are closer to the end of the story. Higher values will result in the repetition penalty difference between the start and end of your story being more apparent. (Setting this to 1 uses linear interpolation; setting this to 0 disables interpolation)"
          />
          <VarToggle
            label="Alt Rep Pen"
            varName="model_use_alt_rep_pen"
            title="Applies repetition penalty as a logarithmic modifier rather than a linear modifier."
          />
        </div>
      </div>
      <div className="collapse collapse-arrow border border-neutral bg-base-200 rounded-box mt-4">
        <input type="checkbox" defaultChecked />
        <div className="collapse-title h-8 text-md">Other</div>
        <div className="collapse-content flex flex-row flex-wrap justify-center gp-range-group">
          <VarToggle
            label="Contextual Prompt"
            title="Whether the prompt should be sent in the context of every action."
            varName="story_useprompt"
          />
          <VarToggle
            label="No Prompt Gen"
            title="If enabled, the AI does not generate a continuation of the entered prompt. Instead, you must perform an action first."
            varName="user_nopromptgen"
          />
          <VarToggle
            label="Prefilled Memory"
            title="If enabled, the Memory box in Random Story will be filled with the memory of the current story instead of being empty."
            varName="user_rngpersist"
          />
          <VarToggle
            label="Alt Text Gen"
            title="Inserts World Info entries behind text that first triggers them for better context with unlimited depth."
            varName="system_alt_gen"
          />
          <VarToggle
            label="Alt Multi Gen"
            title="Runs Gens per Action one at a time so you can select one if you like it without having to wait."
            varName="model_alt_multi_gen"
          />
          <VarToggle
            label="Full Determinism"
            varName="system_full_determinism"
            title="Causes generation to be fully deterministic. The model will always generate the same thing as long as your story, settings and RNG seed are the same. If disabled, only the sequence of outputs the model generates is deterministic."
          />
          <VarToggle
            label="Use Seed"
            title="If enabled, a specific seed will be used for the random generator on text generation"
            varName="system_seed_specified"
          />
          <VarToggle
            label="Token Streaming"
            title="Shows tokens as they are generated."
            varName="user_output_streaming"
          />
          <VarToggle
            label="Stop on EOS"
            title="Fix for EOS tokens followed by nonsense in some Yi models"
            varName="story_stop_on_eos"
          />
          {koboldConfig.system?.seed_specified && (
            <VarInput label="Seed" varName="system_seed" type="number" />
          )}
        </div>
      </div>
      <div className="collapse collapse-arrow border border-neutral bg-base-200 rounded-box mt-4">
        <input type="checkbox" defaultChecked />
        <div className="collapse-title h-8 text-md">Modifiers</div>
        <div className="collapse-content flex flex-row flex-wrap justify-center gp-range-group">
          <div className="min-w-1/2 p-2">
            <button
              title="Influence the likelihood for the AI to output certain phrases."
              onClick={() => {
                dispatch(openModal({ name: "biasing" }));
              }}
              className="btn btn-primary w-full"
            >
              Biasing
            </button>
          </div>
          <div className="min-w-1/2 p-2">
            <button
              title="Automatically replaces phrases that you or the AI insert."
              onClick={() => {
                dispatch(openModal({ name: "substitutions" }));
              }}
              className="btn btn-primary w-full"
            >
              Substitutions
            </button>
          </div>
          <div className="min-w-1/2 p-2">
            <button
              title="Allows to activate userscripts that modify the game's functionality."
              onClick={() => {
                socketApi?.loadUserscriptsList();
                dispatch(openModal({ name: "addUserscript" }));
              }}
              className="btn btn-primary w-full"
            >
              Add Userscript
            </button>
          </div>
          <VarToggle
            title="Disables the userscripts' ability to edit output."
            label="No Genmod"
            varName="user_nogenmod"
          />
          <ul className="w-full">
            {koboldConfig.system?.userscripts?.map((scriptFilename) => (
              <li
                key={scriptFilename}
                className="flex justify-between p-2 rounded bg-base-200"
              >
                <span className="self-center">{scriptFilename}</span>{" "}
                <button
                  className="btn btn-error"
                  onClick={() => {
                    socketApi?.removeUserscript(scriptFilename);
                  }}
                >
                  <BiX size="1.5em" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="collapse collapse-arrow border border-neutral bg-base-200 rounded-box mt-4">
        <input type="checkbox" defaultChecked />
        <div className="collapse-title h-8 text-md">Formatting</div>
        <div className="collapse-content flex flex-row flex-wrap justify-center gp-range-group">
          <VarToggle
            label="Trim Sentences"
            varName="user_frmttriminc"
            title="Deletes the text after the last sentence closure. If no closure is found, all tokens are returned."
          />
          <VarToggle
            label="No Blank Lines"
            varName="user_frmtrmblln"
            title="Replaces double newlines (\n\n) with single ones to avoid blank lines."
          />
          <VarToggle
            label="No Special Chars"
            varName="user_frmtrmspch"
            title="Removes special characters (@,#,%,^, etc)."
          />
          <VarToggle
            label="Auto Spacing"
            varName="user_frmtadsnsp"
            title="Adds spaces automatically if necessary."
          />
          <VarToggle
            label="Single Line"
            varName="user_singleline"
            title="Allows the AI to generate an output only before the enter."
          />
          <VarToggle
            label="No Double Spaces"
            varName="user_remove_double_space"
            title="Removes any double spaces in the output."
          />
        </div>
      </div>
    </div>
  );
};

export default ModelSettings;
