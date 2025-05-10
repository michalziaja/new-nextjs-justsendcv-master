"use client";

import React from 'react';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileTips from '@/components/profile/ProfileTips';

export default function Page() {
  return (
    <div className="flex flex-1 flex-col p-2">
      {/* Wiersze formularzy */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3
      ml-2 mr-2 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6  
      lg:ml-8 lg:mr-6 xl:ml-15 xl:mr-15 mt-12">
        {/* Formularz profilu - lewa strona */}
        <div className="lg:col-span-2 h-full">
          <ProfileForm />
        </div>
        
        {/* Wskazówki - prawa strona */}
        <div className="lg:col-span-1 h-full">
          <ProfileTips />
        </div>
      </div>
    </div>
  );
}
