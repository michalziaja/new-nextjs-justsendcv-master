"use client";

import { useState, useEffect } from "react";
import { JobOffer, CV } from "@/components/assistant/types";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface JobAndCVSelectorProps {
  selectedJobOffer: JobOffer | null;
  selectedCV: CV | null;
  setSelectedJobOffer: (job: JobOffer | null) => void;
  setSelectedCV: (cv: CV | null) => void;
  onGenerateDocument: () => void;
  isGenerating: boolean;
}

export function JobAndCVSelector({
  selectedJobOffer,
  selectedCV,
  setSelectedJobOffer,
  setSelectedCV,
  onGenerateDocument,
  isGenerating
}: JobAndCVSelectorProps) {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [cvs, setCVs] = useState<CV[]>([]);
  const [isLoadingJobOffers, setIsLoadingJobOffers] = useState(true);
  const [isLoadingCVs, setIsLoadingCVs] = useState(true);

  // Pobieranie ofert pracy
  useEffect(() => {
    const fetchJobOffers = async () => {
      setIsLoadingJobOffers(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error("Użytkownik nie jest zalogowany");
          setIsLoadingJobOffers(false);
          return;
        }

        const { data: offers, error } = await supabase
          .from('job_offers')
          .select('id, title, company, site, full_description, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Błąd podczas pobierania ofert pracy:", error);
        } else {
          setJobOffers(offers || []);
        }
      } catch (error) {
        console.error("Wystąpił błąd:", error);
      } finally {
        setIsLoadingJobOffers(false);
      }
    };

    fetchJobOffers();
  }, []);

  // Pobieranie CV
  useEffect(() => {
    const fetchCVs = async () => {
      setIsLoadingCVs(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error("Użytkownik nie jest zalogowany");
          setIsLoadingCVs(false);
          return;
        }

        // Sprawdzamy czy tabela user_cvs istnieje
        const { data: userCVs, error } = await supabase
          .from('user_cvs')
          .select('id, name, created_at, job_offer_id, selected_template')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Błąd podczas pobierania CV:", error);
          setCVs([]);
        } else {
          setCVs(userCVs || []);
        }
      } catch (error) {
        console.error("Wystąpił błąd podczas pobierania CV:", error);
        setCVs([]);
      } finally {
        setIsLoadingCVs(false);
      }
    };

    fetchCVs();
  }, []);

  return (
    <div className="space-y-5">
      {/* Lista ofert pracy */}
      <div className="space-y-2">
        <Label>Oferta pracy</Label>
        <div className="border rounded-md bg-white">
          {isLoadingJobOffers ? (
            <div className="flex justify-center items-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : jobOffers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Brak zapisanych ofert pracy
            </div>
          ) : (
            <div className="max-h-[200px] overflow-y-auto">
              {jobOffers.map((job) => (
                <div
                  key={job.id}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedJobOffer?.id === job.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => setSelectedJobOffer(job)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.company}</p>
                    </div>
                    {job.site && (
                      <Badge variant="outline" className="text-xs">
                        {job.site}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lista CV (opcjonalne) */}
      <div className="space-y-2">
        <Label>CV (opcjonalne)</Label>
        <div className="border rounded-md bg-white">
          {isLoadingCVs ? (
            <div className="flex justify-center items-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : cvs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Brak zapisanych CV
            </div>
          ) : (
            <div className="max-h-[200px] overflow-y-auto">
              {cvs.map((cv) => (
                <div
                  key={cv.id}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedCV?.id === cv.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                  }`}
                  onClick={() => setSelectedCV(cv)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{cv.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(cv.created_at).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                    {cv.selected_template && (
                      <Badge variant="outline" className="text-xs">
                        {cv.selected_template}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button 
        onClick={onGenerateDocument} 
        className="w-full mt-4"
        disabled={!selectedJobOffer || isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generowanie...
          </>
        ) : (
          "Generuj Dokument"
        )}
      </Button>
    </div>
  );
} 