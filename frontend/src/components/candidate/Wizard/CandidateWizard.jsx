import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import BasicInfoSteps from './BasicInfoSteps';
import DynamicListSteps from './DynamicListSteps';

const STEPS = [
  'Personal Information',
  'Professional Details',
  'Social Links',
  'Address',
  'Education',
  'Experience',
  'Projects',
  'Certifications',
  'Languages',
  'Skills'
];

const CandidateWizard = ({ initialData, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileId, setProfileId] = useState(initialData?.profile?.id || null);
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = async (data, saveFunction) => {
    setIsSaving(true);
    try {
      if (saveFunction) {
        const response = await saveFunction(data);
        if (response && response.data && response.data.id) {
            setProfileId(response.data.id);
        }
      }
      
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        onComplete();
      }
    } catch (error) {
      console.error("Save failed", error);
      alert(error.response?.data?.detail || "Failed to save data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header & Progress */}
      <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Build Your Portfolio</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Complete your profile to get the best job matches.</p>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800">
            <div 
              style={{ width: `${((currentStep) / (STEPS.length - 1)) * 100}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{Math.round(((currentStep) / (STEPS.length - 1)) * 100)}% Completed</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{STEPS[currentStep]}</h3>
        </div>
        
        <div className="p-6 flex-1 relative">
            {isSaving && (
                <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
            )}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {currentStep < 4 ? (
                        <BasicInfoSteps 
                            step={currentStep} 
                            initialData={initialData?.profile || {}} 
                            onNext={handleNext} 
                            onBack={handleBack} 
                            isFirstStep={currentStep === 0}
                            profileId={profileId}
                        />
                    ) : (
                        <DynamicListSteps 
                            step={currentStep} 
                            initialData={initialData || {}} 
                            onNext={handleNext} 
                            onBack={handleBack} 
                            isLastStep={currentStep === STEPS.length - 1}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CandidateWizard;
