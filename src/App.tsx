// src/App.tsx
import React, { useState } from 'react';
import { Provider } from 'react-redux';
import PromptTester from './components/PromptTester';
import store, { useAppSelector } from './store';
import SentencesList from './components/SentencesList';
import { useTranslation } from './hooks/useTranslation';
import LanguageSelector from './components/LanguageSelector';
import { TranslatedSentence } from './types';

const App: React.FC = () => {
  const [langTo, setLangTo] = useState<string>('en'); // Default to English

  // Use useSelector to access sentences from the Redux store
  const sentences = useAppSelector((state) => state.response.sentences);
  const translations: TranslatedSentence[] = useTranslation(sentences, langTo);

  return (
    <Provider store={store}>
      <div className="p-8">
        <LanguageSelector langTo={langTo} setLangTo={setLangTo} />
        <PromptTester />
        {translations.length > 0 && <SentencesList translations={translations} />}
      </div>
    </Provider>
  );
};

export default App;
