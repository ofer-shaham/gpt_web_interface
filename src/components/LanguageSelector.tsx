// src/components/LanguageSelector.tsx
import React from 'react';

interface LanguageSelectorProps {
  langTo: string;
  setLangTo: (lang: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ langTo, setLangTo }) => {
  const languages = [
    { code: 'he', label: 'Hebrew' },
    { code: 'ti', label: 'Tigrinya1' },
    { code: 'tir', label: 'Tigrinya2' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'zh', label: 'Chinese' },

    // Add more languages as needed
  ];

  return (
    <div className= "mb-4" >
    <label htmlFor="language-select" className = "mr-2" > Select Your Language: </label>
    < select
    id = "language-select"
    value = { langTo }
    onChange = {(e) => setLangTo(e.target.value)}
    className = "border p-2 rounded"
    >
    {
      languages.map((language) => (
        <option key= { language.code } value = { language.code } >
        { language.label }
        </option>
      ))
    }
    </select>
    </div>
  );
};

export default LanguageSelector;
