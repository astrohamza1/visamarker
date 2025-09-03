
import type { FormData } from '../types';
import { visaData } from './visaData';

// Simulate network delay to mimic an API call
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 500));

const formatVisaInfo = (data: FormData, info: typeof visaData[string]): string => {
  const sections = [
    { title: "Visa Type", content: info['Visa Type (tourist/visit)'] },
    { title: "Application Channel", content: info['Application channel (eVisa/Embassy/ETA/VoA)'] },
    { title: "Core Documents Checklist", content: info['Core documents checklist'] },
    { title: "Financial Proof Requirement", content: info['Financial proof requirement'] },
    { title: "Travel Insurance Requirement", content: info['Travel insurance requirement'] },
    { title: "Biometrics / Interview", content: info['Biometrics / Interview'] },
    { title: "Processing Time (Typical)", content: info['Processing time (typical)'] },
    { title: "Government Fee (Approximate)", content: info['Government fee (approx)'] },
    { title: "Validity / Max Stay", content: info['Validity / Max stay'] },
    { title: "Official Sources", content: info['Official sources (URLs)'] },
    { title: "Important Notes", content: info['Notes'] },
  ];

  let markdown = `# Visa Plan for ${data.destination}\n\n`;
  markdown += `Here is your visa guide for traveling from **${data.nationality}** to **${data.destination}** for the purpose of **${data.purpose}**.\n\n`;
  markdown += `**Disclaimer:** This information is for guidance only. Policies can change. Always verify all details with the official embassy or consulate of ${data.destination}.\n\n`;

  sections.forEach(section => {
    if (section.content && section.content.trim() !== '') {
      markdown += `### ${section.title}\n`;
      // Simple formatting for lists or paragraphs
      if (section.content.includes(';')) {
          markdown += section.content.split(';').map(item => `- ${item.trim()}`).join('\n') + '\n\n';
      } else {
          markdown += `${section.content}\n\n`;
      }
    }
  });

  return markdown;
};

const getGenericChecklist = (data: FormData): string => {
  return `
# Your Visa Plan for ${data.destination}

Hello! Here is a general guide for your visa application from ${data.nationality} to ${data.destination}. 
**Disclaimer:** We could not find specific data for this route. This is a generic checklist. You must verify all information with the official embassy or consulate of ${data.destination}.

### 1. Visa Requirements Overview
- Based on your travel for the purpose of **${data.purpose}**, you will likely need a specific type of visitor visa. It is crucial to check the official embassy website of ${data.destination} for the exact visa category and requirements.

### 2. Required Documents Checklist
- [ ] **Valid Passport:** Must be valid for at least 6 months beyond your intended stay with at least two blank pages.
- [ ] **Visa Application Form:** Completed and signed. Usually available for download from the official embassy website.
- [ ] **Passport-sized Photos:** Recent photos meeting specific requirements (e.g., size, background color).
- [ ] **Proof of Accommodation:** Confirmed hotel bookings or a letter of invitation from a host in ${data.destination}.
- [ ] **Flight Itinerary:** Round-trip flight reservations. It is highly recommended not to purchase actual tickets until the visa is approved.
- [ ] **Proof of Financial Means:** Recent bank statements (e.g., last 3-6 months) showing sufficient funds to cover your trip.
- [ ] **Travel Insurance:** Health insurance valid for the entire duration of your stay in ${data.destination}.
- [ ] **Letter from Employer (if applicable):** A letter stating your position, salary, length of employment, and approved leave for the travel period.
- [ ] **Proof of Ties to Home Country:** Documents like property ownership, family ties, or a stable job to demonstrate your intention to return from ${data.destination}.

### 3. Application Process
1.  **Find the Official Embassy/Consulate:** Locate the nearest embassy or consulate of ${data.destination} in your country, ${data.nationality}.
2.  **Fill out the Application Form:** Download and complete the correct form accurately. Double-check all entries.
3.  **Gather Documents:** Collect all the necessary documents as per the checklist above.
4.  **Schedule an Appointment:** Many embassies require you to book an appointment online for application submission and biometrics.
5.  **Attend Appointment:** Submit your application and provide fingerprints and a photograph if required.
6.  **Wait for Decision:** Processing times can vary significantly. You can often track your application status online.

### 4. Embassy/Consulate Information
- Please find the official website for the embassy of **${data.destination}** in your region for the most accurate and up-to-date information. A web search for "Embassy of ${data.destination} in ${data.nationality}" is the best way to start.

### 5. Important Tips for Success
- **Apply Early:** Begin the visa application process well in advance of your intended travel date of ${data.travelDate}.
- **Be Honest and Consistent:** Ensure all information across your documents is accurate and consistent.
- **Organize Your Documents:** Present your application neatly and in the order requested by the embassy.
  `;
}

export const getVisaChecklist = async (data: FormData): Promise<string> => {
  await simulateDelay();

  const destinationData = visaData[data.destination as keyof typeof visaData];
  
  // Check if specific data exists and has meaningful content
  if (destinationData && destinationData['Core documents checklist'] && destinationData['Core documents checklist'].trim() !== '') {
    return formatVisaInfo(data, destinationData);
  }

  // Fallback to the generic template
  return getGenericChecklist(data);
};

export const generateCoverLetter = async (data: FormData): Promise<string> => {
  await simulateDelay();
  return `
[Your Name]
[Your Address]
[Your Phone Number]
[Your Email]

[Date]

The Visa Section
[Embassy/Consulate of ${data.destination}]
[Embassy Address]

**Subject: Visa Application for ${data.purpose} from a ${data.nationality} citizen**

Dear Sir/Madam,

I am writing to apply for a visa to visit **${data.destination}** for the purpose of **${data.purpose}**. My intended travel is planned around **${data.travelDate}**.

I am a citizen of **${data.nationality}** (Passport No: [Your Passport Number]), and I am very keen to experience the culture and attractions of your country. My visit is planned for a duration of [Number of days] days.

During my stay, I plan to [Briefly describe your plans, e.g., visit key tourist sites, attend a conference, visit family]. I have enclosed a detailed travel itinerary for your reference.

I am employed as a [Your Job Title] at [Your Company Name] and have been granted leave for this trip. I have sufficient funds to cover all my expenses during my stay, and I have attached my bank statements as proof of my financial standing.

I have strong social and economic ties to my home country, ${data.nationality}, and I assure you that I will return upon the completion of my visit.

Thank you for your time and consideration of my application. I look forward to your positive response.

Sincerely,

[Your Name]
  `;
};

export const generateItinerary = async (data: FormData): Promise<string> => {
    await simulateDelay();
    return `
# Sample 7-Day Itinerary for ${data.destination}

**Purpose of Trip:** ${data.purpose}
**Disclaimer:** This is a generic sample itinerary. You should customize it to reflect your actual travel plans.

- **Day 1: Arrival and Settling In**
- - Arrive at [Main Airport in ${data.destination}].
- - Take a taxi/public transport to your accommodation.
- - Check into [Hotel Name or Address].
- - Evening: Relax and have dinner at a local restaurant.

- **Day 2: Exploring the Capital**
- - Morning: [Activity related to ${data.purpose}, e.g., "Visit the National Museum" for Tourism or "Attend opening session of conference" for Business].
- - Afternoon: [Another activity, e.g., "Walk through the historic city center"].
- - Evening: Enjoy a traditional dinner.

- **Day 3: Cultural Immersion**
- - Visit a famous landmark like [Famous Landmark in ${data.destination}].
- - Explore a local market for souvenirs.
- - Use local metro/bus for transportation.

- **Day 4: Day Trip**
- - Take a day trip to a nearby town or natural attraction, such as [Nearby Town/Attraction].
- - This shows a well-planned trip.

- **Day 5: Continuing with Purpose**
- - [Activity related to ${data.purpose}, e.g., "Visit another historical site" or "Networking event for business"].
- - Afternoon: Leisure time.

- **Day 6: Last Day of Activities**
- - Morning: Last-minute souvenir shopping.
- - Afternoon: Pack and prepare for departure.
- - Evening: Farewell dinner.

- **Day 7: Departure**
- - Check out from the hotel.
- - Travel to the airport for your flight back home.
  `;
};

export const calculateBudget = async (data: FormData): Promise<string> => {
  await simulateDelay();
  return `
# Estimated Travel Budget for ${data.destination}

**Disclaimer:** This is a sample budget for a 7-day trip to provide a general idea of costs. All figures are estimates in USD and can vary widely.

### Estimated Costs for one person
- Round-trip Flights: $700 - $1600
- - Varies greatly depending on your departure city in ${data.nationality} and time of booking.
- Accommodation: $90 - $200 per night
- - For a mid-range hotel.
- Daily Expenses: $80 - $120 per day
- - Covers food, local transport, and minor activities.
- Travel Insurance: $50 - $100
- - For the entire trip.
- Visa Application Fee: $60 - $180
- - This is a typical estimate, check the official embassy website for the exact fee.

### Comparative Travel Costs
Here are some general per-day cost estimates for other destinations to give you a perspective:

- **Dubai, UAE**
- - Accommodation (per night, mid-range) - $120
- - Daily Expenses (food & transport) - $90

- **London, UK**
- - Accommodation (per night, mid-range) - $150
- - Daily Expenses (food & transport) - $100

- **Tokyo, Japan**
- - Accommodation (per night, mid-range) - $110
- - Daily Expenses (food & transport) - $80

### Final Note
All figures are estimates for planning purposes only. Actual costs can fluctuate based on booking time, travel style, and specific choices. Please do your own research for precise, up-to-date pricing.
  `;
};
