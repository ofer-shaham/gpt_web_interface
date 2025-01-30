import { useState } from 'react';
import { FaPlay, FaStop, FaPause, FaPlayCircle } from 'react-icons/fa'; // Import play, stop, and pause icons
import { TranslatedSentence } from '../types/translated'; // Import the types

interface SentencesListProps {
  translations: Array<TranslatedSentence>;
  onSentencePlay?: (sentence: TranslatedSentence) => void;
}

interface WordSpan {
  word: string;
  start: number;
  end: number;
}

const COLORS = [
  'text-blue-500',
  'text-red-500',
  'text-green-500',
  'text-purple-500',
  'text-orange-500',
  'text-teal-500',
  'text-yellow-500',
  'text-pink-500'
];

const SentencesList = ({
  translations = [],
  onSentencePlay
}: SentencesListProps) => {
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [wordSpans, setWordSpans] = useState<WordSpan[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  if (!translations || translations.length === 0) {
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

  const handlePlaySentence = (sentence: TranslatedSentence) => {
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
      setIsPaused(false);
    };

    if (onSentencePlay) {
      onSentencePlay(sentence);
    }

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayAllSentences = () => {
    window.speechSynthesis.cancel();

    translations.forEach((sentence, index) => {
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
        if (index === translations.length - 1) {
          setActiveSentenceId(null);
          setCurrentWordIndex(-1);
          setWordSpans([]);
          setIsPaused(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setActiveSentenceId(null);
    setCurrentWordIndex(-1);
    setWordSpans([]);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
    } else {
      window.speechSynthesis.pause();
    }
    setIsPaused(!isPaused);
  };

  const isRTL = (langCode: string) => {
    return ['ar', 'he', 'fa'].includes(langCode);
  };

  const getColorByLang = (index: number) => {
    return COLORS[index % COLORS.length];
  };

  const renderSentence = (sentence: TranslatedSentence) => {
    if (sentence.id === activeSentenceId && wordSpans.length > 0) {
      return wordSpans.map((span, index) => (
        <span
          key={index}
          className={`${index === currentWordIndex ? 'bg-yellow-200' : ''
            } transition-colors duration-200 ${getColorByLang(translations.findIndex(s => s.lang_code === sentence.lang_code))}`}
        >
          {span.word}
          {index < wordSpans.length - 1 ? ' ' : ''}
        </span>
      ));
    }
    return <span className={getColorByLang(translations.findIndex(s => s.lang_code === sentence.lang_code))}>{sentence.text}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <button
            onClick={handleStop}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
          >
            <FaStop className="inline mr-1" />
          </button>
          <button
            onClick={handlePauseResume}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition-colors"
          >
            {isPaused ? <FaPlay className="inline mr-1" /> : <FaPause className="inline mr-1" />}
          </button>
        </div>
        <button
          onClick={handlePlayAllSentences}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors"
        >
          <FaPlayCircle className="inline mr-1" />
        </button>
      </div>

      <div className="flex flex-col space-y-2">
        {translations.map((sentence) => (
          <div
            key={sentence.id}
            className={`p-4 rounded ${activeSentenceId === sentence.id ? 'bg-blue-100' : 'bg-gray-100'
              } flex justify-between items-center transition-colors`}
            dir={isRTL(sentence.lang_code) ? 'rtl' : 'ltr'}
          >
            <span className="flex-1 text-lg">{renderSentence(sentence)}</span>
            <span className="flex-1 text-lg text-gray-600 italic ml-4">{sentence.translatedText}</span>
            <button
              onClick={() => handlePlaySentence(sentence)}
              className={`${isRTL(sentence.lang_code) ? 'mr-4' : 'ml-4'} ${activeSentenceId === sentence.id
                ? 'bg-green-600'
                : 'bg-green-500 hover:bg-green-600'
                } text-white p-2 rounded transition-colors`}
              disabled={activeSentenceId !== null}
            >
              <FaPlay className="inline" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentencesList;
