function calculateMortgagePayment(principal, rate, years) {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    
    if (monthlyRate === 0) {
        return principal / numPayments;
    }
    
    const monthlyPayment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return monthlyPayment;
}

function calculateHomeValue(initialPrice, appreciationRate, years) {
    return initialPrice * Math.pow(1 + appreciationRate / 100, years);
}

function calculateRentCost(initialRent, increaseRate, years, securityDeposit, rentersInsurance, brokerFee, inflationRate) {
    let totalCost = 0;
    let currentRent = initialRent;
    let currentInsurance = rentersInsurance;
    
    // Initial costs
    const securityDepositAmount = initialRent * securityDeposit;
    totalCost += securityDepositAmount; // Security deposit (will be returned at end, so net effect is 0)
    totalCost += brokerFee; // One-time broker fee
    
    for (let year = 1; year <= years; year++) {
        // Add rent for the year
        totalCost += currentRent * 12;
        
        // Add renter's insurance for the year (adjusted for inflation)
        totalCost += currentInsurance * 12;
        
        // Increase rent and insurance for next year
        currentRent = currentRent * (1 + increaseRate / 100);
        currentInsurance = currentInsurance * (1 + inflationRate / 100);
    }
    
    // Subtract security deposit return (assuming you get it back)
    totalCost -= securityDepositAmount;
    
    return totalCost;
}

function calculateInvestmentGrowth(principal, rate, years) {
    return principal * Math.pow(1 + rate / 100, years);
}

function calculateBuyingCosts(homePrice, downPayment, interestRate, mortgageTerm, 
                            homeAppreciation, rentalIncome, timeframe, investmentReturn, 
                            propertyTaxRate, homeInsurance, hoaFees, maintenanceRate, closingCosts,
                            pmi, additionalUtilities, sellingCosts, marginalTaxRate, inflationRate, monthlyRent) {
    const loanAmount = homePrice - downPayment;
    const monthlyMortgage = calculateMortgagePayment(loanAmount, interestRate, mortgageTerm);
    const monthlyRentalIncome = rentalIncome || 0;
    
    // Calculate monthly homeownership costs
    const annualPropertyTax = homePrice * (propertyTaxRate / 100);
    const monthlyPropertyTax = annualPropertyTax / 12;
    const monthlyHomeInsurance = homeInsurance / 12;
    const monthlyHoaFees = hoaFees || 0;
    const monthlyPmi = pmi || 0;
    const monthlyAdditionalUtilities = additionalUtilities || 0;
    const annualMaintenance = (homePrice * maintenanceRate) / 100;
    const monthlyMaintenance = annualMaintenance / 12;
    const totalMonthlyHousingCost = monthlyMortgage + monthlyPropertyTax + monthlyHomeInsurance + monthlyHoaFees + monthlyPmi + monthlyAdditionalUtilities + monthlyMaintenance;
    
    // Calculate total costs over the timeframe (with inflation adjustments)
    const totalMortgagePayments = monthlyMortgage * 12 * timeframe;
    const totalPropertyTax = annualPropertyTax * timeframe; // Could be inflation adjusted
    const totalHomeInsurance = homeInsurance * timeframe; // Could be inflation adjusted
    const totalHoaFees = monthlyHoaFees * 12 * timeframe; // Could be inflation adjusted
    const totalPmi = monthlyPmi * 12 * timeframe;
    const totalAdditionalUtilities = monthlyAdditionalUtilities * 12 * timeframe; // Could be inflation adjusted
    const totalMaintenance = annualMaintenance * timeframe; // Could be inflation adjusted
    const totalHousingCosts = totalMortgagePayments + totalPropertyTax + totalHomeInsurance + totalHoaFees + totalPmi + totalAdditionalUtilities + totalMaintenance;
    
    // Calculate total rental income received
    const totalRentalIncome = monthlyRentalIncome * 12 * timeframe;
    
    // Calculate home value after appreciation
    const futureHomeValue = calculateHomeValue(homePrice, homeAppreciation, timeframe);
    
    // Calculate selling costs (configurable realtor fee)
    const totalSellingCosts = futureHomeValue * (sellingCosts / 100);
    
    // Calculate tax benefits (mortgage interest and property tax deductions)
    const annualMortgageInterest = loanAmount * (interestRate / 100); // Simplified - should decrease over time
    const annualTaxBenefits = (annualMortgageInterest + annualPropertyTax) * (marginalTaxRate / 100);
    const totalTaxBenefits = annualTaxBenefits * timeframe;
    
    // Calculate remaining loan balance
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = mortgageTerm * 12;
    const paymentsMade = timeframe * 12;
    
    let remainingBalance = 0;
    if (paymentsMade < totalPayments) {
        remainingBalance = loanAmount * 
            (Math.pow(1 + monthlyRate, totalPayments) - Math.pow(1 + monthlyRate, paymentsMade)) /
            (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }
    
    // Calculate net proceeds from sale
    const netProceeds = futureHomeValue - totalSellingCosts - remainingBalance;
    
    // Calculate closing costs
    const totalClosingCosts = homePrice * (closingCosts / 100);
    
    // Calculate opportunity cost of down payment
    const downPaymentOpportunityCost = calculateInvestmentGrowth(downPayment, investmentReturn, timeframe);
    
    // Calculate monthly difference that could be invested
    const netMonthlyHousingCost = totalMonthlyHousingCost - monthlyRentalIncome;
    
    // If buying costs less per month, calculate what you could invest with the difference
    let monthlyInvestmentPotential = 0;
    let totalMonthlyInvestmentGrowth = 0;
    
    if (monthlyRent > netMonthlyHousingCost) {
        monthlyInvestmentPotential = monthlyRent - netMonthlyHousingCost;
        // Calculate compound growth of monthly investments
        const monthlyRate = investmentReturn / 100 / 12;
        const months = timeframe * 12;
        if (monthlyRate > 0) {
            totalMonthlyInvestmentGrowth = monthlyInvestmentPotential * 
                ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        } else {
            totalMonthlyInvestmentGrowth = monthlyInvestmentPotential * months;
        }
    }
    
    // Total cost of buying = Down payment + Closing costs + All housing costs - Rental income - Tax benefits
    // Note: We don't subtract net proceeds here to show actual out-of-pocket costs over the period
    const totalCost = downPayment + totalClosingCosts + totalHousingCosts - totalRentalIncome - totalTaxBenefits;
    
    return {
        totalCost: totalCost,
        monthlyMortgage: monthlyMortgage,
        monthlyRentalIncome: monthlyRentalIncome,
        monthlyPropertyTax: monthlyPropertyTax,
        monthlyHomeInsurance: monthlyHomeInsurance,
        monthlyHoaFees: monthlyHoaFees,
        monthlyMaintenance: monthlyMaintenance,
        totalMonthlyHousingCost: totalMonthlyHousingCost,
        netMonthlyHousingCost: netMonthlyHousingCost,
        futureHomeValue: futureHomeValue,
        netProceeds: netProceeds,
        totalMortgagePayments: totalMortgagePayments,
        totalPropertyTax: totalPropertyTax,
        totalHomeInsurance: totalHomeInsurance,
        totalHoaFees: totalHoaFees,
        totalPmi: totalPmi,
        totalAdditionalUtilities: totalAdditionalUtilities,
        totalMaintenance: totalMaintenance,
        totalHousingCosts: totalHousingCosts,
        totalRentalIncome: totalRentalIncome,
        totalSellingCosts: totalSellingCosts,
        sellingCosts: sellingCosts,
        totalClosingCosts: totalClosingCosts,
        totalTaxBenefits: totalTaxBenefits,
        annualPropertyTax: annualPropertyTax,
        monthlyPmi: monthlyPmi,
        monthlyAdditionalUtilities: monthlyAdditionalUtilities,
        netMonthlyHousingCost: netMonthlyHousingCost,
        downPaymentOpportunityCost: downPaymentOpportunityCost,
        monthlyInvestmentPotential: monthlyInvestmentPotential,
        totalMonthlyInvestmentGrowth: totalMonthlyInvestmentGrowth
    };
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function calculateComparison() {
    // Get input values - Renting
    const monthlyRent = parseFloat(document.getElementById('monthlyRent').value);
    const securityDeposit = parseFloat(document.getElementById('securityDeposit').value);
    const rentersInsurance = parseFloat(document.getElementById('rentersInsurance').value);
    const brokerFee = parseFloat(document.getElementById('brokerFee').value);
    const rentIncrease = parseFloat(document.getElementById('rentIncrease').value);
    
    // Get input values - Buying
    const homePrice = parseFloat(document.getElementById('homePrice').value);
    const downPayment = parseFloat(document.getElementById('downPayment').value);
    const mortgageTerm = parseInt(document.getElementById('mortgageTerm').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const closingCosts = parseFloat(document.getElementById('closingCosts').value);
    const propertyTaxRate = parseFloat(document.getElementById('propertyTaxRate').value);
    const homeInsurance = parseFloat(document.getElementById('homeInsurance').value);
    const hoaFees = parseFloat(document.getElementById('hoaFees').value);
    const pmi = parseFloat(document.getElementById('pmi').value);
    const additionalUtilities = parseFloat(document.getElementById('additionalUtilities').value);
    const maintenanceRate = parseFloat(document.getElementById('maintenanceRate').value);
    const sellingCosts = parseFloat(document.getElementById('sellingCosts').value);
    const homeAppreciation = parseFloat(document.getElementById('homeAppreciation').value);
    
    // House hacking
    const rentalIncome = parseFloat(document.getElementById('rentalIncome').value);
    
    // Additional info
    const timeframe = parseInt(document.getElementById('timeframe').value);
    const investmentReturn = parseFloat(document.getElementById('investmentReturn').value);
    const filingStatus = document.getElementById('filingStatus').value;
    const marginalTaxRate = parseFloat(document.getElementById('marginalTaxRate').value);
    const capitalGainsTaxRate = parseFloat(document.getElementById('capitalGainsTaxRate').value);
    const inflationRate = parseFloat(document.getElementById('inflationRate').value);
    
    // Validate inputs
    if (downPayment >= homePrice) {
        alert('Down payment cannot be greater than or equal to home price');
        return;
    }
    
    // Calculate costs
    const rentingCost = calculateRentCost(monthlyRent, rentIncrease, timeframe, securityDeposit, rentersInsurance, brokerFee, inflationRate);
    const buyingResults = calculateBuyingCosts(homePrice, downPayment, interestRate, 
                                            mortgageTerm, homeAppreciation, rentalIncome, timeframe, investmentReturn,
                                            propertyTaxRate, homeInsurance, hoaFees, maintenanceRate, closingCosts,
                                            pmi, additionalUtilities, sellingCosts, marginalTaxRate, inflationRate, monthlyRent);
    
    // Calculate renting with investment scenario
    const rentingWithInvestment = rentingCost + buyingResults.downPaymentOpportunityCost;
    
    // Determine which is better (including opportunity cost)
    const savingsWithoutOpportunityCost = rentingCost - buyingResults.totalCost;
    const savingsWithOpportunityCost = rentingWithInvestment - buyingResults.totalCost - buyingResults.totalMonthlyInvestmentGrowth;
    const isBuyingBetter = savingsWithOpportunityCost > 0;
    
    // Generate results HTML with collapsible sections
    const resultsHTML = `
        <div class="cost-comparison">
            <div class="cost-item">
                <h4>Renting + Investing Down Payment</h4>
                <div class="cost-amount">${formatCurrency(rentingWithInvestment)}</div>
                <p>Over ${timeframe} years</p>
            </div>
            <div class="cost-item">
                <h4>Buying + Investment Potential</h4>
                <div class="cost-amount ${isBuyingBetter ? 'savings' : ''}">${formatCurrency(buyingResults.totalCost + buyingResults.totalMonthlyInvestmentGrowth)}</div>
                <p>Over ${timeframe} years</p>
            </div>
        </div>
        
        <div class="break-even">
            <h3>${isBuyingBetter ? '🏠 Buying is Better!' : '🏠 Renting + Investing is Better!'}</h3>
            <p><strong>You ${isBuyingBetter ? 'save' : 'spend'} ${formatCurrency(Math.abs(savingsWithOpportunityCost))} by ${isBuyingBetter ? 'buying' : 'renting + investing'}</strong></p>
        </div>
        
        <div class="collapsible-section">
            <div class="collapsible-header" onclick="toggleSection('monthly-costs')">
                <h3>Monthly Housing Costs <span class="expand-icon">▼</span></h3>
            </div>
            <div class="collapsible-content" id="monthly-costs">
                <div class="result-item">
                    <p><strong>Monthly Rent:</strong> ${formatCurrency(monthlyRent)}</p>
                    <p><strong>Monthly Mortgage Payment:</strong> ${formatCurrency(buyingResults.monthlyMortgage)}</p>
                    <p><strong>Monthly Property Tax:</strong> ${formatCurrency(buyingResults.monthlyPropertyTax)}</p>
                    <p><strong>Monthly Home Insurance:</strong> ${formatCurrency(buyingResults.monthlyHomeInsurance)}</p>
                    <p><strong>Monthly HOA Fees:</strong> ${formatCurrency(buyingResults.monthlyHoaFees)}</p>
                    <p><strong>Monthly PMI:</strong> ${formatCurrency(buyingResults.monthlyPmi)}</p>
                    <p><strong>Monthly Additional Utilities:</strong> ${formatCurrency(buyingResults.monthlyAdditionalUtilities)}</p>
                    <p><strong>Monthly Maintenance & Repairs:</strong> ${formatCurrency(buyingResults.monthlyMaintenance)}</p>
                    <p><strong>Total Monthly Housing Cost:</strong> ${formatCurrency(buyingResults.totalMonthlyHousingCost)}</p>
                    <p><strong>Monthly Rental Income:</strong> ${formatCurrency(buyingResults.monthlyRentalIncome)}</p>
                    <p><strong>Net Monthly Housing Cost (Buying):</strong> ${formatCurrency(buyingResults.netMonthlyHousingCost)}</p>
                </div>
            </div>
        </div>
        
        <div class="collapsible-section">
            <div class="collapsible-header" onclick="toggleSection('home-value')">
                <h3>Home Value & Equity <span class="expand-icon">▼</span></h3>
            </div>
            <div class="collapsible-content" id="home-value">
                <div class="result-item">
                    <p><strong>Initial Home Value:</strong> ${formatCurrency(homePrice)}</p>
                    <p><strong>Closing Costs (${closingCosts}%):</strong> ${formatCurrency(buyingResults.totalClosingCosts)}</p>
                    <p><strong>Home Value After ${timeframe} Years:</strong> ${formatCurrency(buyingResults.futureHomeValue)}</p>
                    <p><strong>Net Proceeds from Sale:</strong> ${formatCurrency(buyingResults.netProceeds)}</p>
                    <p><strong>Selling Costs (${sellingCosts}% realtor fee):</strong> ${formatCurrency(buyingResults.totalSellingCosts)}</p>
                </div>
            </div>
        </div>
        
        <div class="collapsible-section">
            <div class="collapsible-header" onclick="toggleSection('house-hacking')">
                <h3>Income from House Hacking <span class="expand-icon">▼</span></h3>
            </div>
            <div class="collapsible-content" id="house-hacking">
                <div class="result-item">
                    <p><strong>Monthly Rental Income:</strong> ${formatCurrency(buyingResults.monthlyRentalIncome)}</p>
                    <p><strong>Total Rental Income Over ${timeframe} Years:</strong> ${formatCurrency(buyingResults.totalRentalIncome)}</p>
                    <p><strong>Impact on Monthly Housing Cost:</strong> Reduces by ${formatCurrency(buyingResults.monthlyRentalIncome)}/month</p>
                </div>
            </div>
        </div>
        
        <div class="collapsible-section">
            <div class="collapsible-header" onclick="toggleSection('tax-benefits')">
                <h3>Tax Benefits <span class="expand-icon">▼</span></h3>
            </div>
            <div class="collapsible-content" id="tax-benefits">
                <div class="result-item">
                    <p><strong>Annual Property Tax:</strong> ${formatCurrency(buyingResults.annualPropertyTax)}</p>
                    <p><strong>Total Tax Benefits Over ${timeframe} Years:</strong> ${formatCurrency(buyingResults.totalTaxBenefits)}</p>
                    <p><strong>Marginal Tax Rate Used:</strong> ${marginalTaxRate}%</p>
                    <small>Tax benefits from mortgage interest and property tax deductions</small>
                </div>
            </div>
        </div>
        
        <div class="collapsible-section">
            <div class="collapsible-header" onclick="toggleSection('opportunity-cost')">
                <h3>Opportunity Cost Analysis <span class="expand-icon">▼</span></h3>
            </div>
            <div class="collapsible-content" id="opportunity-cost">
                <div class="result-item">
                    <p><strong>Down Payment:</strong> ${formatCurrency(downPayment)}</p>
                    <p><strong>If Down Payment Was Invested:</strong> ${formatCurrency(buyingResults.downPaymentOpportunityCost)}</p>
                    <p><strong>Monthly Investment Potential:</strong> ${formatCurrency(buyingResults.monthlyInvestmentPotential)}</p>
                    <p><strong>Growth from Monthly Investments:</strong> ${formatCurrency(buyingResults.totalMonthlyInvestmentGrowth)}</p>
                </div>
            </div>
        </div>
        
        <div class="collapsible-section">
            <div class="collapsible-header" onclick="toggleSection('summary')">
                <h3>Detailed Summary <span class="expand-icon">▼</span></h3>
            </div>
            <div class="collapsible-content" id="summary">
                <div class="result-item">
                    <p><strong>Simple Comparison (no opportunity cost):</strong></p>
                    <p>• Renting: ${formatCurrency(rentingCost)}</p>
                    <p>• Buying: ${formatCurrency(buyingResults.totalCost)}</p>
                    <p>• Difference: ${formatCurrency(Math.abs(savingsWithoutOpportunityCost))} ${savingsWithoutOpportunityCost > 0 ? '(buying saves)' : '(renting saves)'}</p>
                    <p><strong>With Opportunity Cost:</strong></p>
                    <p>• Renting + Investing: ${formatCurrency(rentingWithInvestment)}</p>
                    <p>• Buying + Investment Potential: ${formatCurrency(buyingResults.totalCost + buyingResults.totalMonthlyInvestmentGrowth)}</p>
                    <p>• Difference: ${formatCurrency(Math.abs(savingsWithOpportunityCost))} ${savingsWithOpportunityCost > 0 ? '(buying saves)' : '(renting + investing saves)'}</p>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('results').innerHTML = resultsHTML;
    
    // Create the break-even chart
    createBreakEvenChart(monthlyRent, rentIncrease, buyingResults, timeframe, homePrice, downPayment, closingCosts, sellingCosts);
    
    // Add detailed cost breakdown
    addDetailedBreakdown(rentingCost, buyingResults, timeframe, downPayment, investmentReturn, rentingWithInvestment, savingsWithOpportunityCost);
}

let breakEvenChart = null;
let currentBreakEvenYear = null;

function createBreakEvenChart(initialRent, rentIncrease, buyingResults, maxYears, homePrice, downPayment, closingCosts, sellingCosts) {
    const ctx = document.getElementById('breakEvenChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (breakEvenChart) {
        breakEvenChart.destroy();
    }
    
    // Calculate transaction costs
    const totalClosingCosts = homePrice * (closingCosts / 100);
    const totalSellingCosts = homePrice * (sellingCosts / 100); // Using current home value as approximation
    const totalTransactionCosts = totalClosingCosts + totalSellingCosts;
    
    // Generate data points for each year
    const years = [];
    const rentingCosts = [];
    const buyingCosts = [];
    
    let currentRent = initialRent;
    let breakEvenYear = null;
    
    // Add year 0 (initial costs)
    years.push(0);
    rentingCosts.push(initialRent);
    // For year 0, buying cost includes all transaction costs amortized over 1 month plus regular monthly cost
    buyingCosts.push(buyingResults.netMonthlyHousingCost + (totalTransactionCosts / 1));
    
    for (let year = 1; year <= maxYears; year++) {
        years.push(year);
        
        // Calculate current rent for this year
        let currentYearRent = initialRent;
        for (let y = 1; y < year; y++) {
            currentYearRent = currentYearRent * (1 + rentIncrease / 100);
        }
        
        // Monthly buying cost = regular monthly cost + transaction costs amortized over the timeframe
        const monthlyTransactionCost = totalTransactionCosts / (year * 12);
        const monthlyBuyingCost = buyingResults.netMonthlyHousingCost + monthlyTransactionCost;
        
        rentingCosts.push(currentYearRent);
        buyingCosts.push(monthlyBuyingCost);
        
        // Find break-even point where rent line crosses buying line
        if (breakEvenYear === null && year > 0) {
            const prevRent = rentingCosts[year - 1];
            const currentRent = currentYearRent;
            
            // Check if lines crossed between previous year and current year
            if ((prevRent <= monthlyBuyingCost && currentRent >= monthlyBuyingCost) ||
                (prevRent >= monthlyBuyingCost && currentRent <= monthlyBuyingCost)) {
                // Interpolate to find more precise break-even point
                const slope = (currentRent - prevRent);
                const intercept = prevRent - (year - 1) * slope;
                const breakEvenX = (monthlyBuyingCost - intercept) / slope;
                breakEvenYear = Math.max(0, Math.min(maxYears, breakEvenX));
            }
        }
    }
    
    // Store break-even year globally so plugin can access it
    currentBreakEvenYear = breakEvenYear;
    
    // Chart configuration
    const config = {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Rent',
                data: rentingCosts,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                fill: false,
                tension: 0.1,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#2563eb',
                pointRadius: 4
            }, {
                label: 'Buy',
                data: buyingCosts,
                borderColor: '#16a34a',
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                borderWidth: 3,
                fill: false,
                tension: 0.1,
                pointBackgroundColor: '#16a34a',
                pointBorderColor: '#16a34a',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    title: {
                        display: true,
                        text: 'Effective Monthly Cost ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Years'
                    }
                }
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'line',
                        boxWidth: 20,
                        font: {
                            size: 14
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.parsed.y.toLocaleString() + '/month';
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    };
    
    // Add a plugin to draw the break-even line (always register, but only draw if breakEvenYear exists)
    const breakEvenPlugin = {
        id: 'breakEvenLine',
        afterDraw: function(chart) {
            if (!currentBreakEvenYear || currentBreakEvenYear > maxYears) return;
            
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const xScale = chart.scales.x;
            
            const xPosition = xScale.getPixelForValue(currentBreakEvenYear);
            
            ctx.save();
            ctx.strokeStyle = '#6b7280';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.moveTo(xPosition, chartArea.top);
            ctx.lineTo(xPosition, chartArea.bottom);
            ctx.stroke();
            
            // Add label
            ctx.fillStyle = '#6b7280';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Break even', xPosition, chartArea.top - 5);
            ctx.restore();
        }
    };
    
    // Unregister any existing plugin first
    Chart.unregister('breakEvenLine');
    Chart.register(breakEvenPlugin);
    
    breakEvenChart = new Chart(ctx, config);
}

function addDetailedBreakdown(rentingCost, buyingResults, timeframe, downPayment, investmentReturn, rentingWithInvestment, savingsWithOpportunityCost) {
    // Use the same calculation logic as main results for consistency
    const rentInitialCosts = 2000; // Security deposit, moving costs
    const buyInitialCosts = downPayment + 5000 + 4009; // Down payment + closing costs + other fees
    
    const rentRecurringCosts = rentingCost;
    const buyRecurringCosts = buyingResults.totalHousingCosts - buyingResults.totalRentalIncome;
    
    // Use the same opportunity cost calculation as main results
    const rentOpportunityCosts = buyingResults.downPaymentOpportunityCost - downPayment; // Only down payment opportunity cost
    const buyOpportunityCosts = 0; // No opportunity cost for buying (it's already in the totalCost)
    
    const rentNetProceeds = -2000; // Get security deposit back
    const buyNetProceeds = -buyingResults.netProceeds;
    
    // Calculate totals that match the main results
    const rentTotal = rentingWithInvestment;
    const buyTotal = buyingResults.totalCost + buyingResults.totalMonthlyInvestmentGrowth;
    
    const savings = rentTotal - buyTotal;
    const betterOption = savings > 0 ? 'buying' : 'renting';
    const savingsAmount = Math.abs(savings);
    
    const breakdownHTML = `
        <div class="detailed-breakdown">
            <div class="breakdown-header">
                <div class="breakdown-title">Total costs after ${timeframe} years</div>
                <div class="breakdown-subtitle">
                    ${betterOption === 'renting' ? 'Renting' : 'Buying'} is $${formatCurrency(savingsAmount).replace('$', '')} less than ${betterOption === 'renting' ? 'buying' : 'renting'}
                </div>
            </div>
            
            <table class="breakdown-table">
                <thead>
                    <tr>
                        <th></th>
                        <th class="rent-col">Rent</th>
                        <th class="buy-col">Buy</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="category">Base costs <span class="tooltip-icon" data-tooltip="base">?</span></td>
                        <td class="rent-col">${formatCurrency(rentingCost)}</td>
                        <td class="buy-col">${formatCurrency(buyingResults.totalCost)}</td>
                    </tr>
                    <tr>
                        <td class="category">Investment opportunity <span class="tooltip-icon" data-tooltip="opportunity">?</span></td>
                        <td class="rent-col">${formatCurrency(buyingResults.downPaymentOpportunityCost)}</td>
                        <td class="buy-col">${formatCurrency(buyingResults.totalMonthlyInvestmentGrowth)}</td>
                    </tr>
                    <tr class="total-row">
                        <td class="category">Total with opportunity cost</td>
                        <td class="rent-col">${formatCurrency(rentTotal)}</td>
                        <td class="buy-col">${formatCurrency(buyTotal)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('detailedBreakdown').innerHTML = breakdownHTML;
    
    // Add tooltip functionality with a small delay to ensure DOM is ready
    setTimeout(() => {
        addTooltipListeners();
    }, 100);
}

function addTooltipListeners() {
    const tooltipTexts = {
        base: "<strong>Base costs:</strong><br>Renting: Total rent payments over the timeframe<br>Buying: All homeownership costs (down payment, mortgage, taxes, insurance, maintenance) minus home appreciation and rental income",
        opportunity: "<strong>Investment opportunity:</strong><br>Renting: What the down payment would grow to if invested in the stock market<br>Buying: What monthly savings from lower housing costs would grow to if invested",
        proceeds: "<strong>Net proceeds:</strong><br>Renting: Security deposit returned<br>Buying: Money received from selling the home, minus realtor fees and remaining mortgage balance"
    };
    
    const tooltipIcons = document.querySelectorAll('.tooltip-icon');
    let activeTooltip = null;
    
    
    tooltipIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Remove any existing tooltip
            if (activeTooltip) {
                activeTooltip.remove();
                activeTooltip = null;
            }
            
            const tooltipType = this.getAttribute('data-tooltip');
            const tooltipText = tooltipTexts[tooltipType];
            
            
            if (tooltipText) {
                const tooltip = document.createElement('div');
                tooltip.innerHTML = tooltipText;
                
                // Apply styles directly to ensure visibility
                tooltip.style.cssText = `
                    position: fixed;
                    background: #2c3e50;
                    color: white;
                    padding: 12px 16px;
                    border-radius: 6px;
                    font-size: 14px;
                    line-height: 1.4;
                    max-width: 300px;
                    z-index: 99999;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    display: block;
                    border: 2px solid white;
                `;
                
                document.body.appendChild(tooltip);
                
                const rect = this.getBoundingClientRect();
                tooltip.style.left = (rect.left + 20) + 'px';
                tooltip.style.top = (rect.top - 50) + 'px';
                
                activeTooltip = tooltip;
            }
        });
    });
    
    // Close tooltip when clicking elsewhere
    document.addEventListener('click', function() {
        if (activeTooltip) {
            activeTooltip.remove();
            activeTooltip = null;
        }
    });
}

function toggleSection(sectionId) {
    const content = document.getElementById(sectionId);
    const header = content.previousElementSibling;
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        header.classList.remove('expanded');
    } else {
        content.classList.add('expanded');
        header.classList.add('expanded');
    }
}

function toggleOptions(optionsId) {
    const options = document.getElementById(optionsId);
    const toggleText = document.getElementById(optionsId.replace('-options', '-toggle-text'));
    
    if (options.classList.contains('show')) {
        options.classList.remove('show');
        toggleText.textContent = 'SHOW OPTIONS';
    } else {
        options.classList.add('show');
        toggleText.textContent = 'HIDE OPTIONS';
    }
}

// Add event listeners for real-time calculation
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Optional: Add real-time calculation here
            // calculateComparison();
        });
    });
});