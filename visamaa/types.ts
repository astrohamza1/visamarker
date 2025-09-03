
export interface FormData {
  nationality: string;
  destination: string;
  travelDate: string;
  purpose: string;
}

export interface GenerationResult {
  checklist: string;
  coverLetter?: string;
  itinerary?: string;
  budget?: string;
}
