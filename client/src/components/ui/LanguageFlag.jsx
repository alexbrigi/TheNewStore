import React from 'react';

const MAP = {
  JAPANESE: { file: 'jp.png', label: 'Japonés' },
  ENGLISH: { file: 'gb.png', label: 'English' },
  KOREAN: { file: 'kr.png', label: 'Koreano' },
  CHINESE: { file: 'cn.png', label: 'Chino' },
  SPANISH: { file: 'es.png', label: 'Español' },
};

const LanguageFlag = ({ code = 'ENGLISH' }) => {
  const item = MAP[code] || MAP.ENGLISH;
  return (
    <div title={item.label} className="w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow-sm overflow-hidden border-2 border-gray">
      <img src={`/flags/${item.file}`} alt={item.label} className="w-full h-full object-cover" />
    </div>
  );
};

export default LanguageFlag;
