// src/App.tsx
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import sentencesReducer from './store/sentencesSlice';
import SentencesList from './components/SentencesList';

const store = configureStore({
  reducer: {
    sentences: sentencesReducer,
  },
});

const initialSentences = [
  { lang_code: 'en', text: 'Hello, how are you?' },
  { lang_code: 'es', text: 'Hola, ¿cómo estás?' },
  { lang_code: 'fr', text: 'Bonjour, comment ça va?' },
];

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="p-8">
        <SentencesList sentences={initialSentences} /> {/* Pass sentences prop */}
      </div>
    </Provider>
  );
};

export default App;
