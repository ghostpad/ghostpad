import { SaveStoryModal } from "./SaveStoryModal";
import { OverwriteModal } from "./OverwriteModal";
import { ConfirmDeleteStoryModal } from "./ConfirmDeleteStoryModal";
import { SavePresetModal } from "./SavePresetModal";
import { SamplerOrderModal } from "./SamplerOrderModal";
import { SelectOptionModal } from "./SelectOptionModal";
import { AddUserscriptModal } from "./AddUserscriptModal";
import { BiasingModal } from "./BiasingModal";
import { SubstitutionsModal } from "./SubstitutionsModal";
import { ConfirmResetEditorModal } from "./ConfirmResetEditorModal";
import { ConfirmDeleteEntryModal } from "./ConfirmDeleteEntryModal";
import { SaveToLibraryModal } from "./SaveToLibraryModal";
import { ConfirmOverwriteLibraryFileModal } from "./ConfirmOverwriteLibraryFileModal";
import { LoadFromLibraryModal} from "./LoadFromLibraryModal";
import { ConfirmDeleteLibraryItemModal } from "./ConfirmDeleteLibraryItemModal";

const Modals = () => (
  <>
    <BiasingModal />
    <SelectOptionModal />
    <SaveStoryModal />
    <OverwriteModal />
    <ConfirmDeleteStoryModal />
    <SavePresetModal />
    <SamplerOrderModal />
    <AddUserscriptModal />
    <SubstitutionsModal />
    <ConfirmDeleteEntryModal />
    <ConfirmResetEditorModal />
    <SaveToLibraryModal />
    <ConfirmOverwriteLibraryFileModal />
    <LoadFromLibraryModal />
    <ConfirmDeleteLibraryItemModal />
  </>
);

export default Modals;
