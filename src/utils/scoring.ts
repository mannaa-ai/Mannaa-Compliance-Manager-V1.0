import type { AssessmentRecord, Framework, ComplianceStatus, CMMILevel } from '../types';

export interface DomainScore {
  domainId: string;
  domainName: string;
  weight: number;
  totalControls: number;
  assessedControls: number;
  
  // Model 1: Status percentages
  compliantCount: number;
  partiallyCompliantCount: number;
  nonCompliantCount: number;
  notApplicableCount: number;
  statusScorePercentage: number; // (Compliant*100 + Partial*50) / (ApplicableControls * 100)
  
  // Model 2: CMMI Average (0 - 5)
  averageCmmiLevel: number;
  
  // Model 3: Weighted Percentage
  weightedScorePercentage: number;
}

export interface FrameworkComplianceSummary {
  frameworkId: string;
  frameworkName: string;
  totalControls: number;
  assessedControls: number;
  completionRate: number; // percentage of controls assessed
  
  // Overall Scoring Results
  overallStatusScore: number; // 0 - 100%
  overallCmmiMaturity: number; // 0.0 - 5.0
  overallWeightedScore: number; // 0 - 100%
  
  domainBreakdown: DomainScore[];
  statusDistribution: {
    compliant: number;
    partiallyCompliant: number;
    nonCompliant: number;
    notApplicable: number;
    notAssessed: number;
  };
  remediationStats: {
    totalFindings: number;
    criticalFindings: number;
    highFindings: number;
    mediumFindings: number;
    lowFindings: number;
    remediatedCount: number;
  };
}

export function calculateFrameworkScores(
  framework: Framework,
  assessments: AssessmentRecord[]
): FrameworkComplianceSummary {
  const assessmentMap = new Map<string, AssessmentRecord>();
  assessments.forEach(a => assessmentMap.set(a.controlId, a));

  let totalFrameworkWeight = 0;
  let accumulatedWeightedScore = 0;
  let totalCmmiSum = 0;
  let applicableControlsCount = 0;
  let assessedCount = 0;

  const statusDistribution = {
    compliant: 0,
    partiallyCompliant: 0,
    nonCompliant: 0,
    notApplicable: 0,
    notAssessed: 0
  };

  const remediationStats = {
    totalFindings: 0,
    criticalFindings: 0,
    highFindings: 0,
    mediumFindings: 0,
    lowFindings: 0,
    remediatedCount: 0
  };

  const domainBreakdown: DomainScore[] = framework.domains.map(domain => {
    const domainControls = framework.controls.filter(c => c.domainId === domain.id);
    let domainWeight = domain.weight || 10;
    let domainApplicableCount = 0;
    let domainCompliant = 0;
    let domainPartial = 0;
    let domainNonCompliant = 0;
    let domainNA = 0;
    let domainCmmiSum = 0;
    let domainWeightedEarned = 0;
    let domainTotalControlWeight = 0;
    let domainAssessed = 0;

    domainControls.forEach(ctrl => {
      const record = assessmentMap.get(ctrl.id);
      const ctrlWeight = ctrl.weight || 5;

      if (!record || record.status === 'NOT_ASSESSED') {
        statusDistribution.notAssessed++;
        return;
      }

      domainAssessed++;
      assessedCount++;

      // Track findings & remediations
      if (record.finding || record.remediationPlan || record.status === 'NON_COMPLIANT' || record.status === 'PARTIALLY_COMPLIANT') {
        remediationStats.totalFindings++;
        if (record.actionPriority === 'CRITICAL') remediationStats.criticalFindings++;
        else if (record.actionPriority === 'HIGH') remediationStats.highFindings++;
        else if (record.actionPriority === 'MEDIUM') remediationStats.mediumFindings++;
        else remediationStats.lowFindings++;
        if (record.isRemediated) remediationStats.remediatedCount++;
      }

      if (record.status === 'NOT_APPLICABLE') {
        domainNA++;
        statusDistribution.notApplicable++;
        return;
      }

      domainApplicableCount++;
      applicableControlsCount++;
      domainTotalControlWeight += ctrlWeight;
      totalFrameworkWeight += ctrlWeight;

      // Status scoring
      if (record.status === 'COMPLIANT') {
        domainCompliant++;
        statusDistribution.compliant++;
        domainWeightedEarned += ctrlWeight * 1.0;
        accumulatedWeightedScore += ctrlWeight * 1.0;
      } else if (record.status === 'PARTIALLY_COMPLIANT') {
        domainPartial++;
        statusDistribution.partiallyCompliant++;
        domainWeightedEarned += ctrlWeight * 0.5;
        accumulatedWeightedScore += ctrlWeight * 0.5;
      } else if (record.status === 'NON_COMPLIANT') {
        domainNonCompliant++;
        statusDistribution.nonCompliant++;
        // 0 points
      }

      // CMMI scoring
      const cmmi = record.cmmiLevel ?? (record.status === 'COMPLIANT' ? 4 : record.status === 'PARTIALLY_COMPLIANT' ? 2 : 0);
      domainCmmiSum += cmmi;
      totalCmmiSum += cmmi;
    });

    const statusScorePercentage = domainApplicableCount > 0
      ? Math.round(((domainCompliant * 100 + domainPartial * 50) / (domainApplicableCount * 100)) * 100)
      : 100;

    const averageCmmiLevel = domainApplicableCount > 0
      ? Number((domainCmmiSum / domainApplicableCount).toFixed(2))
      : 0;

    const weightedScorePercentage = domainTotalControlWeight > 0
      ? Math.round((domainWeightedEarned / domainTotalControlWeight) * 100)
      : 100;

    return {
      domainId: domain.id,
      domainName: domain.name,
      weight: domainWeight,
      totalControls: domainControls.length,
      assessedControls: domainAssessed,
      compliantCount: domainCompliant,
      partiallyCompliantCount: domainPartial,
      nonCompliantCount: domainNonCompliant,
      notApplicableCount: domainNA,
      statusScorePercentage,
      averageCmmiLevel,
      weightedScorePercentage
    };
  });

  const totalControls = framework.controls.length;
  const completionRate = totalControls > 0 ? Math.round((assessedCount / totalControls) * 100) : 0;

  const overallStatusScore = applicableControlsCount > 0
    ? Math.round(((statusDistribution.compliant * 100 + statusDistribution.partiallyCompliant * 50) / (applicableControlsCount * 100)) * 100)
    : 0;

  const overallCmmiMaturity = applicableControlsCount > 0
    ? Number((totalCmmiSum / applicableControlsCount).toFixed(2))
    : 0;

  const overallWeightedScore = totalFrameworkWeight > 0
    ? Math.round((accumulatedWeightedScore / totalFrameworkWeight) * 100)
    : 0;

  return {
    frameworkId: framework.id,
    frameworkName: framework.name,
    totalControls,
    assessedControls: assessedCount,
    completionRate,
    overallStatusScore,
    overallCmmiMaturity,
    overallWeightedScore,
    domainBreakdown,
    statusDistribution,
    remediationStats
  };
}
