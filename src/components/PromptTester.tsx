import React, { useState } from 'react';
import { Loader2, AlertCircle, Send } from 'lucide-react';
import { AppState, processPrompt, updateRequest, UserRequest } from '../store/promptSlice';
import { useAppDispatch, useAppSelector } from '../store';
// import type { UserRequest, AppState } from '../store/types';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'he', name: 'Hebrew' },
] as const;

function PromptTester() {
  const dispatch = useAppDispatch();
  // Explicitly type the state selector
  const promptState = useAppSelector((state) => state.prompt as AppState);
  const [selectedOutputLanguages, setSelectedOutputLanguages] = useState<string[]>(
    promptState?.user_request?.outputLanguages || []
  );

  // Early return if state isn't ready
  if (!promptState) {
    return <div>Loading...</div>;
  }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
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
      await dispatch(processPrompt(updatedRequest)).unwrap();
    } catch (error) {
      console.error('Failed to process prompt:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Input */}
        <div className="space-y-2">
          <label htmlFor="role" className="block text-sm font-medium">
            Role
          </label>
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
          <label htmlFor="scene" className="block text-sm font-medium">
            Scene
          </label>
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
          <label htmlFor="currentMessage" className="block text-sm font-medium">
            Current Message
          </label>
          <textarea
            id="currentMessage"
            name="currentMessage"
            value={user_request.currentMessage}
            onChange={handleInputChange}
            className="w-full min-h-[100px] p-2 border rounded-md"
          />
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Output Languages
          </label>
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
            <label htmlFor="maxSentences" className="block text-sm font-medium">
              Max Sentences
            </label>
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
            <label htmlFor="minSentences" className="block text-sm font-medium">
              Min Sentences
            </label>
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
            <label htmlFor="maxWordsInSentence" className="block text-sm font-medium">
              Max Words per Sentence
            </label>
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
            <label htmlFor="maxTotalResponseChars" className="block text-sm font-medium">
              Max Total Characters
            </label>
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
