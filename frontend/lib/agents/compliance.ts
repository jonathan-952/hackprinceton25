/**
 * Compliance & Submission Validation Agent
 */

export interface ComplianceInput {
  policy_number?: string;
  incident_date?: string;
  location?: string;
  damage_description?: string;
  document_uploaded?: boolean;
  claimant_name?: string;
  vehicle_info?: any;
  insurance_info?: any;
}

export interface ComplianceCheck {
  field: string;
  required: boolean;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ComplianceOutput {
  all_checks_passed: boolean;
  ready_to_submit: boolean;
  checks: ComplianceCheck[];
  missing_fields: string[];
  warnings: string[];
  completion_percentage: number;
}

/**
 * Validate claim for compliance and completeness
 */
export function validateClaim(input: ComplianceInput): ComplianceOutput {
  const checks: ComplianceCheck[] = [];

  // Policy Number Check
  checks.push({
    field: 'policy_number',
    required: true,
    passed: !!input.policy_number,
    message: input.policy_number
      ? 'Policy number provided'
      : 'Policy number is required for claim submission',
    severity: input.policy_number ? 'info' : 'error'
  });

  // Incident Date Check
  checks.push({
    field: 'incident_date',
    required: true,
    passed: !!input.incident_date && isValidDate(input.incident_date),
    message: input.incident_date
      ? 'Incident date provided'
      : 'Valid incident date is required',
    severity: input.incident_date ? 'info' : 'error'
  });

  // Location Check
  checks.push({
    field: 'location',
    required: true,
    passed: !!input.location && input.location.length > 5,
    message: input.location && input.location.length > 5
      ? 'Incident location provided'
      : 'Detailed location is required (street address preferred)',
    severity: input.location && input.location.length > 5 ? 'info' : 'error'
  });

  // Damage Description Check
  const minDescriptionLength = 20;
  checks.push({
    field: 'damage_description',
    required: true,
    passed: !!input.damage_description && input.damage_description.length >= minDescriptionLength,
    message: input.damage_description && input.damage_description.length >= minDescriptionLength
      ? `Damage description provided (${input.damage_description.length} characters)`
      : `Damage description must be at least ${minDescriptionLength} characters`,
    severity: input.damage_description && input.damage_description.length >= minDescriptionLength ? 'info' : 'error'
  });

  // Document Upload Check
  checks.push({
    field: 'document_upload',
    required: true,
    passed: !!input.document_uploaded,
    message: input.document_uploaded
      ? 'Supporting documents uploaded'
      : 'Please upload police report or incident documentation',
    severity: input.document_uploaded ? 'info' : 'error'
  });

  // Claimant Name Check
  checks.push({
    field: 'claimant_name',
    required: true,
    passed: !!input.claimant_name,
    message: input.claimant_name
      ? 'Claimant name provided'
      : 'Claimant name is required',
    severity: input.claimant_name ? 'info' : 'error'
  });

  // Optional but recommended: Vehicle Info
  if (input.vehicle_info) {
    const hasVin = !!input.vehicle_info.vin;
    const hasPlate = !!input.vehicle_info.license_plate;

    checks.push({
      field: 'vehicle_identification',
      required: false,
      passed: hasVin || hasPlate,
      message: hasVin || hasPlate
        ? 'Vehicle identification provided'
        : 'VIN or license plate recommended for faster processing',
      severity: hasVin || hasPlate ? 'info' : 'warning'
    });
  }

  // Optional but recommended: Insurance Provider
  if (input.insurance_info?.provider) {
    checks.push({
      field: 'insurance_provider',
      required: false,
      passed: true,
      message: 'Insurance provider information included',
      severity: 'info'
    });
  }

  // Calculate results
  const requiredChecks = checks.filter(c => c.required);
  const passedRequired = requiredChecks.filter(c => c.passed).length;
  const allChecksPassed = requiredChecks.every(c => c.passed);
  const missing_fields = checks.filter(c => c.required && !c.passed).map(c => c.field);
  const warnings = checks.filter(c => c.severity === 'warning').map(c => c.message);

  const completion_percentage = Math.round((passedRequired / requiredChecks.length) * 100);

  return {
    all_checks_passed: allChecksPassed,
    ready_to_submit: allChecksPassed,
    checks,
    missing_fields,
    warnings,
    completion_percentage
  };
}

/**
 * Validate date format and reasonableness
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;

  // Check if date is not in the future
  if (date > new Date()) return false;

  // Check if date is not too far in the past (e.g., more than 1 year)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  if (date < oneYearAgo) return false;

  return true;
}

/**
 * Get next steps based on compliance status
 */
export function getNextSteps(complianceResult: ComplianceOutput): string[] {
  const steps: string[] = [];

  if (complianceResult.ready_to_submit) {
    steps.push('Review all claim details for accuracy');
    steps.push('Submit claim to insurance provider');
    steps.push('Save confirmation number for your records');
    return steps;
  }

  // Add steps for missing required fields
  if (complianceResult.missing_fields.length > 0) {
    complianceResult.missing_fields.forEach(field => {
      switch (field) {
        case 'policy_number':
          steps.push('Add your insurance policy number');
          break;
        case 'incident_date':
          steps.push('Provide the date of the incident');
          break;
        case 'location':
          steps.push('Enter the detailed location of the incident');
          break;
        case 'damage_description':
          steps.push('Provide a detailed description of the damage');
          break;
        case 'document_upload':
          steps.push('Upload supporting documents (police report, photos)');
          break;
        case 'claimant_name':
          steps.push('Provide your full name');
          break;
      }
    });
  }

  // Add warning-based steps
  if (complianceResult.warnings.length > 0) {
    steps.push('Consider adding vehicle VIN or license plate for faster processing');
  }

  return steps;
}
