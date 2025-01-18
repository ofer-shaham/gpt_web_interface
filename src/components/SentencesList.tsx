import { useState } from 'react';
import { FaPlay, FaStop, FaPause, FaPlayCircle } from 'react-icons/fa'; // Import play, stop, and pause icons

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

const COLORS = [
  'text-blue-500', // Color 0
  'text-red-500',  // Color 1
  'text-green-500', // Color 2
  'text-purple-500', // Color 3
  'text-orange-500', // Color 4
  'text-teal-500',   // Color 5
  'text-yellow-500', // Color 6
  'text-pink-500'    // Color 7
];

const SentencesList = ({
  sentences = [],
  onSentencePlay
}: SentencesListProps) => {
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [wordSpans, setWordSpans] = useState<WordSpan[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false); // State to track pause/resume

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
      setIsPaused(false); // Reset pause state when speech ends
    };

    if (onSentencePlay) {
      onSentencePlay(sentence);
    }

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayAllSentences = () => {
    window.speechSynthesis.cancel(); // Stop any ongoing speech

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
          setIsPaused(false); // Reset pause state when all sentences finish
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
    setIsPaused(false); // Reset pause state
  };

  const handlePauseResume = () => {
    if (isPaused) {
      // Resume
      window.speechSynthesis.resume();
    } else {
      // Pause
      window.speechSynthesis.pause();
    }
    setIsPaused(!isPaused); // Toggle pause state
  };

  const isRTL = (langCode: string) => {
    return ['ar', 'he', 'fa'].includes(langCode);
  };

  const getColorByLang = (index: number) => {
    return COLORS[index % COLORS.length]; // Use modulo to cycle through colors
  };

  const renderSentence = (sentence: Sentence) => {
    if (sentence.id === activeSentenceId && wordSpans.length > 0) {
      return wordSpans.map((span, index) => (
        <span
          key={index}
          className={`${index === currentWordIndex ? 'bg-yellow-200' : ''
            } transition-colors duration-200 ${getColorByLang(sentences.findIndex(s => s.lang_code === sentence.lang_code))}`}
        >
          {span.word}
          {index < wordSpans.length - 1 ? ' ' : ''}
        </span>
      ));
    }
    return <span className={getColorByLang(sentences.findIndex(s => s.lang_code === sentence.lang_code))}>{sentence.text}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar for shared controls */}
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
              <FaPlay className="inline" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentencesList;
