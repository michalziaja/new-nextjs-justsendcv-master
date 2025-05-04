// app/saved/page.tsx
"use client"

import { SavedTable } from "@/components/saved/SavedTable"



// export const iframeHeight = "800px"

export const description = "A sidebar with a header and a search form."

export default function Saved() {
  return (
          <div className="flex flex-1 flex-col p-2 
            ml-0 mr-0 mt-6 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6 md:mt-7 
            lg:ml-8 lg:mr-6 lg:mt-8 xl:ml-15 xl:mr-15 xl:mt-12">
            <SavedTable />
          </div>
        )
}