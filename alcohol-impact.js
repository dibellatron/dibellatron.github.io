/**
 * Alcohol Impact Calculator
 * Calculates health, financial, and lifestyle impacts of alcohol consumption
 */

class AlcoholImpactCalculator {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Allow Enter key to calculate
        document.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.calculateImpact();
            }
        });
    }

    /**
     * Main calculation function
     */
    calculateImpact() {
        const inputs = this.getInputs();
        if (!this.validateInputs(inputs)) {
            return;
        }

        const results = {
            longevity: this.calculateLongevityImpact(inputs),
            financial: inputs.costPerDrink ? this.calculateFinancialImpact(inputs) : null,
            health: this.calculateHealthMetrics(inputs),
            liver: this.calculateLiverHealth(inputs),
            recovery: this.calculateRecoveryBenefits(inputs)
        };

        this.displayResults(results, inputs);
    }

    /**
     * Get and parse input values
     */
    getInputs() {
        return {
            drinksPerWeek: parseFloat(document.getElementById('drinksPerWeek').value) || 0,
            yearsOfDrinking: parseFloat(document.getElementById('yearsOfDrinking').value) || 0,
            costPerDrink: parseFloat(document.getElementById('costPerDrink').value) || null,
            bodyWeight: parseFloat(document.getElementById('bodyWeight').value) || 150
        };
    }

    /**
     * Validate user inputs
     */
    validateInputs(inputs) {
        if (inputs.drinksPerWeek < 0 || inputs.yearsOfDrinking < 0) {
            alert('Please enter valid positive numbers for drinks per week and years of drinking.');
            return false;
        }
        if (inputs.drinksPerWeek === 0) {
            alert('Please enter a value greater than 0 for drinks per week.');
            return false;
        }
        return true;
    }

    /**
     * Calculate longevity impact based on research
     */
    calculateLongevityImpact(inputs) {
        const { drinksPerWeek, yearsOfDrinking } = inputs;
        
        // Base calculation from research: 1.09 years lost per log(drinks per week)
        const logDrinksPerWeek = Math.log(drinksPerWeek + 1);
        let yearsLost = logDrinksPerWeek * 1.09;
        
        // Apply duration factor (non-linear relationship)
        const durationMultiplier = Math.sqrt(yearsOfDrinking / 10);
        yearsLost *= durationMultiplier;
        
        // Additional penalty for heavy drinking (>14 drinks/week)
        if (drinksPerWeek > 14) {
            const excessDrinks = drinksPerWeek - 14;
            yearsLost += (excessDrinks * 0.15 * Math.sqrt(yearsOfDrinking));
        }
        
        // Cap maximum years lost
        yearsLost = Math.min(yearsLost, 25);
        
        // Determine consumption level and risk
        const consumptionData = this.getConsumptionLevel(drinksPerWeek);
        
        return {
            yearsLost: yearsLost,
            consumptionLevel: consumptionData.level,
            consumptionClass: consumptionData.class,
            riskCategory: consumptionData.risk,
            riskClass: consumptionData.riskClass
        };
    }

    /**
     * Calculate financial impact
     */
    calculateFinancialImpact(inputs) {
        const { drinksPerWeek, yearsOfDrinking, costPerDrink } = inputs;
        
        const totalDrinks = drinksPerWeek * yearsOfDrinking * 52;
        const totalCost = totalDrinks * costPerDrink;
        const annualCost = drinksPerWeek * 52 * costPerDrink;
        
        // Calculate investment opportunity cost (7% annual return)
        const monthlyInvestment = annualCost / 12;
        const months = yearsOfDrinking * 12;
        const monthlyRate = 0.07 / 12;
        
        let investmentValue = 0;
        if (monthlyRate > 0) {
            investmentValue = monthlyInvestment * (((1 + monthlyRate) ** months - 1) / monthlyRate);
        } else {
            investmentValue = monthlyInvestment * months;
        }
        
        const opportunityCost = investmentValue - totalCost;
        
        return {
            totalCost,
            investmentValue,
            opportunityCost,
            annualCost
        };
    }

    /**
     * Calculate health metrics
     */
    calculateHealthMetrics(inputs) {
        const { drinksPerWeek, yearsOfDrinking, bodyWeight } = inputs;
        
        // Calories per drink (average ~150 calories)
        const caloriesPerDrink = 150;
        const totalCalories = drinksPerWeek * yearsOfDrinking * 52 * caloriesPerDrink;
        
        // Weight gain potential - more realistic calculation
        // Not all excess calories convert to weight gain due to metabolism, activity, etc.
        // Use net excess calories above baseline metabolism
        const excessCaloriesPerWeek = drinksPerWeek * caloriesPerDrink;
        const excessCaloriesPerYear = excessCaloriesPerWeek * 52;
        const totalExcessCalories = excessCaloriesPerYear * yearsOfDrinking;
        
        // Assume ~25% of excess alcohol calories contribute to weight gain
        // (alcohol has complex metabolic effects)
        const weightGainCalories = totalExcessCalories * 0.25;
        const potentialWeightGain = weightGainCalories / 3500;
        
        // Peer comparison
        const peerComparison = this.getPeerComparison(drinksPerWeek);
        
        return {
            totalCalories,
            potentialWeightGain,
            peerComparison
        };
    }

    /**
     * Calculate liver health impact
     */
    calculateLiverHealth(inputs) {
        const { drinksPerWeek, yearsOfDrinking } = inputs;
        
        // Validate inputs
        if (!drinksPerWeek || !yearsOfDrinking || drinksPerWeek <= 0 || yearsOfDrinking <= 0) {
            return {
                overallRisk: 'No Risk',
                riskClass: 'low-risk',
                gramsPerDay: '0.0',
                totalGramsConsumed: 0,
                enzymeImpact: 'Normal levels (8-40 IU/L)',
                astAltRatio: '1.0 (normal)',
                fattyLiverStage: 'No fatty liver',
                cirrhosisRisk: '0% (no risk)',
                recoveryTimeline: 'No recovery needed'
            };
        }
        
        // Calculate daily alcohol consumption in grams (1 drink ≈ 14g alcohol)
        const gramsPerDay = (drinksPerWeek * 14) / 7;
        const totalGramsConsumed = gramsPerDay * 365 * yearsOfDrinking;
        
        // Liver enzyme impact estimation (AST/ALT ratio)
        let enzymeImpact, astAltRatio;
        if (gramsPerDay <= 20) {
            enzymeImpact = 'Normal to mildly elevated (40-60 IU/L)';
            astAltRatio = '1.0-1.2 (normal pattern)';
        } else if (gramsPerDay <= 40) {
            enzymeImpact = 'Moderately elevated (60-120 IU/L)';
            astAltRatio = '1.5-2.0 (concerning pattern)';
        } else if (gramsPerDay <= 80) {
            enzymeImpact = 'Significantly elevated (120-200 IU/L)';
            astAltRatio = '2.0-2.5 (alcoholic pattern)';
        } else {
            enzymeImpact = 'Severely elevated (200+ IU/L)';
            astAltRatio = '2.5-3.0+ (severe alcoholic pattern)';
        }
        
        // Fatty liver progression (steatosis)
        let fattyLiverStage;
        if (gramsPerDay <= 20) {
            fattyLiverStage = 'Minimal: <5% liver fat';
        } else if (gramsPerDay <= 40) {
            fattyLiverStage = 'Mild: 5-15% liver fat';
        } else if (gramsPerDay <= 60) {
            fattyLiverStage = 'Moderate: 15-30% liver fat';
        } else {
            fattyLiverStage = 'Severe: >30% liver fat';
        }
        
        // Cirrhosis risk calculation
        let cirrhosisRisk;
        const highRiskYears = Math.max(0, yearsOfDrinking - 10); // Risk increases after 10 years
        
        if (gramsPerDay <= 30) {
            cirrhosisRisk = '<1% (minimal risk)';
        } else if (gramsPerDay <= 60) {
            cirrhosisRisk = '1-5% (low risk)';
        } else if (gramsPerDay <= 80) {
            const riskPercent = Math.min(15, 6 + (highRiskYears * 0.5));
            cirrhosisRisk = `${riskPercent.toFixed(0)}% (moderate risk)`;
        } else {
            const riskPercent = Math.min(30, 12 + (highRiskYears * 1.0));
            cirrhosisRisk = `${riskPercent.toFixed(0)}% (high risk)`;
        }
        
        // Recovery timeline with quantitative markers
        let recoveryTimeline;
        if (gramsPerDay <= 30) {
            recoveryTimeline = '2-4 weeks: Enzymes normalize, inflammation reduces';
        } else if (gramsPerDay <= 60) {
            recoveryTimeline = '2-3 months: Fatty liver reverses, enzymes improve';
        } else if (gramsPerDay <= 80) {
            recoveryTimeline = '6-12 months: Significant improvement, some scarring may remain';
        } else {
            recoveryTimeline = '1-2 years: Partial recovery possible, permanent damage likely';
        }
        
        // Risk classification
        let overallRisk, riskClass;
        if (gramsPerDay <= 20) {
            overallRisk = 'Low Risk';
            riskClass = 'low-risk';
        } else if (gramsPerDay <= 40) {
            overallRisk = 'Moderate Risk';
            riskClass = 'medium-risk';
        } else if (gramsPerDay <= 80) {
            overallRisk = 'High Risk';
            riskClass = 'high-risk';
        } else {
            overallRisk = 'Very High Risk';
            riskClass = 'high-risk';
        }
        
        return {
            overallRisk,
            riskClass,
            gramsPerDay: gramsPerDay.toFixed(1),
            totalGramsConsumed,
            enzymeImpact,
            astAltRatio,
            fattyLiverStage,
            cirrhosisRisk,
            recoveryTimeline
        };
    }

    /**
     * Calculate recovery benefits
     */
    calculateRecoveryBenefits(inputs) {
        const { drinksPerWeek, costPerDrink } = inputs;
        
        // Recovery benefit (years gained if stopped today)
        // Assume 50% of damage can be recovered over time
        const currentYearsLost = this.calculateLongevityImpact(inputs).yearsLost;
        const recoveryBenefit = currentYearsLost * 0.5;
        
        // Annual savings (only if cost is provided)
        const annualSavings = costPerDrink ? drinksPerWeek * 52 * costPerDrink : null;
        
        // Risk comparison
        const riskComparison = this.getRiskComparison(drinksPerWeek);
        
        return {
            recoveryBenefit,
            annualSavings,
            riskComparison
        };
    }

    /**
     * Get consumption level classification
     */
    getConsumptionLevel(drinksPerWeek) {
        if (drinksPerWeek <= 5) {
            return {
                level: 'Low (≤5 drinks/week)',
                class: 'low',
                risk: 'Low Risk',
                riskClass: 'low-risk'
            };
        } else if (drinksPerWeek <= 14) {
            return {
                level: 'Moderate (6-14 drinks/week)',
                class: 'moderate',
                risk: 'Moderate Risk',
                riskClass: 'medium-risk'
            };
        } else if (drinksPerWeek <= 28) {
            return {
                level: 'High (15-28 drinks/week)',
                class: 'high',
                risk: 'High Risk',
                riskClass: 'high-risk'
            };
        } else {
            return {
                level: 'Very High (>28 drinks/week)',
                class: 'very-high',
                risk: 'Very High Risk',
                riskClass: 'high-risk'
            };
        }
    }

    /**
     * Get peer comparison data
     */
    getPeerComparison(drinksPerWeek) {
        if (drinksPerWeek <= 3) {
            return 'Bottom 25% of drinkers';
        } else if (drinksPerWeek <= 7) {
            return 'Average for light drinkers';
        } else if (drinksPerWeek <= 14) {
            return 'Top 25% of regular drinkers';
        } else if (drinksPerWeek <= 21) {
            return 'Top 10% of drinkers';
        } else {
            return 'Top 2% of heavy drinkers';
        }
    }

    /**
     * Get risk comparison with other health factors
     */
    getRiskComparison(drinksPerWeek) {
        if (drinksPerWeek <= 7) {
            return 'Similar to occasional fast food';
        } else if (drinksPerWeek <= 14) {
            return 'Similar to smoking 2-3 cigarettes/day';
        } else if (drinksPerWeek <= 21) {
            return 'Similar to being 20 lbs overweight';
        } else if (drinksPerWeek <= 35) {
            return 'Similar to smoking 5-10 cigarettes/day';
        } else {
            return 'Similar to smoking 15+ cigarettes/day';
        }
    }

    /**
     * Display all results in the UI
     */
    displayResults(results, inputs) {
        // Longevity Impact
        document.getElementById('yearsLost').textContent = `${results.longevity.yearsLost.toFixed(1)} years`;
        document.getElementById('yearsLost').className = `result-value ${results.longevity.riskClass}`;
        
        document.getElementById('riskCategory').textContent = results.longevity.riskCategory;
        document.getElementById('riskCategory').className = `result-value ${results.longevity.riskClass}`;
        
        document.getElementById('consumptionLevel').textContent = results.longevity.consumptionLevel;
        document.getElementById('consumptionLevel').className = `consumption-level ${results.longevity.consumptionClass}`;
        
        // Financial Impact (only if cost provided)
        const financialSection = document.getElementById('financial-section');
        if (results.financial) {
            document.getElementById('totalCost').textContent = `$${results.financial.totalCost.toLocaleString()}`;
            document.getElementById('totalCost').className = 'result-value';
            
            document.getElementById('investmentValue').textContent = `$${results.financial.investmentValue.toLocaleString()}`;
            document.getElementById('investmentValue').className = 'result-value';
            
            document.getElementById('opportunityCost').textContent = `$${results.financial.opportunityCost.toLocaleString()} lost`;
            document.getElementById('opportunityCost').className = 'result-value high-risk';
            
            financialSection.classList.remove('hidden');
        } else {
            financialSection.classList.add('hidden');
        }
        
        // Health Metrics
        document.getElementById('totalCalories').textContent = `${results.health.totalCalories.toLocaleString()} calories`;
        document.getElementById('totalCalories').className = 'result-value';
        
        document.getElementById('weightGain').textContent = `${results.health.potentialWeightGain.toFixed(1)} lbs potential`;
        document.getElementById('weightGain').className = 'result-value';
        
        document.getElementById('peerComparison').textContent = results.health.peerComparison;
        document.getElementById('peerComparison').className = 'result-value';
        
        // Liver Health
        document.getElementById('liverRisk').textContent = `${results.liver.overallRisk} (${results.liver.gramsPerDay}g alcohol/day)`;
        document.getElementById('liverRisk').className = `result-value ${results.liver.riskClass}`;
        
        document.getElementById('liverEnzymes').textContent = `${results.liver.enzymeImpact} | AST/ALT ratio: ${results.liver.astAltRatio}`;
        document.getElementById('liverEnzymes').className = 'result-value';
        
        document.getElementById('fattyLiver').textContent = `${results.liver.fattyLiverStage} | Cirrhosis risk: ${results.liver.cirrhosisRisk}`;
        document.getElementById('fattyLiver').className = 'result-value';
        
        document.getElementById('liverRecovery').textContent = results.liver.recoveryTimeline;
        document.getElementById('liverRecovery').className = 'result-value';
        
        // Recovery Benefits
        document.getElementById('recoveryBenefit').textContent = `${results.recovery.recoveryBenefit.toFixed(1)} years`;
        document.getElementById('recoveryBenefit').className = 'result-value low-risk';
        
        if (results.recovery.annualSavings) {
            document.getElementById('annualSavings').textContent = `$${results.recovery.annualSavings.toLocaleString()}/year`;
            document.getElementById('annualSavings').className = 'result-value low-risk';
        } else {
            document.getElementById('annualSavings').textContent = 'Enter cost per drink to calculate';
            document.getElementById('annualSavings').className = 'result-value';
        }
        
        document.getElementById('riskComparison').textContent = results.recovery.riskComparison;
        document.getElementById('riskComparison').className = 'result-value';
        
        // Show results section
        document.getElementById('results').classList.add('show');
        
        // Create charts
        this.createDamageChart(inputs, results);
        this.createFinancialChart(inputs, results);
    }

    /**
     * Create damage timeline chart
     */
    createDamageChart(inputs, results) {
        const ctx = document.getElementById('damageChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.damageChartInstance) {
            window.damageChartInstance.destroy();
        }
        
        const { drinksPerWeek, yearsOfDrinking } = inputs;
        const maxYears = Math.max(20, yearsOfDrinking + 5);
        
        // Calculate damage accumulation over time
        const damageData = [];
        const recoveryData = [];
        const currentDamage = results.longevity.yearsLost;
        
        for (let year = 0; year <= maxYears; year++) {
            // Damage accumulates over time (non-linear)
            const tempInputs = { ...inputs, yearsOfDrinking: year };
            const tempLongevity = this.calculateLongevityImpact(tempInputs);
            damageData.push(tempLongevity.yearsLost);
            
            // Recovery line (shows benefit of stopping at current year)
            if (year <= yearsOfDrinking) {
                recoveryData.push(null);
            } else {
                const yearsInRecovery = year - yearsOfDrinking;
                const recoveryFactor = Math.min(0.5, yearsInRecovery * 0.1); // 50% max recovery over 5 years
                const recoveredYears = currentDamage * recoveryFactor;
                recoveryData.push(Math.max(0, currentDamage - recoveredYears));
            }
        }
        
        const labels = Array.from({length: maxYears + 1}, (_, i) => i);
        
        window.damageChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Years of Life Lost (Continuing)',
                    data: damageData,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.3,
                    fill: true
                }, {
                    label: 'Years Lost (If Stopped Today)',
                    data: recoveryData,
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.3,
                    fill: false,
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Health Impact Timeline',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'line'
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Years'
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Years of Life Lost'
                        },
                        beginAtZero: true,
                        grid: {
                            display: true,
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    /**
     * Create financial opportunity cost chart
     */
    createFinancialChart(inputs, results) {
        const ctx = document.getElementById('financialChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.financialChartInstance) {
            window.financialChartInstance.destroy();
        }
        
        const { drinksPerWeek, yearsOfDrinking, costPerDrink } = inputs;
        const actualCost = costPerDrink || results.financial.actualCostPerDrink;
        const annualCost = drinksPerWeek * 52 * actualCost;
        
        // Calculate opportunity cost over time (what you're missing out on)
        const opportunityCostData = [];
        
        for (let year = 0; year <= yearsOfDrinking; year++) {
            // Investment growth (6% annual return, compounded monthly)
            const monthlyInvestment = annualCost / 12;
            const months = year * 12;
            const monthlyRate = 0.06 / 12;
            
            let investmentValue = 0;
            if (year > 0 && monthlyRate > 0) {
                investmentValue = monthlyInvestment * (((1 + monthlyRate) ** months - 1) / monthlyRate);
            }
            
            // Opportunity cost = what you could have had minus what you spent
            const totalSpent = annualCost * year;
            const opportunityCost = investmentValue - totalSpent;
            opportunityCostData.push(Math.max(0, opportunityCost));
        }
        
        const labels = Array.from({length: yearsOfDrinking + 1}, (_, i) => i);
        
        window.financialChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Money You\'re Missing Out On',
                    data: opportunityCostData,
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Opportunity Cost: What You\'re Missing Out On',
                        font: { size: 16, weight: 'bold' }
                    },
                    subtitle: {
                        display: true,
                        text: 'This shows how much extra money you could have if you invested your alcohol spending instead',
                        font: { size: 12 },
                        color: '#666'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'line'
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Years'
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.alcoholCalculator = new AlcoholImpactCalculator();
});

/**
 * Toggle collapsible sections
 */
function toggleSection(sectionId) {
    const content = document.getElementById(sectionId + '-content');
    const icon = document.getElementById(sectionId + '-icon');
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        icon.classList.remove('rotated');
        icon.textContent = '▼';
    } else {
        content.classList.add('collapsed');
        icon.classList.add('rotated');
        icon.textContent = '▶';
    }
}

// Global function for button onclick (backwards compatibility)
function calculateImpact() {
    if (window.alcoholCalculator) {
        window.alcoholCalculator.calculateImpact();
    }
}