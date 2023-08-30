import { SyncInput } from "@/components/Forms/SyncInput";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { WPPAttributes, WorldInfoEntry } from "@/types/WorldInfo";
import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { BiKey } from "react-icons/bi";
type AttributePair = [key: string, value: string[]];

export const WPPEditor = ({
  timestamp,
  value,
  worldInfoEntry,
}: {
  timestamp: number;
  value: WPPAttributes;
  worldInfoEntry: WorldInfoEntry;
}) => {
  const [syncedValue, setSyncedValue] = useState<AttributePair[]>([]);
  const [localValue, setLocalValue] = useState<AttributePair[]>([]);
  const [localTimestamp, setLocalTimestamp] = useState<number>(0);
  const displayedValue =
    timestamp > localTimestamp + 500 ? syncedValue : localValue;
  const attributeKeys = useMemo(() => Object.keys(value), [value]);
  const socketApi = useContext(SocketApiContext);
  useEffect(() => {
    const newSyncedValue = attributeKeys.map<AttributePair>((key) => [
      key,
      value[key],
    ]);
    setSyncedValue(newSyncedValue);
    setLocalValue(newSyncedValue);
  }, [attributeKeys, value]);

  const onKeyChange =
    (key: string, idx: number) => (evt: ChangeEvent<HTMLInputElement>) => {
      const evtKey = evt.target.value;

      const valueEntries = Object.entries(value);
      const newAttributes = Object.fromEntries(
        idx < syncedValue.length
          ? valueEntries.map(([thisKey, thisVal], entryIdx) => [
              entryIdx === idx ? evtKey : thisKey,
              thisVal,
            ])
          : [...valueEntries, [evtKey, []]]
      );

      const newLocalValue = localValue.map<AttributePair>(
        ([thisKey, thisVal]) => [thisKey === key ? evtKey : thisKey, thisVal]
      );

      setLocalValue(newLocalValue);
      setLocalTimestamp(Date.now());
      if (value[evtKey]) return;
      socketApi?.editWorldInfoEntry({
        ...worldInfoEntry,
        wpp: {
          ...worldInfoEntry.wpp,
          attributes: newAttributes,
        },
      });
    };

  const onValChange =
    (key: string, idx: number) => (evt: ChangeEvent<HTMLInputElement>) => {
      const evtVal = evt.target.value;

      const attribute = worldInfoEntry.wpp.attributes[key];
      const newVal =
        idx <= attribute.length - 1
          ? attribute.map((v, i) => (i === idx ? evtVal : v))
          : [...attribute, evtVal];

      const newAttributes = Object.fromEntries(
        Object.entries(value).map<AttributePair>(([thisKey, thisVal]) => [
          thisKey,
          thisKey === key ? newVal : thisVal,
        ])
      );

      const newLocalValue = localValue.map<AttributePair>(
        ([thisKey, thisVal]) => [thisKey, thisKey === key ? newVal : thisVal]
      );

      setLocalValue(newLocalValue);
      setLocalTimestamp(Date.now());
      socketApi?.editWorldInfoEntry({
        ...worldInfoEntry,
        wpp: {
          ...worldInfoEntry.wpp,
          attributes: newAttributes,
        },
      });
    };

  // Delete empty field on blur
  const onBlur = () => {
    const newVal = localValue
      .filter(([key]) => key.length)
      .map<AttributePair>(([key, val]) => [key, val.filter((v) => v.length)]);
    setLocalValue(newVal);
    setLocalTimestamp(Date.now());
    if (JSON.stringify(newVal) !== JSON.stringify(localValue)) {
      socketApi?.editWorldInfoEntry({
        ...worldInfoEntry,
        wpp: {
          ...worldInfoEntry.wpp,
          attributes: Object.fromEntries(newVal),
        },
      });
    }
  };

  return (
    <>
      {[...displayedValue, ["", []] as AttributePair].map(
        ([key, val], pairIdx) => {
          return (
            <div key={pairIdx}>
              <div className="flex my-4">
                <BiKey size="1.5em" className="self-center mr-2" />
                <SyncInput
                  placeholder="New Key"
                  className="flex-grow font-bold"
                  timestamp={timestamp}
                  value={key}
                  onBlur={onBlur}
                  onChange={onKeyChange(key, pairIdx)}
                />
              </div>
              <div className="space-y-2">
                {(pairIdx < displayedValue.length ? [...val, ""] : val).map(
                  (v, valIdx) => (
                    <SyncInput
                      className="my-2 ml-8"
                      placeholder="New Value"
                      timestamp={timestamp}
                      value={v}
                      key={valIdx}
                      onBlur={onBlur}
                      onChange={onValChange(key, valIdx)}
                    />
                  )
                )}
              </div>
            </div>
          );
        }
      )}
    </>
  );
};
