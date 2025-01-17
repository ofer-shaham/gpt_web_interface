import React, { useState } from 'react';

interface Sentence {
  id: string;
  lang_code: string;
  text: string;
}

interface SentencesListProps {
  sentences?: Array<Omit<Sentence, 'id'>>;
  onSentencePlay?: (sentence: Sentence) => void;
}

interface WordSpan {
  word: string;
  start: number;
  end: number;
}

const SentencesList = ({
  sentences = [],
  onSentencePlay
}: SentencesListProps) => {
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [wordSpans, setWordSpans] = useState<WordSpan[]>([]);

  // Add IDs to sentences if they don't have them
  const processedSentences: Sentence[] = sentences.map((sentence, index) => ({
    ...sentence,
    id: `sentence-${index + 1}`
  }));

  if (!processedSentences || processedSentences.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No sentences available
      </div>
    );
  }

  const splitIntoWords = (text: string): WordSpan[] => {
    const words = text.split(' ');
    let position = 0;
    return words.map(word => {
      const start = position;
      position += word.length + 1; // +1 for the space
      return {
        word,
        start,
        end: position - 1
      };
    });
  };

  const handlePlaySentence = (sentence: Sentence) => {
    setActiveSentenceId(sentence.id);
    setCurrentWordIndex(-1);

    const words = splitIntoWords(sentence.text);
    setWordSpans(words);

    const utterance = new SpeechSynthesisUtterance(sentence.text);
    utterance.lang = sentence.lang_code;

    utterance.onboundary = (event) => {
      const charIndex = event.charIndex;
      const wordIndex = words.findIndex(
        span => charIndex >= span.start && charIndex <= span.end
      );
      setCurrentWordIndex(wordIndex);
    };

    utterance.onend = () => {
      setActiveSentenceId(null);
      setCurrentWordIndex(-1);
      setWordSpans([]);
    };

    if (onSentencePlay) {
      onSentencePlay(sentence);
    }

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayAllSentences = () => {
    window.speechSynthesis.cancel();

    processedSentences.forEach((sentence, index) => {
      const utterance = new SpeechSynthesisUtterance(sentence.text);
      utterance.lang = sentence.lang_code;

      const words = splitIntoWords(sentence.text);

      utterance.onstart = () => {
        setActiveSentenceId(sentence.id);
        setWordSpans(words);
        setCurrentWordIndex(-1);
      };

      utterance.onboundary = (event) => {
        const charIndex = event.charIndex;
        const wordIndex = words.findIndex(
          span => charIndex >= span.start && charIndex <= span.end
        );
        setCurrentWordIndex(wordIndex);
      };

      utterance.onend = () => {
        if (index === processedSentences.length - 1) {
          setActiveSentenceId(null);
          setCurrentWordIndex(-1);
          setWordSpans([]);
        }
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  const isRTL = (langCode: string) => {
    return ['ar', 'he', 'fa'].includes(langCode);
  };

  const renderSentence = (sentence: Sentence) => {
    if (sentence.id === activeSentenceId && wordSpans.length > 0) {
      return wordSpans.map((span, index) => (
        <span
          key={index}
          className={`${index === currentWordIndex ? 'bg-yellow-200' : ''
            } transition-colors duration-200`}
        >
          {span.word}
          {index < wordSpans.length - 1 ? ' ' : ''}
        </span>
      ));
    }
    return sentence.text;
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
        {processedSentences.map((sentence) => (
          <div
            key={sentence.id}
            className={`p-4 rounded ${activeSentenceId === sentence.id ? 'bg-blue-100' : 'bg-gray-100'
              } flex justify-between items-center transition-colors`}
            dir={isRTL(sentence.lang_code) ? 'rtl' : 'ltr'}
          >
            <span className="flex-1 text-lg">{renderSentence(sentence)}</span>
            <button
              onClick={() => handlePlaySentence(sentence)}
              className={`${isRTL(sentence.lang_code) ? 'mr-4' : 'ml-4'} ${activeSentenceId === sentence.id
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
