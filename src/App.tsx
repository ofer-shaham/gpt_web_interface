// src/App.tsx
import React from 'react';
import { Provider } from 'react-redux';
import PromptTester from './components/PromptTester';
import store, { useAppSelector } from './store';
import SentencesList from './components/SentencesList';

const App: React.FC = () => {
  // Use useSelector to access sentences from the Redux store
  const sentences = useAppSelector((state) => state.response.sentences);

  return (
    <Provider store={store}>
      <div className="p-8">
        <PromptTester />
        {sentences.length > 0 && <SentencesList sentences={sentences} />}
      </div>
    </Provider>
  );
};

export default App;
