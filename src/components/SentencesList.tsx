import React, { useState } from 'react';

// Types
interface Sentence {
  id: string;
  lang_code: string;
  text: string;
}

interface SentencesListProps {
  sentences: Sentence[];
  onSentencePlay?: (sentence: Sentence) => void;
}

const SentencesList = ({ sentences, onSentencePlay }: SentencesListProps) => {
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);

  const handlePlaySentence = (sentence: Sentence) => {
    setActiveSentenceId(sentence.id);

    // Use built-in speech synthesis
    const utterance = new SpeechSynthesisUtterance(sentence.text);
    utterance.lang = sentence.lang_code;

    utterance.onend = () => {
      setActiveSentenceId(null);
    };

    if (onSentencePlay) {
      onSentencePlay(sentence);
    }

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayAllSentences = () => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterances for all sentences
    sentences.forEach((sentence, index) => {
      const utterance = new SpeechSynthesisUtterance(sentence.text);
      utterance.lang = sentence.lang_code;

      // Set delay to ensure sentences play in order
      utterance.onstart = () => {
        setActiveSentenceId(sentence.id);
      };

      utterance.onend = () => {
        if (index === sentences.length - 1) {
          setActiveSentenceId(null);
        }
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handlePlayAllSentences}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors"
      >
        Play All Sentences
      </button>

      <div className="flex flex-col space-y-2">
        {sentences.map((sentence) => (
          <div
            key={sentence.id}
            className={`p-4 rounded ${activeSentenceId === sentence.id ? 'bg-blue-100' : 'bg-gray-100'
              } flex justify-between items-center transition-colors`}
          >
            <span className="flex-1">{sentence.text}</span>
            <button
              onClick={() => handlePlaySentence(sentence)}
              className={`ml-4 ${activeSentenceId === sentence.id
                  ? 'bg-green-600'
                  : 'bg-green-500 hover:bg-green-600'
                } text-white p-2 rounded transition-colors`}
              disabled={activeSentenceId !== null}
            >
              {activeSentenceId === sentence.id ? 'Playing...' : 'Play'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentencesList;
