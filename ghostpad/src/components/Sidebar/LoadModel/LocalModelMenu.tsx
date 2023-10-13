import { useContext, useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { BsArrowLeftSquareFill } from "react-icons/bs";
import { updateSelectedModel, updateSelectedSubsection } from "@/store/uiSlice";
import { cx } from "classix";
import { HomeSubsection } from "@/types/HomeSection";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { MenuItem } from "../MenuItem";

export const LocalModelMenu = () => {
  const socketApi = useContext(SocketApiContext);
  const dispatch = useDispatch();
  const { localModels, selectedModel } = useSelector(
    (state: RootState) => ({
      localModels: state.ui.sidebarState.localModels,
      selectedModel: state.ui.sidebarState.selectedModel,
    }),
    shallowEqual
  );
  useEffect(() => {
    socketApi?.selectModel({
      class: "model",
      id: "NeoCustom",
      ismenu: "true",
      label: "Load a model from its directory",
      menu: "mainmenu",
      name: "NeoCustom",
      path: "./models",
      size: "",
      isdirectory: "true",
      isdownloaded: "false",
    });
  }, [socketApi]);
  return (
    <>
      <h2 className="px-6 py-3 font-bold text-center">Load Local Model</h2>
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
      <div className="relative flex-grow overflow-y-auto min-h-[128px]">
        {!localModels?.length && (
          <div className="text-center mt-6">No models found.</div>
        )}
        {!!localModels?.length && (
          <ul className="menu menu-md flex-grow inset-0 flex-nowrap">
            {localModels?.map((model) => (
              <li
                onClick={() => {
                  if (selectedModel?.name === model.name) {
                    dispatch(updateSelectedModel(null));
                  } else {
                    dispatch(updateSelectedModel(model));
                    socketApi?.selectModel({
                      class: "model",
                      id: model.name,
                      ismenu: "false",
                      label: model.label,
                      menu: model.menu,
                      name: model.name,
                      path: model.path,
                      size: "",
                    });
                  }
                }}
                key={model.label}
              >
                <a
                  className={cx(
                    selectedModel?.label === model.label && "active"
                  )}
                >
                  {model.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default LocalModelMenu;
