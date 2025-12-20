interface BottomProgressBarProps {
  currentStep: number
  totalSteps: number
  stepName?: string
}

const defaultStepNames = [
  'Your Contact Details',
  'Profile Picture',
  'Your Skills and Introduction preferences',
  'Your Superpower'
]

export default function BottomProgressBar({
  currentStep,
  totalSteps,
  stepName
}: BottomProgressBarProps) {
  const progressPercentage = (currentStep / totalSteps) * 100
  const displayStepName = stepName || defaultStepNames[currentStep - 1] || `Step ${currentStep}`

  return (
    <div className="progress-bar fixed bottom-0 left-0 right-0 z-40">
      <div className="px-6 py-3">
        {/* Step Info Above Bar */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{displayStepName}</span>
          <span className="text-sm font-medium text-gray-500">
            {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Thin Progress Bar */}
        <div className="progress-bar-line-bg w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="progress-bar-line h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
