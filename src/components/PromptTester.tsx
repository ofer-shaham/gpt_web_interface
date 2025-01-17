import React, { useState, useMemo } from 'react';
import { Loader2, AlertCircle, Send, MessageSquare } from 'lucide-react';
import { AppState, processPrompt, updateRequest, UserRequest } from '../store/promptSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { expectedResponse } from '../store/types/response';
import { updateResponseSentences } from '../store/responseSlice';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'he', name: 'Hebrew' },
] as const;



function PromptTester() {
  const dispatch = useAppDispatch();
  const promptState = useAppSelector((state) => state.prompt as AppState);
  const [selectedOutputLanguages, setSelectedOutputLanguages] = useState<string[]>(
    promptState?.user_request?.outputLanguages || []
  );
  const [responseBody, setResponseBody] = useState('');



  const { user_request, isLoading, error } = promptState;

  const handleLanguageToggle = (langCode: string) => {
    setSelectedOutputLanguages(prev => {
      const isSelected = prev.includes(langCode);
      if (isSelected) {
        return prev.filter(code => code !== langCode);
      } else {
        return [...prev, langCode];
      }
    });
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {


    const { name, value } = e.target;
    dispatch(updateRequest({ [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedRequest: UserRequest = {
      ...user_request,
      outputLanguages: selectedOutputLanguages
    };

    try {
      const response = await dispatch(processPrompt(updatedRequest)).unwrap();
      console.log({ response });

      // Type assertion to expectedResponse
      const typedResponse = response as expectedResponse;

      // Check if result is a string and parse it if necessary
      if (typeof typedResponse.result === 'string') {
        try {
          typedResponse.result = JSON.parse(typedResponse.result); // Convert string to object
        } catch (parseError) {
          console.error('Failed to parse result string:', parseError);
          setResponseBody('Invalid JSON string in response result.');
          return; // Exit the function if parsing fails
        }
      }

      // Validate that result is now an array
      if (Array.isArray(typedResponse.result)) {
        // Validate each sentence object
        const isValidResponse = typedResponse.result.every((sentence) =>
          typeof sentence.lang_code === 'string' &&
          typeof sentence.text === 'string'
        );

        if (isValidResponse) {
          // Dispatch action to update the responseSlice with new sentences
          dispatch(updateResponseSentences(typedResponse.result));

          // Set the response body for display
          setResponseBody(JSON.stringify(typedResponse.result, null, 2));
        } else {
          console.error('Invalid sentence structure:', typedResponse.result);
          setResponseBody('Invalid sentence structure in response:\n'+ JSON.stringify(typedResponse.result, null, 2));
        }
      } else {
        console.error('Invalid response structure:', typedResponse);
        setResponseBody('Invalid response structure.');
      }
    } catch (error) {
      console.error('Failed to process prompt:', error);
    }
  };



  const requestPayload = useMemo(() => ({
    scene: user_request.scene,
    currentMessage: user_request.currentMessage,
    maxSentences: user_request.maxSentences,
    minSentences: user_request.minSentences,
    maxWordsInSentence: user_request.maxWordsInSentence,
    maxTotalResponseChars: user_request.maxTotalResponseChars,
    inputLanguage: user_request.inputLanguage,
    outputLanguages: selectedOutputLanguages,
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
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          AI Language Learning Assistant
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Input */}
        <div className="space-y-2">
          <label htmlFor="role" className="block text-sm font-medium">Role</label>
          <textarea
            id="role"
            name="role"
            value={user_request.role}
            onChange={handleInputChange}
            className="w-full min-h-[100px] p-2 border rounded-md"
          />
        </div>

        {/* Scene Input */}
        <div className="space-y-2">
          <label htmlFor="scene" className="block text-sm font-medium">Scene</label>
          <textarea
            id="scene"
            name="scene"
            value={user_request.scene}
            onChange={handleInputChange}
            className="w-full min-h-[100px] p-2 border rounded-md"
          />
        </div>

        {/* Current Message Input */}
        <div className="space-y-2">
          <label htmlFor="currentMessage" className="block text-sm font-medium">Current Message</label>
          <textarea
            id="currentMessage"
            name="currentMessage"
            value={user_request.currentMessage}
            onChange={handleInputChange}
            className="w-full min-h-[100px] p-2 border rounded-md"
          />
        </div>

        {/* Input Language */}
        <div className="space-y-2">
          <label htmlFor="inputLanguage" className="block text-sm font-medium">Input Language</label>
          <select
            id="inputLanguage"
            name="inputLanguage"
            value={user_request.inputLanguage}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          >
            {LANGUAGES.map(({ code, name }) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        {/* Output Languages */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Output Languages</label>
          <div className="flex gap-2">
            {LANGUAGES.map(({ code, name }) => (
              <button
                key={code}
                type="button"
                onClick={() => handleLanguageToggle(code)}
                className={`px-4 py-2 rounded-md transition-colors ${selectedOutputLanguages.includes(code)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
                  }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="maxSentences" className="block text-sm font-medium">Max Sentences</label>
            <input
              type="number"
              id="maxSentences"
              name="maxSentences"
              value={user_request.maxSentences}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="minSentences" className="block text-sm font-medium">Min Sentences</label>
            <input
              type="number"
              id="minSentences"
              name="minSentences"
              value={user_request.minSentences}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
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
            <label htmlFor="maxTotalResponseChars" className="block text-sm font-medium">Max Total Characters</label>
            <input
              type="number"
              id="maxTotalResponseChars"
              name="maxTotalResponseChars"
              value={user_request.maxTotalResponseChars}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {/* API URL */}
        <div className="space-y-2">
          <label htmlFor="url" className="block text-sm font-medium">API URL</label>
          <input
            type="url"
            id="url"
            name="url"
            value={user_request.url}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Expected Response Format */}
        <div className="space-y-2">
          <label htmlFor="expected_response_format_to_feed_json_parse" className="block text-sm font-medium">Expected Response Format</label>
          <textarea
            id="expected_response_format_to_feed_json_parse"
            name="expected_response_format_to_feed_json_parse"
            value={user_request.expected_response_format_to_feed_json_parse}
            onChange={handleInputChange}
            className="w-full min-h-[100px] p-2 border rounded-md"
          />
        </div>

        {/* Special Notes */}
        <div className="space-y-2">
          <label htmlFor="special_notes" className="block text-sm font-medium">Special Notes</label>
          <textarea
            id="special_notes"
            name="special_notes"
            value={user_request.special_notes}
            onChange={handleInputChange}
            className="w-full min-h-[100px] p-2 border rounded-md"
          />
        </div>

        {/* Response Body */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Response Body</label>
          <textarea
            value={responseBody}
            onChange={(e) => setResponseBody(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>


        {/* Request Preview */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Request Preview</label>
          <pre className="mt-1 p-4 bg-gray-50 rounded-md overflow-auto text-sm">
            {JSON.stringify(requestPayload, null, 2)}
          </pre>
        </div>

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
              Send Request
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
