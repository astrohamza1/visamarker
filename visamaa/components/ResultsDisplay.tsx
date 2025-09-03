
import React, { useState, useRef, useCallback } from 'react';
import type { FormData, GenerationResult } from '../types';
import {
  generateCoverLetter,
  generateItinerary,
  calculateBudget,
} from '../services/geminiService';
import { ChecklistIcon, DocumentIcon, BudgetIcon, DownloadIcon, ShareIcon, BackIcon } from './icons';

declare global {
  interface Window {
    html2canvas: any;
    jspdf: any;
  }
}

type Tab = 'checklist' | 'documents' | 'budget';

const ResultContent: React.FC<{ content: string }> = ({ content }) => {
    // This is a simple markdown-to-html renderer.
    const htmlContent = content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('### ')) return `<h3 class="text-xl font-semibold mt-6 mb-3 text-brand-dark" key=${index}>${line.substring(4)}</h3>`;
        if (line.startsWith('## ')) return `<h2 class="text-2xl font-bold mt-8 mb-4 text-brand-dark" key=${index}>${line.substring(3)}</h2>`;
        if (line.startsWith('# ')) return `<h1 class="text-3xl font-extrabold mt-8 mb-4 text-brand-dark" key=${index}>${line.substring(2)}</h1>`;
        if (line.startsWith('- [ ]')) return `<li class="flex items-start my-2" key=${index}><span class="mr-3 mt-1 inline-block h-5 w-5 border-2 border-gray-400 rounded"></span><span>${line.substring(5).trim()}</span></li>`;
        if (line.startsWith('- ')) return `<li class="list-disc ml-6 my-2" key=${index}>${line.substring(2)}</li>`;
        if (line.trim() === '') return `<br key=${index}/>`;
        return `<p class="my-2 text-gray-700" key=${index}>${line}</p>`;
      })
      .join('');
  
    return <div dangerouslySetInnerHTML={{ __html: htmlContent.replace(/<li/g, '<ul class="space-y-2"').replace(/<\/li>/g, '</li></ul>') }} />;
};

const LoadingPane: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg min-h-[200px]">
        <svg className="animate-spin h-8 w-8 text-brand-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600">Generating your document...</p>
        <p className="text-sm text-gray-500">This may take a moment.</p>
    </div>
);

export const ResultsDisplay: React.FC<{
  formData: FormData;
  results: GenerationResult;
  onReset: () => void;
}> = ({ formData, results, onReset }) => {
  const [activeTab, setActiveTab] = useState<Tab>('checklist');
  const [generatedDocs, setGeneratedDocs] = useState({ coverLetter: '', itinerary: '', budget: '' });
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const generateDoc = useCallback(async <T extends keyof typeof generatedDocs>(docType: T, generator: (data: FormData) => Promise<string>) => {
    if (generatedDocs[docType]) return;
    setLoadingDoc(docType);
    try {
        const content = await generator(formData);
        setGeneratedDocs(prev => ({ ...prev, [docType]: content }));
    } catch (error) {
        console.error(`Failed to generate ${docType}:`, error);
        let errorMessage = `Could not generate ${docType}. Please try again.`;
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        setGeneratedDocs(prev => ({ ...prev, [docType]: `Error: ${errorMessage}` }));
    } finally {
        setLoadingDoc(null);
    }
  }, [formData, generatedDocs]);

  const handleDownloadPdf = () => {
    const input = contentRef.current;
    if (!input || !window.html2canvas || !window.jspdf) {
      alert("An error occurred while preparing the PDF download.");
      return;
    }
    
    setIsDownloading(true);

    // Add a temporary class for PDF generation to ensure a white background
    input.classList.add('bg-white', 'p-4');

    window.html2canvas(input, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight
    }).then((canvas: any) => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        const ratio = canvasHeight / canvasWidth;
        const imgHeightInPdf = pdfWidth * ratio;
        
        let heightLeft = imgHeightInPdf;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
        heightLeft -= pdfHeight;
        
        while (heightLeft > 0) {
            position -= pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
            heightLeft -= pdfHeight;
        }
        
        pdf.save(`VisaMarker_Plan_${formData.destination}.pdf`);
    }).catch((error: any) => {
        console.error("Error generating PDF:", error);
        alert("Sorry, there was a problem creating your PDF. Please try again.");
    }).finally(() => {
        // Clean up the temporary class
        input.classList.remove('bg-white', 'p-4');
        setIsDownloading(false);
    });
  };

  const handleShareWhatsApp = () => {
    const text = `Here is my visa plan for ${formData.destination} from VisaMarker:\n\n${results.checklist.substring(0, 200)}...\n\nGet your own plan at VisaMarker!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const TabButton: React.FC<{ tab: Tab; icon: React.ReactNode; label: string }> = ({ tab, icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-2xl transition-all duration-200 ${
        activeTab === tab ? 'bg-brand-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-200 overflow-hidden transition-shadow duration-200">
        <div className="p-6 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-brand-dark">Your VisaMarker Plan</h2>
                <p className="text-gray-600">{formData.nationality} to {formData.destination} for {formData.purpose}</p>
            </div>
            <button onClick={onReset} className="flex items-center space-x-2 text-sm font-medium text-brand-primary hover:underline">
                <BackIcon className="h-4 w-4" />
                <span>Start Over</span>
            </button>
        </div>

        <div className="p-6">
            <div className="flex flex-wrap gap-2 border-b pb-4 mb-6">
                <TabButton tab="checklist" icon={<ChecklistIcon className="h-5 w-5"/>} label="Checklist"/>
                <TabButton tab="documents" icon={<DocumentIcon className="h-5 w-5"/>} label="AI Documents"/>
                <TabButton tab="budget" icon={<BudgetIcon className="h-5 w-5"/>} label="Budget Planner"/>
            </div>

            <div ref={contentRef} className="prose max-w-none">
                {activeTab === 'checklist' && <ResultContent content={results.checklist} />}
                {activeTab === 'documents' && (
                    <div className="space-y-6">
                        <DocumentGenerator title="Cover Letter" docType="coverLetter" onGenerate={generateDoc} content={generatedDocs.coverLetter} loading={loadingDoc === 'coverLetter'} generator={generateCoverLetter} />
                        <DocumentGenerator title="Sample Itinerary" docType="itinerary" onGenerate={generateDoc} content={generatedDocs.itinerary} loading={loadingDoc === 'itinerary'} generator={generateItinerary} />
                    </div>
                )}
                {activeTab === 'budget' && (
                    <DocumentGenerator title="Estimated Budget" docType="budget" onGenerate={generateDoc} content={generatedDocs.budget} loading={loadingDoc === 'budget'} generator={calculateBudget} />
                )}
            </div>

            <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-4">
                <button onClick={handleDownloadPdf} disabled={isDownloading} className="flex-1 flex justify-center items-center space-x-2 bg-brand-secondary text-white px-4 py-2 rounded-2xl font-semibold hover:bg-brand-accent shadow-md hover:shadow-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isDownloading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Preparing PDF...</span>
                        </>
                    ) : (
                        <>
                            <DownloadIcon className="h-5 w-5" />
                            <span>Download as PDF</span>
                        </>
                    )}
                </button>
                <button onClick={handleShareWhatsApp} className="flex-1 flex justify-center items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-2xl font-semibold hover:bg-green-600 shadow-md hover:shadow-lg transition-all duration-200">
                    <ShareIcon className="h-5 w-5" />
                    <span>Share on WhatsApp</span>
                </button>
            </div>
        </div>
    </div>
  );
};

const DocumentGenerator: React.FC<{
    title: string;
    docType: keyof { coverLetter: string, itinerary: string, budget: string };
    onGenerate: (docType: any, generator: any) => void;
    content: string;
    loading: boolean;
    generator: (data: FormData) => Promise<string>;
}> = ({ title, docType, onGenerate, content, loading, generator }) => (
    <div>
        <h3 className="text-xl font-semibold mb-3 text-brand-dark">{title}</h3>
        {!content && !loading && (
            <button onClick={() => onGenerate(docType, generator)} className="bg-brand-primary text-white px-4 py-2 rounded-2xl text-sm font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200">
                Generate {title}
            </button>
        )}
        {loading && <LoadingPane />}
        {content && <div className="p-4 bg-gray-50 rounded-lg border prose-sm max-w-none"><ResultContent content={content} /></div>}
    </div>
);