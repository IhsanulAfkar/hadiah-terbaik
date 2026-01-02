import React from 'react';
import { Check } from 'lucide-react';

const Stepper = ({ steps, currentStep }) => {
    // Calculate progress percentage for the connecting line
    // e.g. Step 1 of 3 = 0%, Step 2 of 3 = 50%, Step 3 of 3 = 100%
    const progressWidth = ((currentStep - 1) / (steps.length - 1)) * 100;

    return (
        <div className="w-full py-8 px-4 sm:px-0">
            <div className="relative flex items-center justify-between max-w-3xl mx-auto">
                {/* Background Track */}
                <div className="absolute left-0 top-5 transform -translate-y-1/2 w-full h-1 bg-slate-200 z-0 rounded-full" />

                {/* Active Progress Track */}
                <div
                    className="absolute left-0 top-5 transform -translate-y-1/2 h-1 bg-green-500 z-0 transition-all duration-500 ease-in-out rounded-full"
                    style={{ width: `${progressWidth}%` }}
                />

                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <div key={index} className="flex flex-col items-center relative group cursor-default">
                            {/* Circle Indicator */}
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 z-20 bg-white",
                                isActive ? "border-primary-600 text-primary-600 ring-4 ring-primary-50 scale-110" :
                                    isCompleted ? "bg-green-500 border-green-500 text-white" :
                                        "border-slate-300 text-slate-400"
                            )}>
                                {isCompleted ? <Check className="w-6 h-6" /> : stepNumber}
                            </div>

                            {/* Label */}
                            <div className={cn(
                                "absolute top-12 whitespace-nowrap text-xs md:text-sm font-medium transition-colors duration-300",
                                isActive ? "text-primary-700 font-bold" :
                                    isCompleted ? "text-green-600" :
                                        "text-slate-500"
                            )}>
                                {step.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Helper function
function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default Stepper;
