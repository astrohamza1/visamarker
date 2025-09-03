
import React, { useState, useCallback } from 'react';
import { PlannerForm } from './components/PlannerForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { VisaMarkerIcon, GlobeIcon } from './components/icons';
import type { FormData, GenerationResult } from './types';
import { getVisaChecklist } from './services/geminiService';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GenerationResult | null>(null);

  const handleFormSubmit = useCallback(async (data: FormData) => {
    setLoading(true);
    setError(null);
    setFormData(data);
    setResults(null);
    try {
      const checklist = await getVisaChecklist(data);
      setResults({ checklist });
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);
  
  const handleReset = () => {
    setFormData(null);
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen font-sans text-brand-dark">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <VisaMarkerIcon className="h-8 w-8 text-brand-primary" />
            <h1 className="text-2xl font-bold text-brand-dark">VisaMarker</h1>
          </div>
          <a
            href="#planner"
            className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-2xl shadow-md hover:shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-200"
          >
            <GlobeIcon className="h-5 w-5" />
            <span>Plan Your Trip</span>
          </a>
        </nav>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4 tracking-tight">
            AI-Powered Visa & Travel Planning
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            From visa checklists to document drafts, get a personalized step-by-step journey map. Built for travelers from the Global South.
          </p>
        </div>

        <div id="planner" className="max-w-4xl mx-auto">
          {!results ? (
            <PlannerForm onSubmit={handleFormSubmit} loading={loading} />
          ) : (
            <ResultsDisplay formData={formData!} results={results} onReset={handleReset} />
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl relative mt-4 text-center" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-md mt-16 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} VisaMarker. All rights reserved.</p>
          <p className="text-sm mt-1">Empowering global travel with confidence.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;