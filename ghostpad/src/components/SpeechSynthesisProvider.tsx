import { createContext, PropsWithChildren, useEffect, useState } from "react";

type VoicesByLanguage = Record<string, SpeechSynthesisVoice[]>;
export const SpeechSynthesisContext = createContext<{
  voicesByLanguage: VoicesByLanguage;
  speechSynthesisSupported: boolean;
}>({
  voicesByLanguage: {},
  speechSynthesisSupported: false,
});

export const SpeechSynthesisProvider = ({ children }: PropsWithChildren) => {
  const [speechSynthesisSupported, setSpeechSynthesisSupported] =
    useState<boolean>(false);
  const [voicesByLanguage, setVoicesByLanguage] = useState<VoicesByLanguage>(
    {}
  );

  useEffect(() => {
    const speechSynthesisDefined =
      typeof window !== "undefined" && "speechSynthesis" in window;

    const voicesChangedHandler = () => {
      const speechSynthesisVoices = speechSynthesisDefined
        ? speechSynthesis.getVoices()
        : [];

      setVoicesByLanguage(
        speechSynthesisVoices.reduce((acc, voice) => {
          if (voice.lang in acc) {
            acc[voice.lang].push(voice);
          } else {
            acc[voice.lang] = [voice];
          }
          return acc;
        }, {} as Record<string, SpeechSynthesisVoice[]>)
      );
    };

    setSpeechSynthesisSupported(speechSynthesisDefined);

    if (speechSynthesisDefined) {
      speechSynthesis.addEventListener("voiceschanged", voicesChangedHandler);
    }
    return () => {
      if (speechSynthesisDefined) {
        speechSynthesis.removeEventListener(
          "voiceschanged",
          voicesChangedHandler
        );
      }
    };
  }, []);

  return (
    <SpeechSynthesisContext.Provider
      value={{ speechSynthesisSupported, voicesByLanguage }}
    >
      {children}
    </SpeechSynthesisContext.Provider>
  );
};
