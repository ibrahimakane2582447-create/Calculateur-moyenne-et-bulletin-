import React, { useEffect } from 'react';

export default function AdBanner() {
  useEffect(() => {
    // 1. Injecter le script dynamiquement s'il n'est pas déjà présent
    let script = document.querySelector('script[src*="adsbygoogle.js"]');
    if (!script) {
      const newScript = document.createElement('script');
      newScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8106079340317111";
      newScript.async = true;
      newScript.crossOrigin = "anonymous";
      document.head.appendChild(newScript);
    }

    // 2. Initialiser la publicité
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="w-full my-6 flex justify-center overflow-hidden min-h-[90px] bg-gray-50 rounded-xl border border-gray-100">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-8106079340317111"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
