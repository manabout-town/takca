"use client"
import { cn } from "@/lib/utils/cn"
import { InputHTMLAttributes, forwardRef } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all",
            error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"
export { Input }
