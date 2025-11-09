'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ClaimFormData, IncidentType, CoverageType, DamageSeverity } from '@/types/claim'

const STEPS = [
  { id: 1, title: 'Incident Information', description: 'Tell us what happened' },
  { id: 2, title: 'Vehicle Information', description: 'Your vehicle details' },
  { id: 3, title: 'Insurance Information', description: 'Policy and coverage' },
  { id: 4, title: 'Damage Information', description: 'Describe the damage' },
  { id: 5, title: 'Police Report', description: 'Official documentation' },
  { id: 6, title: 'Document Upload', description: 'Upload supporting documents' },
]

interface ClaimFormProps {
  onComplete?: (claimId: string) => void
}

export function ClaimForm({ onComplete }: ClaimFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<ClaimFormData>>({
    police_called: false,
  })
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const progress = (currentStep / STEPS.length) * 100

  const updateField = (field: keyof ClaimFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user updates field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.incident_date) newErrors.incident_date = 'Date is required'
        if (!formData.incident_time) newErrors.incident_time = 'Time is required'
        if (!formData.incident_location) newErrors.incident_location = 'Location is required'
        if (!formData.incident_type) newErrors.incident_type = 'Incident type is required'
        if (!formData.incident_description || formData.incident_description.length < 20)
          newErrors.incident_description = 'Description must be at least 20 characters'
        break
      case 2:
        if (!formData.vehicle_year) newErrors.vehicle_year = 'Year is required'
        if (!formData.vehicle_make) newErrors.vehicle_make = 'Make is required'
        if (!formData.vehicle_model) newErrors.vehicle_model = 'Model is required'
        if (!formData.license_plate) newErrors.license_plate = 'License plate is required'
        break
      case 3:
        if (!formData.insurance_provider) newErrors.insurance_provider = 'Provider is required'
        if (!formData.policy_number) newErrors.policy_number = 'Policy number is required'
        if (!formData.coverage_type) newErrors.coverage_type = 'Coverage type is required'
        if (!formData.deductible) newErrors.deductible = 'Deductible is required'
        break
      case 4:
        if (!formData.damage_description || formData.damage_description.length < 20)
          newErrors.damage_description = 'Damage description must be at least 20 characters'
        if (!formData.damage_severity) newErrors.damage_severity = 'Severity is required'
        break
      case 5:
        if (formData.police_called && !formData.police_report_number) {
          newErrors.police_report_number = 'Report number is required when police were called'
        }
        break
      case 6:
        // Document upload is optional
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)

    try {
      // Create claim data object
      const claimData = {
        incident_data: {
          date: formData.incident_date,
          time: formData.incident_time,
          location: formData.incident_location,
          type: formData.incident_type,
          description: formData.incident_description,
        },
        vehicle_data: {
          year: formData.vehicle_year,
          make: formData.vehicle_make,
          model: formData.vehicle_model,
          license_plate: formData.license_plate,
          vin: formData.vin,
        },
        insurance_data: {
          provider: formData.insurance_provider,
          policy_number: formData.policy_number,
          coverage_type: formData.coverage_type,
          deductible: formData.deductible,
        },
        damage_data: {
          description: formData.damage_description,
          severity: formData.damage_severity,
          photos_uploaded: files.length > 0,
        },
        police_report: formData.police_called
          ? {
              filed: true,
              report_number: formData.police_report_number,
              officer_name: formData.officer_name,
              witness_info: formData.witness_info,
            }
          : { filed: false },
        status: 'draft',
      }

      // If there are files, upload them first
      if (files.length > 0) {
        const uploadFormData = new FormData()
        files.forEach((file) => {
          uploadFormData.append('files', file)
        })
        uploadFormData.append('claim_data', JSON.stringify(claimData))

        const response = await fetch('http://localhost:8000/api/process-full-claim', {
          method: 'POST',
          body: uploadFormData,
        })

        if (!response.ok) throw new Error('Failed to create claim')

        const result = await response.json()
        const claimId = result.claim_id

        if (onComplete) {
          onComplete(claimId)
        } else {
          router.push(`/claim/${claimId}`)
        }
      } else {
        // No files, just create the claim
        const response = await fetch('http://localhost:8000/api/claims', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(claimData),
        })

        if (!response.ok) throw new Error('Failed to create claim')

        const result = await response.json()
        const claimId = result.claim_id

        if (onComplete) {
          onComplete(claimId)
        } else {
          router.push(`/claim/${claimId}`)
        }
      }
    } catch (error) {
      console.error('Error creating claim:', error)
      alert('Failed to create claim. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="incident_date">Date of Incident *</Label>
                <Input
                  id="incident_date"
                  type="date"
                  value={formData.incident_date || ''}
                  onChange={(e) => updateField('incident_date', e.target.value)}
                  className={errors.incident_date ? 'border-red-500' : ''}
                />
                {errors.incident_date && (
                  <p className="text-xs text-red-500">{errors.incident_date}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="incident_time">Time of Incident *</Label>
                <Input
                  id="incident_time"
                  type="time"
                  value={formData.incident_time || ''}
                  onChange={(e) => updateField('incident_time', e.target.value)}
                  className={errors.incident_time ? 'border-red-500' : ''}
                />
                {errors.incident_time && (
                  <p className="text-xs text-red-500">{errors.incident_time}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident_location">Location (Street Address, City, State) *</Label>
              <Input
                id="incident_location"
                placeholder="123 Main St, Princeton, NJ"
                value={formData.incident_location || ''}
                onChange={(e) => updateField('incident_location', e.target.value)}
                className={errors.incident_location ? 'border-red-500' : ''}
              />
              {errors.incident_location && (
                <p className="text-xs text-red-500">{errors.incident_location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident_type">Incident Type *</Label>
              <Select
                value={formData.incident_type}
                onValueChange={(value) => updateField('incident_type', value as IncidentType)}
              >
                <SelectTrigger className={errors.incident_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select incident type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rear-end collision">Rear-End Collision</SelectItem>
                  <SelectItem value="side impact">Side Impact</SelectItem>
                  <SelectItem value="hit-and-run">Hit-and-Run</SelectItem>
                  <SelectItem value="parking lot">Parking Lot</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.incident_type && (
                <p className="text-xs text-red-500">{errors.incident_type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident_description">Incident Description *</Label>
              <Textarea
                id="incident_description"
                placeholder="Describe what happened in detail..."
                rows={4}
                value={formData.incident_description || ''}
                onChange={(e) => updateField('incident_description', e.target.value)}
                className={errors.incident_description ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500">
                {formData.incident_description?.length || 0} characters (minimum 20)
              </p>
              {errors.incident_description && (
                <p className="text-xs text-red-500">{errors.incident_description}</p>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_year">Vehicle Year *</Label>
                <Input
                  id="vehicle_year"
                  type="number"
                  placeholder="2024"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.vehicle_year || ''}
                  onChange={(e) => updateField('vehicle_year', parseInt(e.target.value))}
                  className={errors.vehicle_year ? 'border-red-500' : ''}
                />
                {errors.vehicle_year && (
                  <p className="text-xs text-red-500">{errors.vehicle_year}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_make">Vehicle Make *</Label>
                <Input
                  id="vehicle_make"
                  placeholder="Honda"
                  value={formData.vehicle_make || ''}
                  onChange={(e) => updateField('vehicle_make', e.target.value)}
                  className={errors.vehicle_make ? 'border-red-500' : ''}
                />
                {errors.vehicle_make && (
                  <p className="text-xs text-red-500">{errors.vehicle_make}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_model">Vehicle Model *</Label>
              <Input
                id="vehicle_model"
                placeholder="Accord"
                value={formData.vehicle_model || ''}
                onChange={(e) => updateField('vehicle_model', e.target.value)}
                className={errors.vehicle_model ? 'border-red-500' : ''}
              />
              {errors.vehicle_model && (
                <p className="text-xs text-red-500">{errors.vehicle_model}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_plate">License Plate *</Label>
              <Input
                id="license_plate"
                placeholder="ABC1234"
                value={formData.license_plate || ''}
                onChange={(e) => updateField('license_plate', e.target.value.toUpperCase())}
                className={errors.license_plate ? 'border-red-500' : ''}
              />
              {errors.license_plate && (
                <p className="text-xs text-red-500">{errors.license_plate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vin">VIN (Optional)</Label>
              <Input
                id="vin"
                placeholder="5NPD84LF9RH123456"
                maxLength={17}
                value={formData.vin || ''}
                onChange={(e) => updateField('vin', e.target.value.toUpperCase())}
              />
              <p className="text-xs text-gray-500">17-character Vehicle Identification Number</p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="insurance_provider">Insurance Provider *</Label>
              <Input
                id="insurance_provider"
                placeholder="State Farm"
                value={formData.insurance_provider || ''}
                onChange={(e) => updateField('insurance_provider', e.target.value)}
                className={errors.insurance_provider ? 'border-red-500' : ''}
              />
              {errors.insurance_provider && (
                <p className="text-xs text-red-500">{errors.insurance_provider}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy_number">Policy Number *</Label>
              <Input
                id="policy_number"
                placeholder="SF-987-654-321"
                value={formData.policy_number || ''}
                onChange={(e) => updateField('policy_number', e.target.value)}
                className={errors.policy_number ? 'border-red-500' : ''}
              />
              {errors.policy_number && (
                <p className="text-xs text-red-500">{errors.policy_number}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverage_type">Coverage Type *</Label>
              <Select
                value={formData.coverage_type}
                onValueChange={(value) => updateField('coverage_type', value as CoverageType)}
              >
                <SelectTrigger className={errors.coverage_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select coverage type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  <SelectItem value="collision">Collision</SelectItem>
                  <SelectItem value="liability">Liability</SelectItem>
                </SelectContent>
              </Select>
              {errors.coverage_type && (
                <p className="text-xs text-red-500">{errors.coverage_type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deductible">Deductible Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="deductible"
                  type="number"
                  placeholder="500"
                  min="0"
                  step="50"
                  className={`pl-7 ${errors.deductible ? 'border-red-500' : ''}`}
                  value={formData.deductible || ''}
                  onChange={(e) => updateField('deductible', parseInt(e.target.value))}
                />
              </div>
              {errors.deductible && (
                <p className="text-xs text-red-500">{errors.deductible}</p>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="damage_description">Damage Description *</Label>
              <Textarea
                id="damage_description"
                placeholder="Describe the damage in detail..."
                rows={5}
                value={formData.damage_description || ''}
                onChange={(e) => updateField('damage_description', e.target.value)}
                className={errors.damage_description ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500">
                {formData.damage_description?.length || 0} characters (minimum 20)
              </p>
              {errors.damage_description && (
                <p className="text-xs text-red-500">{errors.damage_description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="damage_severity">Estimated Damage Severity *</Label>
              <Select
                value={formData.damage_severity}
                onValueChange={(value) => updateField('damage_severity', value as DamageSeverity)}
              >
                <SelectTrigger className={errors.damage_severity ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Minor (Cosmetic damage)</SelectItem>
                  <SelectItem value="moderate">Moderate (Functional damage)</SelectItem>
                  <SelectItem value="severe">Severe (Structural damage)</SelectItem>
                </SelectContent>
              </Select>
              {errors.damage_severity && (
                <p className="text-xs text-red-500">{errors.damage_severity}</p>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Were Police Called? *</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={formData.police_called === true ? 'default' : 'outline'}
                  onClick={() => updateField('police_called', true)}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={formData.police_called === false ? 'default' : 'outline'}
                  onClick={() => updateField('police_called', false)}
                >
                  No
                </Button>
              </div>
            </div>

            {formData.police_called && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="police_report_number">Police Report Number *</Label>
                  <Input
                    id="police_report_number"
                    placeholder="PR-2025-001547"
                    value={formData.police_report_number || ''}
                    onChange={(e) => updateField('police_report_number', e.target.value)}
                    className={errors.police_report_number ? 'border-red-500' : ''}
                  />
                  {errors.police_report_number && (
                    <p className="text-xs text-red-500">{errors.police_report_number}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="officer_name">Officer Name (Optional)</Label>
                  <Input
                    id="officer_name"
                    placeholder="Officer Martinez"
                    value={formData.officer_name || ''}
                    onChange={(e) => updateField('officer_name', e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="witness_info">Witness Information (Optional)</Label>
              <Textarea
                id="witness_info"
                placeholder="Name, contact information, and statements from any witnesses..."
                rows={3}
                value={formData.witness_info || ''}
                onChange={(e) => updateField('witness_info', e.target.value)}
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documents">Upload Documents (Optional)</Label>
              <Input
                id="documents"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files) {
                    setFiles(Array.from(e.target.files))
                  }
                }}
              />
              <p className="text-xs text-gray-500">
                Upload police reports, insurance documents, and accident photos (PDF, JPG, PNG)
              </p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files:</Label>
                <ul className="text-sm space-y-1">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{file.name}</span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">You can also upload documents later</h4>
              <p className="text-xs text-gray-600">
                Don&apos;t worry if you don&apos;t have all documents ready. You can upload them after
                creating your claim.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Create New Claim</h2>
        <p className="text-gray-600">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}</p>
      </div>

      <div className="mb-6">
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}

          <div className="flex justify-between mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
            >
              Back
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} variant="gradient">
                Continue
              </Button>
            ) : (
              <Button onClick={handleSubmit} variant="gradient" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Claim...' : 'Submit Claim'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
