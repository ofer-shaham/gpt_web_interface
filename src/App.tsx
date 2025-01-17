// src/App.tsx
import React from 'react';
import { Provider } from 'react-redux';
import PromptTester from './components/PromptTester';
import store from './store';




const App: React.FC = () => {
  return (


    <Provider store={store}>
      <div className="p-8">
        <PromptTester />
        {/* <SentencesList sentences={initialSentences} />   */}
      </div>
    </Provider>
  );
};

export default App;
