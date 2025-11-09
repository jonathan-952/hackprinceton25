'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ClaimFormData, IncidentType, CoverageType, DamageSeverity } from '@/types/claim'

interface ClaimFormProps {
  onComplete?: (claimId: string) => void
}

export function ClaimForm({ onComplete }: ClaimFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<ClaimFormData>>({
    police_called: false,
  })
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Incident validation
    if (!formData.incident_date) newErrors.incident_date = 'Required'
    if (!formData.incident_time) newErrors.incident_time = 'Required'
    if (!formData.incident_location) newErrors.incident_location = 'Required'
    if (!formData.incident_type) newErrors.incident_type = 'Required'
    if (!formData.incident_description || formData.incident_description.length < 20)
      newErrors.incident_description = 'Minimum 20 characters'

    // Vehicle validation
    if (!formData.vehicle_year) newErrors.vehicle_year = 'Required'
    if (!formData.vehicle_make) newErrors.vehicle_make = 'Required'
    if (!formData.vehicle_model) newErrors.vehicle_model = 'Required'
    if (!formData.license_plate) newErrors.license_plate = 'Required'

    // Insurance validation
    if (!formData.insurance_provider) newErrors.insurance_provider = 'Required'
    if (!formData.policy_number) newErrors.policy_number = 'Required'
    if (!formData.coverage_type) newErrors.coverage_type = 'Required'
    if (!formData.deductible) newErrors.deductible = 'Required'

    // Damage validation
    if (!formData.damage_description || formData.damage_description.length < 20)
      newErrors.damage_description = 'Minimum 20 characters'
    if (!formData.damage_severity) newErrors.damage_severity = 'Required'

    // Police report validation
    if (formData.police_called && !formData.police_report_number) {
      newErrors.police_report_number = 'Required when police were called'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

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

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">File Your Claim</h1>
        <p className="text-sm text-gray-600 mt-1">Fill out the information below to submit your claim</p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Incident Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Incident Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="incident_date" className="text-xs font-semibold text-gray-900">Date *</Label>
                <Input
                  id="incident_date"
                  type="date"
                  value={formData.incident_date || ''}
                  onChange={(e) => updateField('incident_date', e.target.value)}
                  className={errors.incident_date ? 'border-red-500' : ''}
                />
                {errors.incident_date && <p className="text-xs text-red-500">{errors.incident_date}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="incident_time" className="text-xs font-semibold text-gray-900">Time *</Label>
                <Input
                  id="incident_time"
                  type="time"
                  value={formData.incident_time || ''}
                  onChange={(e) => updateField('incident_time', e.target.value)}
                  className={errors.incident_time ? 'border-red-500' : ''}
                />
                {errors.incident_time && <p className="text-xs text-red-500">{errors.incident_time}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="incident_location" className="text-xs font-semibold text-gray-900">Location *</Label>
              <Input
                id="incident_location"
                placeholder="123 Main St, Princeton, NJ"
                value={formData.incident_location || ''}
                onChange={(e) => updateField('incident_location', e.target.value)}
                className={errors.incident_location ? 'border-red-500' : ''}
              />
              {errors.incident_location && <p className="text-xs text-red-500">{errors.incident_location}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="incident_type" className="text-xs font-semibold text-gray-900">Incident Type *</Label>
              <Select value={formData.incident_type} onValueChange={(value) => updateField('incident_type', value as IncidentType)}>
                <SelectTrigger className={errors.incident_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rear-end collision">Rear-End Collision</SelectItem>
                  <SelectItem value="side impact">Side Impact</SelectItem>
                  <SelectItem value="hit-and-run">Hit-and-Run</SelectItem>
                  <SelectItem value="parking lot">Parking Lot</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.incident_type && <p className="text-xs text-red-500">{errors.incident_type}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="incident_description" className="text-xs font-semibold text-gray-900">Description *</Label>
              <Textarea
                id="incident_description"
                placeholder="Describe what happened..."
                rows={3}
                value={formData.incident_description || ''}
                onChange={(e) => updateField('incident_description', e.target.value)}
                className={errors.incident_description ? 'border-red-500' : ''}
              />
              {errors.incident_description && <p className="text-xs text-red-500">{errors.incident_description}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Vehicle Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Vehicle Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="vehicle_year" className="text-xs font-semibold text-gray-900">Year *</Label>
                <Input
                  id="vehicle_year"
                  type="number"
                  placeholder="2024"
                  value={formData.vehicle_year || ''}
                  onChange={(e) => updateField('vehicle_year', parseInt(e.target.value))}
                  className={errors.vehicle_year ? 'border-red-500' : ''}
                />
                {errors.vehicle_year && <p className="text-xs text-red-500">{errors.vehicle_year}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vehicle_make" className="text-xs font-semibold text-gray-900">Make *</Label>
                <Input
                  id="vehicle_make"
                  placeholder="Honda"
                  value={formData.vehicle_make || ''}
                  onChange={(e) => updateField('vehicle_make', e.target.value)}
                  className={errors.vehicle_make ? 'border-red-500' : ''}
                />
                {errors.vehicle_make && <p className="text-xs text-red-500">{errors.vehicle_make}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vehicle_model" className="text-xs font-semibold text-gray-900">Model *</Label>
              <Input
                id="vehicle_model"
                placeholder="Accord"
                value={formData.vehicle_model || ''}
                onChange={(e) => updateField('vehicle_model', e.target.value)}
                className={errors.vehicle_model ? 'border-red-500' : ''}
              />
              {errors.vehicle_model && <p className="text-xs text-red-500">{errors.vehicle_model}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="license_plate" className="text-xs font-semibold text-gray-900">License Plate *</Label>
                <Input
                  id="license_plate"
                  placeholder="ABC1234"
                  value={formData.license_plate || ''}
                  onChange={(e) => updateField('license_plate', e.target.value.toUpperCase())}
                  className={errors.license_plate ? 'border-red-500' : ''}
                />
                {errors.license_plate && <p className="text-xs text-red-500">{errors.license_plate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vin" className="text-xs font-semibold text-gray-900">VIN (Optional)</Label>
                <Input
                  id="vin"
                  placeholder="17 characters"
                  maxLength={17}
                  value={formData.vin || ''}
                  onChange={(e) => updateField('vin', e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Insurance Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Insurance Information</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="insurance_provider" className="text-xs font-semibold text-gray-900">Provider *</Label>
              <Input
                id="insurance_provider"
                placeholder="State Farm"
                value={formData.insurance_provider || ''}
                onChange={(e) => updateField('insurance_provider', e.target.value)}
                className={errors.insurance_provider ? 'border-red-500' : ''}
              />
              {errors.insurance_provider && <p className="text-xs text-red-500">{errors.insurance_provider}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="policy_number" className="text-xs font-semibold text-gray-900">Policy Number *</Label>
              <Input
                id="policy_number"
                placeholder="SF-987-654-321"
                value={formData.policy_number || ''}
                onChange={(e) => updateField('policy_number', e.target.value)}
                className={errors.policy_number ? 'border-red-500' : ''}
              />
              {errors.policy_number && <p className="text-xs text-red-500">{errors.policy_number}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="coverage_type" className="text-xs font-semibold text-gray-900">Coverage Type *</Label>
                <Select value={formData.coverage_type} onValueChange={(value) => updateField('coverage_type', value as CoverageType)}>
                  <SelectTrigger className={errors.coverage_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="collision">Collision</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                  </SelectContent>
                </Select>
                {errors.coverage_type && <p className="text-xs text-red-500">{errors.coverage_type}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deductible" className="text-xs font-semibold text-gray-900">Deductible *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <Input
                    id="deductible"
                    type="number"
                    placeholder="500"
                    className={`pl-7 ${errors.deductible ? 'border-red-500' : ''}`}
                    value={formData.deductible || ''}
                    onChange={(e) => updateField('deductible', parseInt(e.target.value))}
                  />
                </div>
                {errors.deductible && <p className="text-xs text-red-500">{errors.deductible}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Damage Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Damage Details</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="damage_description" className="text-xs font-semibold text-gray-900">Description *</Label>
              <Textarea
                id="damage_description"
                placeholder="Describe the damage..."
                rows={3}
                value={formData.damage_description || ''}
                onChange={(e) => updateField('damage_description', e.target.value)}
                className={errors.damage_description ? 'border-red-500' : ''}
              />
              {errors.damage_description && <p className="text-xs text-red-500">{errors.damage_description}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="damage_severity" className="text-xs font-semibold text-gray-900">Severity *</Label>
              <Select value={formData.damage_severity} onValueChange={(value) => updateField('damage_severity', value as DamageSeverity)}>
                <SelectTrigger className={errors.damage_severity ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
              {errors.damage_severity && <p className="text-xs text-red-500">{errors.damage_severity}</p>}
            </div>
          </div>
        </div>

        {/* Section 5: Police Report */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Police Report</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">Were police called? *</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant={formData.police_called === true ? 'default' : 'outline'}
                  onClick={() => updateField('police_called', true)}
                  className="flex-1"
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={formData.police_called === false ? 'default' : 'outline'}
                  onClick={() => updateField('police_called', false)}
                  className="flex-1"
                >
                  No
                </Button>
              </div>
            </div>

            {formData.police_called && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="police_report_number" className="text-xs font-semibold text-gray-900">Report Number *</Label>
                  <Input
                    id="police_report_number"
                    placeholder="PR-2025-001547"
                    value={formData.police_report_number || ''}
                    onChange={(e) => updateField('police_report_number', e.target.value)}
                    className={errors.police_report_number ? 'border-red-500' : ''}
                  />
                  {errors.police_report_number && <p className="text-xs text-red-500">{errors.police_report_number}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="officer_name" className="text-xs font-semibold text-gray-900">Officer Name (Optional)</Label>
                  <Input
                    id="officer_name"
                    placeholder="Officer Martinez"
                    value={formData.officer_name || ''}
                    onChange={(e) => updateField('officer_name', e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="witness_info" className="text-xs font-semibold text-gray-900">Witness Info (Optional)</Label>
              <Textarea
                id="witness_info"
                placeholder="Name, contact, statements..."
                rows={2}
                value={formData.witness_info || ''}
                onChange={(e) => updateField('witness_info', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 6: Documents */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Documents (Optional)</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="documents" className="text-xs font-semibold text-gray-900">Upload Files</Label>
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
              <p className="text-xs text-gray-500">Police reports, photos (PDF, JPG, PNG)</p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Selected:</p>
                <ul className="space-y-1">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                      <span className="text-gray-900">{file.name}</span>
                      <span className="text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-6 -mb-6 px-6 py-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            size="lg"
          >
            {isSubmitting ? 'Submitting Claim...' : 'Submit Claim'}
          </Button>
        </div>
      </div>
    </div>
  )
}
