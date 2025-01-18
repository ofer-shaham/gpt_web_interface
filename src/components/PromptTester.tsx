import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, AlertCircle, Send, MessageSquare, Code, Settings2 } from 'lucide-react';
import { AppState, processPrompt, updateRequest, UserRequest } from '../store/promptSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { expectedResponse } from '../store/types/response';
import { updateResponseSentences } from '../store/responseSlice';
import Select, { MultiValue, ActionMeta } from 'react-select';

// Define a type for language options
interface LanguageOption {
  value: string;
  label: string;
}

// Define a type for the response sentence structure
interface ResponseSentence {
  lang_code: string;
  text: string;
}

function PromptTester() {
  const dispatch = useAppDispatch();
  const promptState = useAppSelector((state) => state.prompt as AppState);
  const [selectedOutputLanguages, setSelectedOutputLanguages] = useState<LanguageOption[]>([]);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [voices, setVoices] = useState<LanguageOption[]>([]);
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);

  const { user_request, isLoading, error } = promptState;

  // Fetch available TTS voices
  useEffect(() => {
    const fetchVoices = () => {
      const availableVoices = speechSynthesis.getVoices();

      // Create a unique set of voices based on lang and name
      const uniqueLanguages = Array.from(new Set(availableVoices.map(voice => voice.lang)))
        .map(lang => {
          const voice = availableVoices.find(v => v.lang === lang);
          return { value: lang, label: voice?.lang + '    (' + voice?.name +')' }; // Use voice name or fallback to lang
        });

      setVoices(uniqueLanguages);
    };

    // Fetch voices on load and when the voices change
    fetchVoices();
    window.speechSynthesis.onvoiceschanged = fetchVoices;
  }, []);

  const handleLanguageChange = (selectedOptions: MultiValue<LanguageOption>, actionMeta: ActionMeta<LanguageOption>) => {
    setSelectedOutputLanguages(selectedOptions as LanguageOption[]); // Cast to LanguageOption[]
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    dispatch(updateRequest({ [name]: value }));
  };

  const handleCharSliderChange = (min: number, max: number) => {
    dispatch(updateRequest({ maxTotalResponseChars: max, minTotalResponseChars: min }));
  };

  const handleRowSliderChange = (min: number, max: number) => {
    dispatch(updateRequest({ maxSentences: max, minSentences: min }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedRequest: UserRequest = {
      ...user_request,
      outputLanguages: selectedOutputLanguages.map(option => option.value), // Extract values from selected options
    };

    try {
      const response = await dispatch(processPrompt(updatedRequest)).unwrap();
      const typedResponse = response as expectedResponse;

      let parsedResult: ResponseSentence[]; // Use the defined ResponseSentence type
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
          dispatch(updateResponseSentences(parsedResult));
          generateShareableUrl(parsedResult); // Generate shareable URL
        } else {
          console.error('Invalid sentence structure:', parsedResult);
        }
      }
    } catch (error) {
      console.error('Failed to process prompt:', error);
    }
  };

  const generateShareableUrl = (responses: ResponseSentence[]) => {
    const url = new URL(window.location.href);
    url.searchParams.set('responses', JSON.stringify(responses));
    setShareableUrl(url.toString());
  };

  const copyToClipboard = () => {
    if (shareableUrl) {
      navigator.clipboard.writeText(shareableUrl)
        .then(() => {
          alert('Shareable URL copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  const requestPayload = useMemo(() => ({
    scene: user_request.scene,
    currentMessage: user_request.currentMessage,
    maxSentences: user_request.maxSentences,
    minSentences: user_request.minSentences,
    maxWordsInSentence: user_request.maxWordsInSentence,
    maxTotalResponseChars: user_request.maxTotalResponseChars,
    minTotalResponseChars: user_request.minTotalResponseChars,
    inputLanguage: user_request.inputLanguage,
    outputLanguages: selectedOutputLanguages.map(option => option.value), // Extract values from selected options
    role: user_request.role,
    url: user_request.url,
    expected_response_format_to_feed_json_parse: user_request.expected_response_format_to_feed_json_parse,
    special_notes: user_request.special_notes,
  }), [user_request, selectedOutputLanguages]);

  if (!promptState) {
    return <div>Loading...</div>;
  }

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
        {/* Basic Inputs (Always Visible) */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="currentMessage" className="block text-sm font-medium">Your Message</label>
            <textarea
              id="currentMessage"
              name="currentMessage"
              value={user_request.currentMessage}
              onChange={handleInputChange}
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder="Enter your message here..."
            />
          </div>

          {/* Language Selection with Multi-Select */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select Languages</label>
            <Select
              isMulti
              options={voices}
              value={selectedOutputLanguages}
              onChange={handleLanguageChange}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Select languages..."
            />
          </div>
        </div>

        {/* Developer Mode Settings */}
        {isDeveloperMode && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-medium">Role</label>
                <textarea
                  id="role"
                  name="role"
                  value={user_request.role}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="scene" className="block text-sm font-medium">Scene</label>
                <textarea
                  id="scene"
                  name="scene"
                  value={user_request.scene}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* Character Count Slider */}
              <div className="space-y-2 col-span-2">
                <label className="block text-sm font-medium">Total Characters</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={user_request.minTotalResponseChars || 0} // Default to 0 if undefined
                    onChange={(e) => handleCharSliderChange(Number(e.target.value), user_request.maxTotalResponseChars)}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={user_request.maxTotalResponseChars}
                    onChange={(e) => handleCharSliderChange(user_request.minTotalResponseChars || 0, Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between">
                  <span>Min: {user_request.minTotalResponseChars || 0}</span>
                  <span>Max: {user_request.maxTotalResponseChars}</span>
                </div>
              </div>

              {/* Row Count Slider */}
              <div className="space-y-2 col-span-2">
                <label className="block text-sm font-medium">Total Rows</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={user_request.minSentences}
                    onChange={(e) => handleRowSliderChange(Number(e.target.value), user_request.maxSentences)}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={user_request.maxSentences}
                    onChange={(e) => handleRowSliderChange(user_request.minSentences || 0, Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between">
                  <span>Min: {user_request.minSentences}</span>
                  <span>Max: {user_request.maxSentences}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="maxWordsInSentence" className="block text-sm font-medium">Max Words per Sentence</label>
                <input
                  type="number"
                  id="maxWordsInSentence"
                  name="maxWordsInSentence"
                  value={user_request.maxWordsInSentence}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="special_notes" className="block text-sm font-medium">Special Notes</label>
                <textarea
                  id="special_notes"
                  name="special_notes"
                  value={user_request.special_notes}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Request Preview</label>
              <pre className="mt-1 p-4 bg-gray-50 rounded-md overflow-auto text-sm">
                {JSON.stringify(requestPayload, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Shareable URL Button */}
        {user_request.outputLanguages.length > 0 && (
          <div className="flex justify-between">
            <button
              onClick={copyToClipboard}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors"
            >
              Share URL
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Generate Response
            </>
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default PromptTester;
