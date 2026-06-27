'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  FileText,
  Loader2,
  ChevronLeft,
  Shield,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type UserRole = 'shipper' | 'driver' | 'admin' | null
type Step = 1 | 2 | 3
type VerificationResult =
  | 'approved'
  | 'manual_review'
  | 'rejected'
  | 'error'
  | null

interface UploadedFile {
  file: File
  error: string | null
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function StepDots({ current }: { current: Step }) {
  return (
    <div className="flex justify-center gap-2 mb-8">
      {([1, 2, 3] as Step[]).map((step) => (
        <div
          key={step}
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            step === current
              ? 'bg-[#FF6B2B]'
              : step < current
              ? 'bg-[#FF6B2B] opacity-50'
              : 'bg-gray-700'
          }`}
        />
      ))}
    </div>
  )
}

export default function VerificationPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>(1)
  const [role, setRole] = useState<UserRole>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  const [businessFile, setBusinessFile] = useState<UploadedFile | null>(null)
  const [licenseFile, setLicenseFile] = useState<UploadedFile | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<VerificationResult>(null)
  const [rejectionReason, setRejectionReason] = useState<string>('')

  const businessInputRef = useRef<HTMLInputElement>(null)
  const licenseInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function checkUser() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          router.replace('/login')
          return
        }

        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('role, verification_status')
          .eq('id', user.id)
          .single()

        if (dbError || !userData) {
          setLoadingUser(false)
          return
        }

        const userRole = userData.role as UserRole
        setRole(userRole)

        if (userRole === 'admin') {
          router.replace('/admin/dashboard')
          return
        }

        if (userData.verification_status === 'verified') {
          if (userRole === 'driver') {
            router.replace('/driver/dashboard')
          } else {
            router.replace('/shipper/dashboard')
          }
          return
        }

        if (userData.verification_status === 'pending') {
          setStep(3)
          setResult('manual_review')
        }
      } catch {
        // silently allow to continue with default state
      } finally {
        setLoadingUser(false)
      }
    }

    checkUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return '지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WEBP, PDF만 가능합니다.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return '파일 크기가 10MB를 초과합니다.'
    }
    return null
  }

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: UploadedFile | null) => void
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    const error = validateFile(file)
    setter({ file, error })
    // reset input so same file can be re-selected after removal
    e.target.value = ''
  }

  function removeFile(
    setter: (v: UploadedFile | null) => void,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) {
    setter(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleSubmit() {
    if (role === 'driver' && (!businessFile || businessFile.error)) return
    if (role === 'driver' && (!licenseFile || licenseFile.error)) return

    setSubmitting(true)
    setStep(3)
    setResult(null)

    try {
      const formData = new FormData()
      if (businessFile) formData.append('business_registration', businessFile.file)
      if (role === 'driver' && licenseFile) {
        formData.append('driver_license', licenseFile.file)
      }

      const response = await fetch('/api/kyc/verify', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setResult('error')
        return
      }

      const status: VerificationResult = data.status ?? 'error'
      setResult(status)

      if (status === 'rejected') {
        setRejectionReason(data.reason ?? '서류를 확인할 수 없습니다.')
      }

      if (status === 'approved') {
        setTimeout(() => {
          if (role === 'driver') {
            router.replace('/driver/dashboard')
          } else {
            router.replace('/shipper/dashboard')
          }
        }, 2000)
      }
    } catch {
      setResult('error')
    } finally {
      setSubmitting(false)
    }
  }

  function retryFromUpload() {
    setResult(null)
    setStep(2)
  }

  const canSubmit =
    role !== 'driver' ||
    (!!businessFile && !businessFile.error && !!licenseFile && !licenseFile.error)

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 animate-pulse">
            <div className="h-6 bg-gray-800 rounded w-3/4 mx-auto mb-4" />
            <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto mb-8" />
            <div className="h-24 bg-gray-800 rounded mb-4" />
            <div className="h-12 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full mx-auto">
        {/* Step 1: Intro */}
        {step === 1 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <StepDots current={1} />

            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-[#FF6B2B]/10 flex items-center justify-center">
                <Shield className="text-[#FF6B2B]" size={32} />
              </div>
            </div>

            <h1 className="text-xl font-bold text-white text-center mb-2">
              본인 인증이 필요합니다
            </h1>
            <p className="text-gray-400 text-sm text-center mb-8">
              탁카 서비스 이용을 위해 아래 서류를 준비해주세요.
            </p>

            <div className="bg-gray-800 rounded-xl p-5 mb-8">
              <p className="text-xs font-semibold text-[#FF6B2B] uppercase tracking-wide mb-3">
                {role === 'driver' ? '기사 필요 서류' : '화주 필요 서류'}
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <FileText size={16} className="text-gray-500 shrink-0" />
                  사업자등록증
                  {role === 'shipper' && (
                    <span className="text-gray-500 text-xs">(선택)</span>
                  )}
                  {role === 'driver' && (
                    <span className="text-[#FF6B2B] text-xs">필수</span>
                  )}
                </li>
                {role === 'driver' && (
                  <li className="flex items-center gap-3 text-sm text-gray-300">
                    <FileText size={16} className="text-gray-500 shrink-0" />
                    운전면허증
                    <span className="text-[#FF6B2B] text-xs">필수</span>
                  </li>
                )}
              </ul>
              <p className="text-xs text-gray-500 mt-4">
                JPG, PNG, PDF 형식 · 파일당 최대 10MB
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-[#FF6B2B] hover:bg-[#e55c20] text-white font-semibold py-3.5 rounded-xl transition-colors"
            >
              인증 시작하기 →
            </button>
          </div>
        )}

        {/* Step 2: Upload */}
        {step === 2 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <StepDots current={2} />

            <h2 className="text-xl font-bold text-white text-center mb-1">
              서류 업로드
            </h2>
            <p className="text-gray-400 text-sm text-center mb-8">
              선명하게 촬영한 파일을 업로드해주세요.
            </p>

            {/* Business Registration */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                사업자등록증{' '}
                <span className={`text-xs ${role === 'driver' ? 'text-[#FF6B2B]' : 'text-gray-500'}`}>
                  {role === 'driver' ? '필수' : '선택'}
                </span>
              </label>

              {!businessFile ? (
                <div
                  onClick={() => businessInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-[#FF6B2B] transition-colors"
                >
                  <Upload className="mx-auto mb-2 text-gray-500" size={32} />
                  <p className="text-gray-400 text-sm">탭하여 파일 선택</p>
                  <p className="text-gray-600 text-xs mt-1">
                    JPG, PNG, PDF · 최대 10MB
                  </p>
                </div>
              ) : (
                <div
                  className={`border rounded-xl p-4 flex items-center gap-3 ${
                    businessFile.error
                      ? 'border-red-500/50 bg-red-500/5'
                      : 'border-gray-700 bg-gray-800'
                  }`}
                >
                  <FileText
                    size={20}
                    className={
                      businessFile.error ? 'text-red-400' : 'text-[#FF6B2B]'
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {businessFile.file.name}
                    </p>
                    {businessFile.error ? (
                      <p className="text-xs text-red-400 mt-0.5">
                        {businessFile.error}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatFileSize(businessFile.file.size)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      removeFile(setBusinessFile, businessInputRef)
                    }
                    className="text-gray-500 hover:text-white transition-colors text-lg leading-none shrink-0"
                    aria-label="파일 제거"
                  >
                    ×
                  </button>
                </div>
              )}

              <input
                ref={businessInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                className="hidden"
                onChange={(e) => handleFileChange(e, setBusinessFile)}
              />
            </div>

            {/* Driver License — drivers only */}
            {role === 'driver' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  운전면허증{' '}
                  <span className="text-[#FF6B2B] text-xs">필수</span>
                </label>

                {!licenseFile ? (
                  <div
                    onClick={() => licenseInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-[#FF6B2B] transition-colors"
                  >
                    <Upload className="mx-auto mb-2 text-gray-500" size={32} />
                    <p className="text-gray-400 text-sm">탭하여 파일 선택</p>
                    <p className="text-gray-600 text-xs mt-1">
                      JPG, PNG, PDF · 최대 10MB
                    </p>
                  </div>
                ) : (
                  <div
                    className={`border rounded-xl p-4 flex items-center gap-3 ${
                      licenseFile.error
                        ? 'border-red-500/50 bg-red-500/5'
                        : 'border-gray-700 bg-gray-800'
                    }`}
                  >
                    <FileText
                      size={20}
                      className={
                        licenseFile.error ? 'text-red-400' : 'text-[#FF6B2B]'
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {licenseFile.file.name}
                      </p>
                      {licenseFile.error ? (
                        <p className="text-xs text-red-400 mt-0.5">
                          {licenseFile.error}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatFileSize(licenseFile.file.size)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        removeFile(setLicenseFile, licenseInputRef)
                      }
                      className="text-gray-500 hover:text-white transition-colors text-lg leading-none shrink-0"
                      aria-label="파일 제거"
                    >
                      ×
                    </button>
                  </div>
                )}

                <input
                  ref={licenseInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(',')}
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setLicenseFile)}
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full bg-[#FF6B2B] hover:bg-[#e55c20] disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors mb-3"
            >
              제출하기
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full flex items-center justify-center gap-1.5 text-gray-400 hover:text-white text-sm py-2 transition-colors"
            >
              <ChevronLeft size={16} />
              뒤로
            </button>
          </div>
        )}

        {/* Step 3: Result / Loading */}
        {step === 3 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <StepDots current={3} />

            {/* Submitting / Loading */}
            {submitting && (
              <div className="flex flex-col items-center text-center py-4">
                <Loader2
                  size={48}
                  className="text-[#FF6B2B] animate-spin mb-6"
                />
                <p className="text-white font-semibold text-lg mb-2">
                  AI가 서류를 검토 중입니다...
                </p>
                <p className="text-gray-400 text-sm">(최대 30초)</p>
              </div>
            )}

            {/* Approved */}
            {!submitting && result === 'approved' && (
              <div className="flex flex-col items-center text-center py-4">
                <CheckCircle size={56} className="text-green-400 mb-5" />
                <h2 className="text-white font-bold text-xl mb-3">
                  인증 완료!
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  탁카 서비스를 이용하실 수 있습니다.
                </p>
                <p className="text-gray-500 text-xs mt-4">
                  잠시 후 대시보드로 이동합니다...
                </p>
              </div>
            )}

            {/* Manual Review */}
            {!submitting && result === 'manual_review' && (
              <div className="flex flex-col items-center text-center py-4">
                <Clock size={56} className="text-yellow-400 mb-5" />
                <h2 className="text-white font-bold text-xl mb-3">
                  서류 접수 완료
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  담당자 검토 후{' '}
                  <span className="text-white font-medium">1–2 영업일</span>{' '}
                  내 결과를 알려드립니다.
                </p>
                <div className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-left">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    이메일로 심사 결과를 알려드립니다. 스팸함도 확인해주세요.
                    문의:{' '}
                    <span className="text-[#FF6B2B]">support@takca.kr</span>
                  </p>
                </div>
              </div>
            )}

            {/* Rejected */}
            {!submitting && result === 'rejected' && (
              <div className="flex flex-col items-center text-center py-4">
                <XCircle size={56} className="text-red-400 mb-5" />
                <h2 className="text-white font-bold text-xl mb-3">
                  인증 실패
                </h2>
                {rejectionReason && (
                  <div className="w-full bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-left mb-6">
                    <p className="text-xs font-semibold text-red-400 mb-1">
                      반려 사유
                    </p>
                    <p className="text-sm text-gray-300">{rejectionReason}</p>
                  </div>
                )}
                <button
                  onClick={retryFromUpload}
                  className="w-full bg-[#FF6B2B] hover:bg-[#e55c20] text-white font-semibold py-3.5 rounded-xl transition-colors"
                >
                  다시 시도하기
                </button>
              </div>
            )}

            {/* Error */}
            {!submitting && result === 'error' && (
              <div className="flex flex-col items-center text-center py-4">
                <XCircle size={56} className="text-gray-500 mb-5" />
                <h2 className="text-white font-bold text-xl mb-3">
                  오류가 발생했습니다
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  잠시 후 다시 시도해주세요.
                </p>
                <button
                  onClick={retryFromUpload}
                  className="w-full bg-[#FF6B2B] hover:bg-[#e55c20] text-white font-semibold py-3.5 rounded-xl transition-colors"
                >
                  다시 시도하기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
