/**
 * DOGE Job Loss Risk Calculator
 * Main JavaScript module for calculating job loss risk based on DOGE-era factors
 */

class DOGERiskCalculator {
    constructor() {
        this.agencyRiskMappings = this.initializeAgencyRiskMappings();
        this.riskFactorWeights = this.initializeRiskFactorWeights();
        this.timeframeParameters = this.initializeTimeframeParameters();
        this.init();
    }

    /**
     * Initialize agency-specific risk mappings based on report data
     */
    initializeAgencyRiskMappings() {
        return {
            'cfpb': 50,        // Consumer Financial Protection Bureau - essentially shut down
            'education': 15,   // Department of Education - heavy cuts, contracts terminated
            'hhs': 12,         // Health and Human Services - large cuts planned, ideological targeting
            'irs': 12,         // Internal Revenue Service - thousands of cuts, especially new hires
            'state': 10,       // State Department - many senior diplomats pushed out
            'epa': 15,         // Environmental Protection Agency - likely ideological targeting
            'dhs': 8,          // Department of Homeland Security - some cuts but essential services
            'usda': 8,         // Department of Agriculture - moderate cuts, some essential staff retained
            'interior': 8,     // Department of Interior - some cuts but restoration pressure
            'dod': -3,         // Department of Defense - national security priority, fewer cuts
            'va': 5,           // Department of Veterans Affairs - some cuts but political blowback protection
            'treasury': 5,     // Department of Treasury - some cuts reported
            'justice': 8,      // Department of Justice - some targeting of career officials
            'energy': 10,      // Department of Energy - research cuts, climate-related targeting
            'nsf': 10,         // National Science Foundation - research funding cuts
            'nasa': 8,         // NASA - research agency, moderate risk
            'usaid': 15,       // USAID - foreign aid cuts, many layoffs
            'commerce': 5,     // Department of Commerce - moderate risk
            'labor': 6,        // Department of Labor - some regulatory targeting
            'transportation': 3, // Department of Transportation - infrastructure priority
            'housing': 8,      // Department of Housing - social programs potentially targeted
            'other': 5         // Other agencies - average risk
        };
    }

    /**
     * Initialize risk factor weights for scoring system
     */
    initializeRiskFactorWeights() {
        return {
            employmentType: {
                'federal': 0,      // Base federal risk
                'contractor': -1,  // Slightly lower base
                'grant': 0,        // Similar to federal
                'nonprofit': 2,    // Dependent on federal funds
                'private': -20     // Minimal DOGE risk
            },
            tenure: {
                'probationary': 25, // Extremely high risk
                'new': 12,          // High risk
                'established': 0,   // Baseline
                'senior': -5        // Some protection
            },
            programAreas: {
                'climate': 8,       // Ideologically targeted
                'equity': 8,        // Ideologically targeted
                'research': 6,      // Research cuts
                'defense': -6,      // Protected area
                'admin': 5,         // Seen as overhead
                'regulatory': 7     // Anti-regulation sentiment
            },
            roleFactors: {
                'essential': -8,    // Essential role protection
                'senior': 12,       // Political sensitivity risk
                'survived': -6      // Survived previous cuts
            },
            fundingStatus: {
                'stable': 0,        // No additional risk
                'uncertain': 8,     // Uncertainty adds risk
                'reduced': 20       // Very high risk if funding cut
            }
        };
    }

    /**
     * Initialize timeframe-specific logistic regression parameters
     */
    initializeTimeframeParameters() {
        return {
            oneMonth: { intercept: -3.5, coefficient: 0.11 },
            threeMonths: { intercept: -3.0, coefficient: 0.11 },
            sixMonths: { intercept: -2.6, coefficient: 0.11 },
            oneYear: { intercept: -2.2, coefficient: 0.11 },
            twoYears: { intercept: -1.5, coefficient: 0.11 },
            threeYears: { intercept: -1.2, coefficient: 0.11 }
        };
    }

    /**
     * Initialize event listeners and form handling
     */
    init() {
        const form = document.getElementById('riskForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Add real-time validation if needed
        this.setupFormValidation();
    }

    /**
     * Setup form validation and user experience enhancements
     */
    setupFormValidation() {
        const employmentTypeSelect = document.getElementById('employmentType');
        const agencySelect = document.getElementById('agency');

        if (employmentTypeSelect && agencySelect) {
            employmentTypeSelect.addEventListener('change', (e) => {
                // Show/hide agency field based on employment type
                const showAgency = ['federal', 'contractor', 'grant', 'nonprofit'].includes(e.target.value);
                agencySelect.parentElement.style.display = showAgency ? 'block' : 'none';
                if (!showAgency) {
                    agencySelect.value = '';
                }
            });
        }
    }

    /**
     * Handle form submission and calculate risk
     */
    handleFormSubmit(event) {
        event.preventDefault();
        
        try {
            const formData = this.collectFormData();
            const riskScore = this.calculateRiskScore(formData);
            const probabilities = this.calculateProbabilities(riskScore);
            
            this.displayResults(probabilities, riskScore, formData);
            this.scrollToResults();
            
        } catch (error) {
            console.error('Error calculating risk:', error);
            this.showError('An error occurred while calculating your risk. Please try again.');
        }
    }

    /**
     * Collect and validate form data
     */
    collectFormData() {
        const formData = {
            employmentType: this.getSelectValue('employmentType'),
            agency: this.getSelectValue('agency'),
            tenure: this.getSelectValue('tenure'),
            essential: this.getSelectValue('essential') === 'yes',
            senior: this.getSelectValue('senior') === 'yes',
            survived: this.getSelectValue('survived') === 'yes',
            funding: this.getSelectValue('funding'),
            programAreas: this.getCheckedValues('programArea')
        };

        // Validate required fields
        if (!formData.employmentType || !formData.tenure) {
            throw new Error('Please fill in all required fields');
        }

        return formData;
    }

    /**
     * Get value from select element
     */
    getSelectValue(elementId) {
        const element = document.getElementById(elementId);
        return element ? element.value : '';
    }

    /**
     * Get checked checkbox values
     */
    getCheckedValues(name) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
        return Array.from(checkboxes).map(cb => cb.value);
    }

    /**
     * Calculate risk score based on form data
     */
    calculateRiskScore(formData) {
        let score = 0;

        // Employment type base adjustment
        score += this.riskFactorWeights.employmentType[formData.employmentType] || 0;

        // Tenure adjustment
        score += this.riskFactorWeights.tenure[formData.tenure] || 0;

        // Agency-specific risk
        if (formData.agency && this.agencyRiskMappings[formData.agency]) {
            score += this.agencyRiskMappings[formData.agency];
        }

        // Role factors
        if (formData.essential) {
            score += this.riskFactorWeights.roleFactors.essential;
        }
        if (formData.senior) {
            score += this.riskFactorWeights.roleFactors.senior;
        }
        if (formData.survived) {
            score += this.riskFactorWeights.roleFactors.survived;
        }

        // Program areas
        formData.programAreas.forEach(area => {
            if (this.riskFactorWeights.programAreas[area]) {
                score += this.riskFactorWeights.programAreas[area];
            }
        });

        // Funding status
        score += this.riskFactorWeights.fundingStatus[formData.funding] || 0;

        return score;
    }

    /**
     * Calculate probabilities using logistic regression for different timeframes
     */
    calculateProbabilities(score) {
        const probabilities = {};
        
        Object.entries(this.timeframeParameters).forEach(([timeframe, params]) => {
            const z = params.intercept + (params.coefficient * score);
            const probability = this.logistic(z);
            probabilities[timeframe] = Math.round(probability * 100);
        });

        return probabilities;
    }

    /**
     * Logistic function for probability calculation
     */
    logistic(z) {
        return 1 / (1 + Math.exp(-z));
    }

    /**
     * Display calculation results
     */
    displayResults(probabilities, score, formData) {
        const resultsContainer = document.getElementById('results');
        const timelineContainer = document.getElementById('riskTimeline');
        const interpretationContainer = document.getElementById('interpretation');

        if (!resultsContainer || !timelineContainer || !interpretationContainer) {
            throw new Error('Required result containers not found');
        }

        // Display timeline results
        timelineContainer.innerHTML = this.generateTimelineHTML(probabilities);

        // Display interpretation
        interpretationContainer.innerHTML = this.generateInterpretationHTML(probabilities, score, formData);

        // Show results
        resultsContainer.style.display = 'block';
    }

    /**
     * Generate timeline HTML for risk probabilities
     */
    generateTimelineHTML(probabilities) {
        const timeframes = [
            { key: 'oneMonth', label: '1 Month' },
            { key: 'threeMonths', label: '3 Months' },
            { key: 'sixMonths', label: '6 Months' },
            { key: 'oneYear', label: '1 Year' },
            { key: 'twoYears', label: '2 Years' },
            { key: 'threeYears', label: '3 Years' }
        ];

        return timeframes.map(timeframe => {
            const percentage = probabilities[timeframe.key];
            const riskLevel = this.getRiskLevel(percentage);
            
            return `
                <div class="risk-item">
                    <h3>${timeframe.label}</h3>
                    <div class="risk-percentage ${riskLevel}">${percentage}%</div>
                    <div class="risk-label ${riskLevel}">${this.getRiskLabelText(percentage)}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Generate interpretation HTML based on risk assessment
     */
    generateInterpretationHTML(probabilities, score, formData) {
        const oneYearRisk = probabilities.oneYear;
        let interpretation = this.getMainInterpretation(oneYearRisk);
        
        interpretation += this.generateRecommendations(oneYearRisk, formData);
        interpretation += this.generateSpecificFactors(formData, score);
        
        return interpretation;
    }

    /**
     * Get main risk interpretation based on one-year probability
     */
    getMainInterpretation(oneYearRisk) {
        if (oneYearRisk < 15) {
            return `
                <h3>🟢 Low Risk Assessment</h3>
                <p>Your risk of job loss due to DOGE initiatives appears relatively low. Your position characteristics suggest you're in a more protected category. However, continue monitoring your agency's situation and consider developing contingency plans.</p>
            `;
        } else if (oneYearRisk < 35) {
            return `
                <h3>🟡 Moderate Risk Assessment</h3>
                <p>You face moderate risk of job loss in the current environment. While not in the highest risk category, it's advisable to stay informed about your agency's plans and consider updating your resume and professional network.</p>
            `;
        } else if (oneYearRisk < 70) {
            return `
                <h3>🟠 High Risk Assessment</h3>
                <p>Your profile indicates elevated risk for job loss due to DOGE cuts. Consider actively preparing for potential job transitions, including updating your resume, expanding your network, and exploring alternative employment options.</p>
            `;
        } else {
            return `
                <h3>🔴 Critical Risk Assessment</h3>
                <p>Based on current DOGE patterns, your risk of job loss is very high. Immediate preparation for job transition is strongly recommended, including active job searching, financial planning, and considering relocation if necessary.</p>
            `;
        }
    }

    /**
     * Generate specific recommendations based on risk level
     */
    generateRecommendations(oneYearRisk, formData) {
        let recommendations = `<h4>📋 Recommended Actions:</h4><ul>`;
        
        if (oneYearRisk > 70) {
            recommendations += `<li><strong>Immediate:</strong> Begin active job searching and consider emergency financial planning</li>`;
            recommendations += `<li><strong>Financial:</strong> Build emergency reserves for 6+ months of expenses</li>`;
            recommendations += `<li><strong>Legal:</strong> Consult with employment attorney about rights and severance</li>`;
        }
        
        if (oneYearRisk > 50) {
            recommendations += `<li><strong>Career:</strong> Begin active job searching immediately</li>`;
            recommendations += `<li><strong>Skills:</strong> Consider rapid certification or training programs</li>`;
            recommendations += `<li><strong>Network:</strong> Leverage professional contacts and alumni networks</li>`;
        }
        
        if (oneYearRisk > 30) {
            recommendations += `<li><strong>Resume:</strong> Update and optimize your resume and LinkedIn profile</li>`;
            recommendations += `<li><strong>Networking:</strong> Attend industry events and expand professional contacts</li>`;
            recommendations += `<li><strong>Skills:</strong> Pursue relevant professional development or certifications</li>`;
        }
        
        // Universal recommendations
        recommendations += `<li><strong>Monitoring:</strong> Stay informed about your agency's specific DOGE implementation</li>`;
        recommendations += `<li><strong>Alternatives:</strong> Explore career paths that leverage your transferable skills</li>`;
        recommendations += `<li><strong>Documentation:</strong> Keep records of performance reviews and achievements</li>`;
        
        if (formData.employmentType === 'grant' || formData.employmentType === 'contractor') {
            recommendations += `<li><strong>Funding:</strong> Diversify funding sources and maintain relationships with multiple sponsors</li>`;
        }
        
        recommendations += `</ul>`;
        return recommendations;
    }

    /**
     * Generate specific risk factors explanation
     */
    generateSpecificFactors(formData, score) {
        let factors = `<h4>🎯 Key Risk Factors in Your Profile:</h4><ul>`;
        
        if (formData.tenure === 'probationary') {
            factors += `<li><strong>High Risk:</strong> Probationary status makes you vulnerable to immediate layoffs</li>`;
        }
        
        if (formData.agency && this.agencyRiskMappings[formData.agency] > 10) {
            factors += `<li><strong>Agency Risk:</strong> Your agency has been targeted for significant cuts</li>`;
        }
        
        if (formData.programAreas.includes('climate') || formData.programAreas.includes('equity')) {
            factors += `<li><strong>Program Risk:</strong> Your work area has been ideologically targeted for elimination</li>`;
        }
        
        if (formData.funding === 'reduced') {
            factors += `<li><strong>Funding Risk:</strong> Current funding cuts significantly increase immediate risk</li>`;
        }
        
        if (formData.essential) {
            factors += `<li><strong>Protective Factor:</strong> Essential role status provides some protection</li>`;
        }
        
        if (formData.survived) {
            factors += `<li><strong>Protective Factor:</strong> Surviving previous cuts suggests your role may be valued</li>`;
        }
        
        factors += `</ul>`;
        factors += `<p><small><strong>Risk Score:</strong> ${score} (Higher scores indicate greater risk)</small></p>`;
        
        return factors;
    }

    /**
     * Get risk level classification for styling
     */
    getRiskLevel(percentage) {
        if (percentage < 15) return 'risk-low';
        if (percentage < 35) return 'risk-medium';
        if (percentage < 70) return 'risk-high';
        return 'risk-critical';
    }

    /**
     * Get risk level text label
     */
    getRiskLabelText(percentage) {
        if (percentage < 15) return 'Low Risk';
        if (percentage < 35) return 'Moderate Risk';
        if (percentage < 70) return 'High Risk';
        return 'Critical Risk';
    }

    /**
     * Scroll to results section smoothly
     */
    scrollToResults() {
        const resultsElement = document.getElementById('results');
        if (resultsElement) {
            resultsElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * Show error message to user
     */
    showError(message) {
        // Create or update error display
        let errorElement = document.getElementById('error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'error-message';
            errorElement.style.cssText = `
                background: #f8d7da;
                color: #721c24;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                border: 1px solid #f5c6cb;
            `;
            
            const form = document.getElementById('riskForm');
            if (form) {
                form.insertBefore(errorElement, form.firstChild);
            }
        }
        
        errorElement.textContent = message;
        errorElement.scrollIntoView({ behavior: 'smooth' });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.parentNode.removeChild(errorElement);
            }
        }, 5000);
    }
}

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DOGERiskCalculator();
});

// Export for potential future use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOGERiskCalculator;
}