
import React, { useState } from 'react';
import type { FormData } from '../types';
import { COUNTRIES, DESTINATIONS, PURPOSES } from '../constants';
import { PlaneIcon } from './icons';

interface PlannerFormProps {
  onSubmit: (data: FormData) => void;
  loading: boolean;
}

const FormInput = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {children}
  </div>
);

const FormSelect = ({ id, value, onChange, options, placeholder }: { id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; placeholder: string }) => (
  <select
    id={id}
    name={id}
    value={value}
    onChange={onChange}
    required
    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-lg shadow-sm"
  >
    <option value="" disabled>{placeholder}</option>
    {options.map(option => <option key={option} value={option}>{option}</option>)}
  </select>
);


export const PlannerForm: React.FC<PlannerFormProps> = ({ onSubmit, loading }) => {
  const [nationality, setNationality] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [purpose, setPurpose] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nationality, destination, travelDate, purpose });
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-lg border border-gray-200 transition-shadow duration-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput id="nationality" label="Your Nationality">
            <FormSelect id="nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} options={[...COUNTRIES].sort()} placeholder="Select your nationality" />
          </FormInput>
          
          <FormInput id="destination" label="Destination Country">
            <FormSelect id="destination" value={destination} onChange={(e) => setDestination(e.target.value)} options={[...DESTINATIONS].sort()} placeholder="Select your destination" />
          </FormInput>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput id="travel-date" label="Intended Travel Date">
            <input
              type="date"
              id="travel-date"
              name="travel-date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-lg shadow-sm"
            />
          </FormInput>
          
          <FormInput id="purpose" label="Purpose of Visit">
            <FormSelect id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} options={PURPOSES} placeholder="Select purpose of visit" />
          </FormInput>
        </div>
        
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center items-center space-x-3 py-3 px-4 border border-transparent rounded-2xl shadow-md hover:shadow-lg text-base font-medium text-white bg-brand-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating Your Plan...</span>
              </>
            ) : (
              <>
                <PlaneIcon className="h-5 w-5" />
                <span>Create My Plan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};