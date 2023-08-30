import { useDispatch, useSelector } from "react-redux";
import { ReadOnlyLocalModel, ReadOnlyModel } from ".";
import { RootState } from "@/store/store";
import { useCallback, useContext, useEffect } from "react";
import {
  HuggingFaceModel,
  updateHfDefaultResults,
  updateHfSearchResults,
  updateSelectedModel,
  updateSelectedSubsection,
} from "@/store/uiSlice";
import { BsArrowLeftSquareFill } from "react-icons/bs";
import { debounce } from "@/util/debounce";
import { BiWorld } from "react-icons/bi";
import cx from "classix";
import { Model } from "@/types/Model";
import { HomeSubsection } from "@/types/HomeSection";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { MenuItem } from "../MenuItem";

export const HuggingFaceMenu = () => {
  const dispatch = useDispatch();

  const fetchModels = useCallback(async () => {
    const response = await fetch(
      "https://huggingface.co/api/models?filter=text-generation&limit=30&sort=downloads&config=true&direction=-1"
    );
    const models = await response.json();
    dispatch(updateHfDefaultResults(models));
  }, [dispatch]);

  const socketApi = useContext(SocketApiContext);

  const [hfDefaultResults, hfSearchResults, selectedModel] = useSelector(
    (state: RootState) => [
      state.ui.sidebarState.hfDefaultResults,
      state.ui.sidebarState.hfSearchResults,
      state.ui.sidebarState.selectedModel,
    ]
  ) as [HuggingFaceModel[], HuggingFaceModel[], Model | null];

  useEffect(() => {
    socketApi?.selectModel({
      ...ReadOnlyModel,
      id: "customhuggingface",
      label: "Load custom model from Hugging Face",
      name: "customhuggingface",
      plugin: undefined,
    });
    if (!hfDefaultResults?.length) {
      fetchModels();
    }
  }, [dispatch, fetchModels, hfDefaultResults?.length, socketApi]);
  const hfResults = hfSearchResults || hfDefaultResults;
  return (
    <>
      <h2 className="px-6 py-3 font-bold text-center">Hugging Face Models</h2>
      <ul className="menu menu-md p-0">
        <MenuItem
          onClick={() => {
            dispatch(updateSelectedSubsection(HomeSubsection.LoadModel));
            dispatch(updateSelectedModel(null));
          }}
        >
          <BsArrowLeftSquareFill className="inline" size="1.5em" />
          Back
        </MenuItem>
      </ul>
      <div className="flex flex-col px-6">
        <input
          type="text"
          className="input input-bordered input-md bg-base-200 my-2"
          placeholder="Search Hugging Face"
          onChange={debounce(async (e: React.ChangeEvent<HTMLInputElement>) => {
            const query = e.target.value;
            if (query.length) {
              const response = await fetch(
                `https://huggingface.co/api/models?filter=text-generation&sort=downloads&config=true&direction=-1&search=${query}`
              );
              const models = await response.json();

              dispatch(updateHfSearchResults(models));
            } else {
              dispatch(updateHfSearchResults(null));
            }
          }, 500)}
        />
      </div>
      <div className="relative flex-grow">
        <ul className="menu menu-md p-0 flex-grow absolute inset-0 flex-nowrap overflow-y-auto">
          {!!hfResults &&
            hfResults.map((model) => {
              return (
                <li key={model.id}>
                  <div
                    className={cx(
                      selectedModel?.label === model.modelId && "active",
                      "flex flex-row break-all px-6"
                    )}
                    onClick={(e) => {
                      const link = e.currentTarget.querySelector("a");
                      if (link?.contains(e.target as Node)) {
                        return;
                      }
                      if (selectedModel?.label === model.modelId) {
                        dispatch(updateSelectedModel(null));
                      } else {
                        dispatch(
                          updateSelectedModel({
                            ...ReadOnlyLocalModel,
                            label: model.modelId,
                            name: "customhuggingface",
                          })
                        );
                        socketApi?.resubmitModelInfo({
                          ...ReadOnlyModel,
                          custom_model_name: model.modelId,
                          id: "customhuggingface",
                          label: "Load custom model from Hugging Face",
                          name: "customhuggingface",
                          plugin: "Huggingface",
                          valid_backends: ["Huggingface", "Basic Huggingface"],
                        });
                      }
                    }}
                  >
                    <div className="flex-grow">
                      <div className="block">
                        <div>{model.modelId}</div>
                        <div className="m-2 ml-0">
                          <span className="text-gray-800 text-xs bg-gray-200 rounded-md px-2 py-1">
                            {model.config?.model_type || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <a
                      className="btn"
                      href={`https://huggingface.co/${model.modelId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <BiWorld size="1.5em" />
                    </a>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </>
  );
};

export default HuggingFaceMenu;
