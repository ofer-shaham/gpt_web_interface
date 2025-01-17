// src/App.tsx
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import sentencesReducer from './store/sentencesSlice';
import SentencesList from './components/SentencesList';
import PromptTester from './components/PromptTester';

const store = configureStore({
  reducer: {
    sentences: sentencesReducer,
  },
});

const initialSentences = [
  {
    "lang_code": "ar",
    "text": "هل تريد شاي؟"
  },
  {
    "lang_code": "he",
    "text": "אתה רוצה תה?"
  },
  {
    "lang_code": "ar",
    "text": "الشاي مشروب مفضل في ثقافتنا."
  },
  {
    "lang_code": "he",
    "text": "תה הוא משקה פופולרי בתרבות שלנו."
  },
  {
    "lang_code": "ar",
    "text": "نحن نشرب الشاي مع بعض الحلويات."
  },
  {
    "lang_code": "he",
    "text": "אנחנו שותים תה עם כמה ממתקים."
  },
  {
    "lang_code": "ar",
    "text": "هل تحب الشاي بالنعناع؟"
  },
  {
    "lang_code": "he",
    "text": "אתה אוהב תה עם נענע?"
  },
  {
    "lang_code": "ar",
    "text": "نعم، النعناع يعطي طعماً لذيذاً."
  },
  {
    "lang_code": "he",
    "text": "כן, נענע נותן טעם טעים."
  }
]

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
