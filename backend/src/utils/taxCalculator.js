/**
 * Calculate Income Tax based on slabs and rules
 */
export const calculateIncomeTax = (grossIncome, deductions, taxRule) => {
  // Calculate taxable income
  const taxableIncome = Math.max(0, grossIncome - deductions);
  
  let tax = 0;
  const slabs = taxRule.slabs || [];
  const breakdown = [];
  
  // Calculate tax based on slabs
  for (let i = 0; i < slabs.length; i++) {
    const slab = slabs[i];
    const minIncome = slab.minIncome;
    const maxIncome = slab.maxIncome === Infinity ? taxableIncome : slab.maxIncome;
    
    if (taxableIncome > minIncome) {
      const taxableInSlab = Math.min(taxableIncome, maxIncome) - minIncome;
      const taxInSlab = (taxableInSlab * slab.rate) / 100;
      
      tax += taxInSlab;
      breakdown.push({
        slab: `₹${minIncome.toLocaleString('en-IN')} - ${maxIncome === Infinity ? 'Above' : '₹' + maxIncome.toLocaleString('en-IN')}`,
        rate: `${slab.rate}%`,
        taxableAmount: taxableInSlab,
        tax: taxInSlab,
      });
      
      if (taxableIncome <= maxIncome) break;
    }
  }
  
  // Calculate surcharge if applicable
  let surcharge = 0;
  if (taxRule.surcharge?.applicable && taxRule.surcharge.slabs) {
    for (const slab of taxRule.surcharge.slabs) {
      if (taxableIncome >= slab.minIncome && taxableIncome <= (slab.maxIncome || Infinity)) {
        surcharge = (tax * slab.rate) / 100;
        break;
      }
    }
  }
  
  // Calculate cess
  const cess = taxRule.cess?.applicable 
    ? ((tax + surcharge) * taxRule.cess.rate) / 100 
    : 0;
  
  // Calculate rebate if applicable
  let rebate = 0;
  if (taxRule.rebate && taxableIncome <= taxRule.rebate.maxIncome) {
    rebate = Math.min(tax, taxRule.rebate.amount);
  }
  
  const totalTax = tax + surcharge + cess - rebate;
  
  return {
    grossIncome,
    deductions,
    taxableIncome,
    breakdown,
    baseTax: tax,
    surcharge,
    cess,
    rebate,
    totalTax: Math.round(totalTax),
    effectiveRate: ((totalTax / grossIncome) * 100).toFixed(2),
  };
};

/**
 * Calculate GST
 */
export const calculateGST = (amount, gstRate = 18) => {
  const gstAmount = (amount * gstRate) / 100;
  const totalAmount = amount + gstAmount;
  
  return {
    baseAmount: amount,
    gstRate,
    gstAmount,
    totalAmount,
    cgst: gstAmount / 2,
    sgst: gstAmount / 2,
  };
};

/**
 * Calculate Property Tax
 */
export const calculatePropertyTax = (propertyValue, taxRate = 0.5, location = 'urban') => {
  const rateMultiplier = location === 'urban' ? 1 : 0.7;
  const effectiveRate = (taxRate * rateMultiplier) / 100;
  const tax = propertyValue * effectiveRate;
  
  return {
    propertyValue,
    taxRate,
    location,
    rateMultiplier,
    effectiveRate: (effectiveRate * 100).toFixed(2),
    tax: Math.round(tax),
  };
};

/**
 * Calculate Corporate Tax
 */
export const calculateCorporateTax = (turnover, netProfit, taxRate = 25.17) => {
  const baseTax = (netProfit * taxRate) / 100;
  const surcharge = turnover > 10000000 ? (baseTax * 10) / 100 : 0;
  const cess = (baseTax + surcharge) * 0.04;
  const totalTax = baseTax + surcharge + cess;
  
  return {
    turnover,
    netProfit,
    taxRate,
    baseTax,
    surcharge,
    cess,
    totalTax: Math.round(totalTax),
    effectiveRate: ((totalTax / netProfit) * 100).toFixed(2),
  };
};

/**
 * Generate tax saving suggestions
 */
export const generateTaxSavingSuggestions = (grossIncome, currentDeductions) => {
  const suggestions = [];
  const maxDeduction = 150000; // Section 80C limit
  
  if (currentDeductions < maxDeduction) {
    const remainingLimit = maxDeduction - currentDeductions;
    suggestions.push({
      section: '80C',
      title: 'Invest in ELSS, PPF, or Life Insurance',
      potentialSaving: Math.round(remainingLimit * 0.3), // Assuming 30% tax bracket
      maxLimit: maxDeduction,
      currentlyUsed: currentDeductions,
      remaining: remainingLimit,
    });
  }
  
  suggestions.push({
    section: '80D',
    title: 'Health Insurance Premium',
    potentialSaving: 15000, // Max 50,000 * 30%
    maxLimit: 50000,
    description: 'Deduction for health insurance premiums paid',
  });
  
  if (grossIncome > 500000) {
    suggestions.push({
      section: '80CCD(1B)',
      title: 'Additional NPS Contribution',
      potentialSaving: 15000,
      maxLimit: 50000,
      description: 'Additional deduction for NPS investment',
    });
  }
  
  return suggestions;
};

/**
 * Compare tax across years
 */
export const compareTaxYears = (currentYear, previousYear) => {
  const difference = currentYear.totalTax - previousYear.totalTax;
  const percentageChange = ((difference / previousYear.totalTax) * 100).toFixed(2);
  
  return {
    currentYear: currentYear.totalTax,
    previousYear: previousYear.totalTax,
    difference,
    percentageChange,
    trend: difference > 0 ? 'increased' : difference < 0 ? 'decreased' : 'same',
  };
};
