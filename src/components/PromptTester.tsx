import React, { useMemo, useState } from 'react';
import { Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { processPrompt } from '../store/promptSlice';
import { useAppDispatch, useAppSelector } from '../store';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'he', name: 'Hebrew' },
];

function PromptTester() {
  const { user_request, isLoading, error } = useAppSelector((state) => state.prompt);
  const dispatch = useAppDispatch();
  // Local state to hold temporary values
  const [tempRequest, setTempRequest] = useState(user_request);
  const [responseBody, setResponseBody] = useState(''); // State to hold response body

  const requestPayload = useMemo(() => ({
    scene: tempRequest.scene,
    currentMessage: tempRequest.currentMessage,
    maxSentences: tempRequest.maxSentences,
    minSentences: tempRequest.minSentences, // Add minSentences to the payload
    maxWordsInSentence: tempRequest.maxWordsInSentence,
    maxTotalResponseChars: tempRequest.maxTotalResponseChars,
    inputLanguage: tempRequest.inputLanguage,
    outputLanguages: tempRequest.outputLanguages,
    role: tempRequest.role,
    url: tempRequest.url,
    expected_response_format_to_feed_json_parse: tempRequest.expected_response_format_to_feed_json_parse,
    special_notes: tempRequest.special_notes,
  }), [tempRequest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(processPrompt(tempRequest))
      .then(response => {
        // Assuming response contains the body you want to display
        setResponseBody(JSON.stringify(response.payload, null, 2)); // Set the response body
      })
      .catch(err => {
        console.error(err);
      });
  };

  const parseResponseBody = () => {
    try {
      const parsed = JSON.parse(responseBody);
      return JSON.stringify(parsed, null, 2); // Format the parsed JSON
    } catch (error) {
      return "Invalid JSON"; // Return error message if parsing fails
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            AI Language Learning Assistant
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <textarea
              value={tempRequest.role}
              onChange={(e) => setTempRequest({ ...tempRequest, role: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Scene Description</label>
            <textarea
              value={tempRequest.scene}
              onChange={(e) => setTempRequest({ ...tempRequest, scene: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Message</label>
            <textarea
              value={tempRequest.currentMessage}
              onChange={(e) => setTempRequest({ ...tempRequest, currentMessage: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Sentences</label>
              <input
                type="number"
                value={tempRequest.maxSentences}
                onChange={(e) => setTempRequest({ ...tempRequest, maxSentences: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Sentences</label>
              <input
                type="number"
                value={tempRequest.minSentences}
                onChange={(e) => setTempRequest({ ...tempRequest, minSentences: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Words per Sentence</label>
              <input
                type="number"
                value={tempRequest.maxWordsInSentence}
                onChange={(e) => setTempRequest({ ...tempRequest, maxWordsInSentence: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Input Language</label>
              <select
                value={tempRequest.inputLanguage}
                onChange={(e) => setTempRequest({ ...tempRequest, inputLanguage: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Output Languages</label>
              <select
                multiple
                value={tempRequest.outputLanguages}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map(option => option.value);
                  setTempRequest({ ...tempRequest, outputLanguages: selected });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">API URL</label>
            <input
              type="url"
              value={tempRequest.url}
              onChange={(e) => setTempRequest({ ...tempRequest, url: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Expected Response Format</label>
            <textarea
              value={tempRequest.expected_response_format_to_feed_json_parse}
              onChange={(e) => setTempRequest({ ...tempRequest, expected_response_format_to_feed_json_parse: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Special Notes</label>
            <textarea
              value={tempRequest.special_notes}
              onChange={(e) => setTempRequest({ ...tempRequest, special_notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Response Body</label>
            <textarea
              value={responseBody}
              onChange={(e) => setResponseBody(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Parsed Response</label>
            <pre className="mt-1 p-4 bg-gray-50 rounded-md overflow-auto text-sm">
              {parseResponseBody()}
            </pre>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Request Preview</label>
            <pre className="mt-1 p-4 bg-gray-50 rounded-md overflow-auto text-sm">
              {JSON.stringify(requestPayload, null, 2)}
            </pre>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Processing...
              </>
            ) : (
              'Send Request'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default PromptTester;
