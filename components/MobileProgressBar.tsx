'use client'

interface MobileProgressBarProps {
  currentStep: number
  totalSteps: number
}

export default function MobileProgressBar({
  currentStep,
  totalSteps,
}: MobileProgressBarProps) {
  // Progress based on completed steps, not current step
  // So step 1 = 0%, step 2 = 33%, step 3 = 66%, step 4 = 100%
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
