import React, { useEffect } from 'react';

export default function AdBanner() {
  useEffect(() => {
    try {
      // Push the ad only if it hasn't been initialized in this container
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
