import { RootState } from "@/store/store";
import { Fragment, useContext, useEffect, useState } from "react";
import { BsArrowLeftSquareFill } from "react-icons/bs";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import HuggingFaceMenu from "./HuggingFaceMenu";
import LocalModelMenu from "./LocalModelMenu";
import {
  updateSelectedModel,
} from "@/store/uiSlice";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { Model } from "@/types/Model";
import { LoadModelSubsection } from "@/types/LoadModelSubsection";
import { HomeSubsection } from "@/types/HomeSection";
import { LocalModel } from "@/types/MsgShowModelMenu";
import { cx } from "classix";
import { MenuItem } from "../MenuItem";
import { NavMenuItem } from "../NavMenuItem";

export const ReadOnlyLocalModel: LocalModel = {
  isMenu: false,
  isDirectory: false,
  isDownloaded: false,
  label: "Read-Only (No AI)",
  menu: "mainmenu",
  name: "ReadOnly",
  size: "",
};

export const ReadOnlyModel: Model = {
  class: "model",
  id: "ReadOnly",
  isdirectory: "false",
  isdownloaded: "false",
  ismenu: "false",
  label: "Read-Only (No AI)",
  menu: "mainmenu",
  name: "ReadOnly",
  plugin: "Read Only",
  size: "",
};

const MainLoadMenu = () => {
  const selectedModel = useSelector(
    (state: RootState) => state.ui.sidebarState.selectedModel
  );
  const dispatch = useDispatch();
  const socketApi = useContext(SocketApiContext);

  const handleSelectReadOnly = () => {
    if (selectedModel === ReadOnlyLocalModel) {
      dispatch(updateSelectedModel(null));
    } else {
      dispatch(updateSelectedModel(ReadOnlyLocalModel));
      socketApi?.selectModel(ReadOnlyModel);
    }
  };

  return (
    <>
      <h2 className="px-6 py-3 font-bold text-center">Load Model</h2>
      <ul className="menu menu-md p-0 flex-grow">
        <NavMenuItem subsection={null}>
          <BsArrowLeftSquareFill className="inline" size="1.5em" />
          Main Menu
        </NavMenuItem>
        <NavMenuItem subsection={LoadModelSubsection.Local}>
          Local Model
        </NavMenuItem>
        <NavMenuItem subsection={LoadModelSubsection.HuggingFace}>
          Hugging Face
        </NavMenuItem>
        <MenuItem
          onClick={handleSelectReadOnly}
          innerClassName={selectedModel?.name === "ReadOnly" ? "active" : ""}
        >
          Read-Only (No AI)
        </MenuItem>
      </ul>
    </>
  );
};

const LoadModel = () => {
  const { selectedModel, selectedModelBackends, selectedSubsection, aibusy } =
    useSelector(
      (state: RootState) => ({
        selectedModel: state.ui.sidebarState.selectedModel,
        selectedModelBackends: state.ui.sidebarState.selectedModelBackends,
        selectedSubsection: state.ui.sidebarState.selectedSubsection,
        aibusy: state.config.koboldConfig?.system?.aibusy || false,
      }),
      shallowEqual
    );
  const [selectedBackendIdx, setSelectedBackendIdx] =
    useState<number | null>(null);

  const [loadParameters, setLoadParameters] = useState<{
    [key: string]: number | string | boolean;
  }>({});

  const selectedBackend =
    selectedBackendIdx !== null
      ? selectedModelBackends?.[selectedBackendIdx]
      : null;

  const totalAssignedLayers = Object.entries(loadParameters).reduce(
    (acc, [key, val]) =>
      selectedBackend?.layerSliders.includes(key) ? acc + Number(val) : acc,
    0
  );
  const socketApi = useContext(SocketApiContext);
  useEffect(() => {
    if (selectedModelBackends?.length > 0) {
      setSelectedBackendIdx(0);
      setLoadParameters(
        selectedModelBackends[0].loadParameterControls.reduce(
          (acc, control) => ({
            ...acc,
            [control.id]: control.default,
          }),
          {}
        )
      );
    } else {
      setLoadParameters({});
      setSelectedBackendIdx(null);
    }
  }, [selectedModelBackends]);
  return (
    <div className="flex flex-col flex-grow overflow-y-auto">
      {selectedSubsection === HomeSubsection.LoadModel && <MainLoadMenu />}
      {selectedSubsection === LoadModelSubsection.Local && <LocalModelMenu />}
      {selectedSubsection === LoadModelSubsection.HuggingFace && (
        <HuggingFaceMenu />
      )}
      <div className="border-t border-neutral drop-shadow">
        {selectedBackend && selectedModel && (
          <div
            className={cx(
              !!selectedBackend.loadParameterControls.length && "mt-2 px-6 py-3"
            )}
          >
            {selectedModel &&
              selectedBackend.loadParameterControls.map((control, idx) => (
                <Fragment key={control.id}>
                  {control.uitype === "slider" && (
                    <div className="flex flex-col mb-2">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">{control.label}</span>
                        <span className="text-sm">
                          {loadParameters[control.id]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={control.max}
                        className="range range-primary"
                        onChange={(evt) => {
                          setLoadParameters({
                            ...loadParameters,
                            [control.id]: parseInt(evt.target.value),
                          });
                        }}
                        value={loadParameters[control.id] as number}
                      />
                    </div>
                  )}
                  {control.uitype === "toggle" && (
                    <div className="inline-flex flex-col w-1/2 mb-2">
                      <div className="flex mb-2">
                        <span className="text-sm">{control.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        className="toggle"
                        onChange={(evt) => {
                          setLoadParameters({
                            ...loadParameters,
                            [control.id]: evt.target.checked,
                          });
                        }}
                        checked={loadParameters[control.id] as boolean}
                      />
                    </div>
                  )}
                  {control.uitype === "dropdown" && (
                    <div className="flex flex-col mb-2">
                      <div className="flex mb-2">
                        <span className="text-sm">{control.label}</span>
                      </div>
                      <select
                        className="select select-bordered"
                        value={(loadParameters[control.id] as string) || ""}
                        onChange={(evt) => {
                          setLoadParameters({
                            ...loadParameters,
                            [control.id]: evt.target.value,
                          });
                        }}
                      >
                        {control.children?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.text}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </Fragment>
              ))}
          </div>
        )}

        <div className="text-right px-6 py-3">
          {selectedModel && selectedModelBackends?.length > 0 && (
            <select
              value={selectedBackendIdx || 0}
              disabled={selectedModelBackends?.length === 1}
              onChange={(evt) => {
                const newBackendIdx = parseInt(evt.target.value);
                setSelectedBackendIdx(newBackendIdx);

                setLoadParameters(
                  selectedModelBackends[
                    newBackendIdx
                  ].loadParameterControls.reduce(
                    (acc, device) => ({
                      ...acc,
                      [device.id]: device.default,
                    }),
                    {}
                  )
                );
              }}
              className="select select-md mr-2"
            >
              {selectedModelBackends?.map((backend, idx) => (
                <option value={idx} key={backend.name}>
                  {backend.name}
                </option>
              ))}
            </select>
          )}
          <button
            disabled={
              (selectedModelBackends.length && totalAssignedLayers !== selectedBackend?.totalLayers) ||
              aibusy ||
              !selectedModel
            }
            className="btn"
            onClick={() => {
              if (selectedModel) {
                const isHuggingFace =
                  selectedModel.name === "customhuggingface";
                socketApi?.loadModel({
                  ...ReadOnlyModel,
                  ...loadParameters,
                  id: selectedModel.name,
                  label: isHuggingFace
                    ? "Load custom model from Hugging Face"
                    : selectedModel.label,
                  menu: isHuggingFace ? "mainmenu" : "Custom",
                  name: selectedModel.name,
                  ...(isHuggingFace
                    ? { custom_model_name: selectedModel.label }
                    : { path: selectedModel.path }),
                  plugin: selectedBackend?.name,
                });
              }
            }}
          >
            Load{" "}
            {!!selectedBackend?.totalLayers &&
              `(${totalAssignedLayers}/${selectedBackend?.totalLayers})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadModel;
