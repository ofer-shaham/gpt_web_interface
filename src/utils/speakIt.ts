// src/utils/speakUtil.ts

export const speakText = (text: string, langCode: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  window.speechSynthesis.speak(utterance);
};
