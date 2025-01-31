import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, AlertCircle, Send, MessageSquare, Code, Settings2 } from 'lucide-react';
import { AppState, processPrompt, updateRequest, UserRequest } from '../store/promptSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { LanguageOption, ResponseSentence } from '../types';
import { updateResponseSentences } from '../store/responseSlice';
import Select, { MultiValue } from 'react-select';
import CompiledRequestDisplay from './CompiledRequestDisplay';
import { useCompileRequestAndInstructions } from '../hooks/useCompileRequestAndInstructions';
import { translate } from '../utils/translate'; // Import the translation utility
import { speakText } from '../utils/speakIt'; // Import the speak utility

// Define expected response type
interface ExpectedResponse {
  result: ResponseSentence[] | string;
}

// Define the enabled fields type
type EnabledFields = {
  currentMessage: boolean;
  outputLanguages: boolean;
  role: boolean;
  scene: boolean;
  minTotalResponseChars: boolean;
  maxTotalResponseChars: boolean;
  minSentences: boolean;
  maxSentences: boolean;
  maxWordsInSentence: boolean;
  special_notes: boolean;
};

function PromptTester() {
  const dispatch = useAppDispatch();
  const promptState = useAppSelector((state) => state.prompt as AppState);
  const [selectedOutputLanguages, setSelectedOutputLanguages] = useState<LanguageOption[]>([]);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [voices, setVoices] = useState<LanguageOption[]>([]);
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  const [enabledFields, setEnabledFields] = useState<EnabledFields>({
    currentMessage: true,
    outputLanguages: false,
    role: true,
    scene: false,
    minTotalResponseChars: false,
    maxTotalResponseChars: false,
    minSentences: true,
    maxSentences: false,
    maxWordsInSentence: true,
    special_notes: false
  });
  const { userRequest, isLoading, error } = promptState;
  const { instructions } = useCompileRequestAndInstructions(
    userRequest,
    enabledFields,
    selectedOutputLanguages
  );
  const compiledRequest = { instructions };

  // Check URL for responses on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const responsesParam = urlParams.get('responses');

    if (responsesParam) {
      try {
        const parsedResponses: ResponseSentence[] = JSON.parse(responsesParam);
        dispatch(updateResponseSentences(parsedResponses)); // Update the state with parsed responses
      } catch (error) {
        console.error('Failed to parse responses from URL:', error);
      }
    }
  }, [dispatch]); // Run once on mount

  useEffect(() => {
    const fetchVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      const uniqueLanguages = Array.from(new Set(availableVoices.map(voice => voice.lang)))
        .map(lang => {
          const voice = availableVoices.find(v => v.lang === lang);
          return { value: lang, label: `${voice?.lang} (${voice?.name})` };
        });
      setVoices(uniqueLanguages);
    };

    fetchVoices();
    window.speechSynthesis.onvoiceschanged = fetchVoices;
  }, []);

  const handleLanguageChange = (selectedOptions: MultiValue<LanguageOption>) => {
    setSelectedOutputLanguages(selectedOptions as LanguageOption[]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    dispatch(updateRequest({ [name]: value } as Partial<UserRequest>));
  };

  const handleCheckboxChange = (fieldName: keyof EnabledFields) => {
    setEnabledFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const handleCharSliderChange = (min: number, max: number) => {
    dispatch(updateRequest({ maxTotalResponseChars: max, minTotalResponseChars: min }));
  };

  const handleRowSliderChange = (min: number, max: number) => {
    dispatch(updateRequest({ maxSentences: max, minSentences: min }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await dispatch(processPrompt({ role: userRequest.role, payload: instructions }));
      const typedResponse = response.payload as unknown as ExpectedResponse;

      let parsedResult: ResponseSentence[];
      if (typeof typedResponse.result === 'string') {
        try {
          parsedResult = JSON.parse(typedResponse.result);
        } catch (parseError) {
          console.error('Failed to parse result string:', parseError);
          return;
        }
      } else {
        parsedResult = typedResponse.result;
      }

      if (Array.isArray(parsedResult)) {
        const isValidResponse = parsedResult.every((sentence) =>
          typeof sentence.lang_code === 'string' &&
          typeof sentence.text === 'string'
        );

        if (isValidResponse) {
          console.info("Response is valid", { parsedResult });
          dispatch(updateResponseSentences(parsedResult));
          generateShareableUrl(parsedResult);
        } else {
          console.error('Not a valid response:', parsedResult);
        }
      }
    } catch (error) {
      console.error('Failed to process prompt:', error);
    }
  };

  const generateShareableUrl = (responses: ResponseSentence[]) => {
    const url = new URL(window.location.href);
    url.searchParams.set('responses', JSON.stringify(responses)); // Ensure responses are stringified
    setShareableUrl(url.toString());
  };

  const copyToClipboard = () => {
    if (shareableUrl) {
      navigator.clipboard.writeText(shareableUrl)
        .then(() => alert('Shareable URL copied to clipboard!'))
        .catch(err => console.error('Failed to copy: ', err));
    }
  };

  const requestPayload = useMemo(() => {
    return Object.entries(enabledFields).reduce((acc, [key, enabled]) => {
      if (enabled) {
        if (key === 'outputLanguages') {
          acc[key] = selectedOutputLanguages.map(option => option.value);
        } else {
          acc[key] = userRequest[key as keyof UserRequest];
        }
      }
      return acc;
    }, {} as Partial<UserRequest>);
  }, [userRequest, selectedOutputLanguages, enabledFields]);

  const handleWordClick = async (word: string) => {
    const translatedText = await translate(word, 'en', 'es'); // Example: translating from English to Spanish
    speakText(translatedText, 'es'); // Speak the translated text
    alert(`Translated: ${translatedText}`); // Display translation as an alert (can be replaced with a tooltip)
  };

  const renderSentenceWithClickableWords = (sentence: string) => {
    return sentence.split(' ').map((word, index) => (
      <span key={index} onClick={() => handleWordClick(word)} className="cursor-pointer hover:underline">
        {word}
      </span>
    ));
  };

  const renderField = (fieldName: keyof EnabledFields, label: string, component: React.ReactNode) => {
    if (!isDeveloperMode && !enabledFields[fieldName]) {
      return null;
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`${fieldName}-checkbox`}
            checked={enabledFields[fieldName]}
            onChange={() => handleCheckboxChange(fieldName)}
            className="w-4 h-4 text-blue-600"
          />
          <label htmlFor={fieldName} className="block text-sm font-medium">
            {label}
          </label>
        </div>
        <div className={!enabledFields[fieldName] ? "opacity-50" : ""}>
          {component}
        </div>
      </div>
    );
  };

  const renderControls = () => {
    const baseControls = (
      <>
        {renderField(
          'currentMessage',
          'Your Message',
          <textarea
            id="currentMessage"
            name="currentMessage"
            value={userRequest.currentMessage}
            onChange={handleInputChange}
            className="w-full min-h-[100px] p-2 border rounded-md"
            placeholder="Enter your message here..."
            disabled={!enabledFields.currentMessage}
          />
        )}

        {renderField(
          'outputLanguages',
          'Select Languages',
          <Select
            isMulti
            options={voices}
            value={selectedOutputLanguages}
            onChange={handleLanguageChange}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select languages..."
            isDisabled={!enabledFields.outputLanguages}
          />
        )}
      </>
    );

    const advancedControls = (
      <div className="grid grid-cols-2 gap-4">
        {renderField(
          'role',
          'Role',
          <textarea
            id="role"
            name="role"
            value={userRequest.role}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            disabled={!enabledFields.role}
          />
        )}

        {renderField(
          'scene',
          'Scene',
          <textarea
            id="scene"
            name="scene"
            value={userRequest.scene}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            disabled={!enabledFields.scene}
          />
        )}

        <div className="col-span-2">
          {renderField(
            'minTotalResponseChars',
            'Minimum Total Characters',
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1000"
                value={userRequest.minTotalResponseChars || 0}
                onChange={(e) => handleCharSliderChange(Number(e.target.value), userRequest.maxTotalResponseChars)}
                className="w-full"
                disabled={!enabledFields.minTotalResponseChars}
              />
              <span>{userRequest.minTotalResponseChars || 0}</span>
            </div>
          )}

          {renderField(
            'maxTotalResponseChars',
            'Maximum Total Characters',
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1000"
                value={userRequest.maxTotalResponseChars}
                onChange={(e) => handleCharSliderChange(userRequest.minTotalResponseChars || 0, Number(e.target.value))}
                className="w-full"
                disabled={!enabledFields.maxTotalResponseChars}
              />
              <span>{userRequest.maxTotalResponseChars}</span>
            </div>
          )}
        </div>

        <div className="col-span-2">
          {renderField(
            'minSentences',
            'Minimum Sentences',
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="20"
                value={userRequest.minSentences}
                onChange={(e) => handleRowSliderChange(Number(e.target.value), userRequest.maxSentences)}
                className="w-full"
                disabled={!enabledFields.minSentences}
              />
              <span>{userRequest.minSentences}</span>
            </div>
          )}

          {renderField(
            'maxSentences',
            'Maximum Sentences',
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="20"
                value={userRequest.maxSentences}
                onChange={(e) => handleRowSliderChange(userRequest.minSentences || 0, Number(e.target.value))}
                className="w-full"
                disabled={!enabledFields.maxSentences}
              />
              <span>{userRequest.maxSentences}</span>
            </div>
          )}
        </div>

        {renderField(
          'maxWordsInSentence',
          'Max Words per Sentence',
          <div className="flex items-center gap-2">
            <input
              type="number"
              id="maxWordsInSentence"
              name="maxWordsInSentence"
              value={userRequest.maxWordsInSentence}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              disabled={!enabledFields.maxWordsInSentence}
            />
          </div>
        )}

        {renderField(
          'special_notes',
          'Special Notes',
          <textarea
            id="special_notes"
            name="special_notes"
            value={userRequest.special_notes}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            disabled={!enabledFields.special_notes}
          />
        )}
      </div>
    );

    return (
      <div className="space-y-4">
        {baseControls}
        <CompiledRequestDisplay compiledRequest={compiledRequest} />
        {isDeveloperMode && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            {advancedControls}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Request Preview</label>
              <pre className="mt-1 p-4 bg-gray-50 rounded-md overflow-auto text-sm">
                {JSON.stringify(requestPayload, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!promptState) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          AI Language Learning Assistant
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDeveloperMode(!isDeveloperMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
          >
            {isDeveloperMode ? <Settings2 className="w-4 h-4" /> : <Code className="w-4 h-4" />}
            {isDeveloperMode ? 'Simple Mode' : 'Developer Mode'}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {renderControls()}

       

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit
            </>
          )}
        </button>

        {error && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </form>

 {shareableUrl && (
          <div className="flex justify-between">
            <button
              onClick={copyToClipboard}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors"
            >
              Share URL
            </button>
          </div>
        )}
      
    </div>
  );
}

export default PromptTester;
