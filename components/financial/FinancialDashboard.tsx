// components/financial/FinancialDashboard.tsx - Comprehensive Financial Analysis Tool
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CalculatorIcon, 
  ArrowLeftIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface FinancialInputs {
  bandOffer: number
  estimatedAttendance: number
  ticketPrice: number
  barRevenue: number
  merchandiseRevenue: number
  coverCharge: number
  // Revenue splits
  ticketSplitToCowboy: number // percentage
  merchSplitToCowboy: number // percentage
  // COGS inputs
  barCOGS: number // percentage
  merchandiseCOGS: number // percentage
  // Fixed costs
  staffCosts: number
  utilitiesCosts: number
  facilityCosts: number
  marketingCosts: number
  otherFixedCosts: number
}

interface FinancialResults {
  // Combined totals
  totalRevenue: number
  totalCOGS: number
  totalFixedCosts: number
  grossProfit: number
  netProfit: number
  breakEvenAttendance: number
  profitMargin: number
  riskLevel: 'Low' | 'Medium' | 'High'
  recommendation: string
  revenuePerCustomer: number
  costPerCustomer: number
  profitPerCustomer: number
  
  // Cowboy-specific results
  cowboy: {
    revenue: number
    cogs: number
    fixedCosts: number
    grossProfit: number
    netProfit: number
    profitMargin: number
  }
  
  // Band-specific results
  band: {
    revenue: number
    costs: number
    netProfit: number
    profitMargin: number
  }
}

export default function FinancialDashboard() {
  const router = useRouter()
  
  const [inputs, setInputs] = useState<FinancialInputs>({
    bandOffer: 0,
    estimatedAttendance: 0,
    ticketPrice: 15,
    barRevenue: 25, // per person average
    merchandiseRevenue: 0, // default to 0 since venue typically doesn't get this
    coverCharge: 10,
    ticketSplitToCowboy: 0, // default to 0% - bands typically keep ticket sales
    merchSplitToCowboy: 0, // default to 0% - bands typically keep merchandise
    barCOGS: 30, // 30% of bar revenue
    merchandiseCOGS: 40, // 40% of merchandise revenue
    staffCosts: 800,
    utilitiesCosts: 200,
    facilityCosts: 300,
    marketingCosts: 150,
    otherFixedCosts: 100
  })

  const [savedScenarios, setSavedScenarios] = useState<Array<{
    name: string
    inputs: FinancialInputs
    results: FinancialResults
    timestamp: Date
  }>>([])

  // Calculate financial results
  const results = useMemo((): FinancialResults => {
    const { 
      bandOffer, 
      estimatedAttendance, 
      ticketPrice, 
      barRevenue, 
      merchandiseRevenue, 
      coverCharge,
      ticketSplitToCowboy,
      merchSplitToCowboy,
      barCOGS,
      merchandiseCOGS,
      staffCosts,
      utilitiesCosts,
      facilityCosts,
      marketingCosts,
      otherFixedCosts
    } = inputs

    // Revenue calculations
    const ticketRevenue = estimatedAttendance * ticketPrice
    const coverChargeRevenue = estimatedAttendance * coverCharge
    const totalBarRevenue = estimatedAttendance * barRevenue
    const totalMerchandiseRevenue = estimatedAttendance * merchandiseRevenue

    // Cowboy revenue
    const cowboyTicketRevenue = ticketRevenue * (ticketSplitToCowboy / 100)
    const cowboyMerchRevenue = totalMerchandiseRevenue * (merchSplitToCowboy / 100)
    const cowboyRevenue = cowboyTicketRevenue + coverChargeRevenue + totalBarRevenue + cowboyMerchRevenue

    // Band revenue
    const bandTicketRevenue = ticketRevenue * ((100 - ticketSplitToCowboy) / 100)
    const bandMerchRevenue = totalMerchandiseRevenue * ((100 - merchSplitToCowboy) / 100)
    const bandRevenue = bandTicketRevenue + bandMerchRevenue

    const totalRevenue = cowboyRevenue + bandRevenue

    // COGS calculations (only applies to Cowboy)
    const barCOGSAmount = totalBarRevenue * (barCOGS / 100)
    const merchandiseCOGSAmount = cowboyMerchRevenue * (merchandiseCOGS / 100)
    const totalCOGS = barCOGSAmount + merchandiseCOGSAmount

    // Fixed costs (Cowboy pays these)
    const totalFixedCosts = bandOffer + staffCosts + utilitiesCosts + facilityCosts + marketingCosts + otherFixedCosts

    // Cowboy calculations
    const cowboyGrossProfit = cowboyRevenue - totalCOGS
    const cowboyNetProfit = cowboyGrossProfit - totalFixedCosts
    const cowboyProfitMargin = cowboyRevenue > 0 ? (cowboyNetProfit / cowboyRevenue) * 100 : 0

    // Band calculations (they get revenue minus what they pay the cowboy, which is bandOffer)
    const bandNetProfit = bandRevenue - bandOffer
    const bandProfitMargin = bandRevenue > 0 ? (bandNetProfit / bandRevenue) * 100 : 0

    // Combined calculations for overall analysis
    const grossProfit = totalRevenue - totalCOGS
    const netProfit = cowboyNetProfit + bandNetProfit

    // Per customer metrics
    const revenuePerCustomer = estimatedAttendance > 0 ? totalRevenue / estimatedAttendance : 0
    const costPerCustomer = estimatedAttendance > 0 ? (totalCOGS + totalFixedCosts) / estimatedAttendance : 0
    const profitPerCustomer = estimatedAttendance > 0 ? netProfit / estimatedAttendance : 0

    // Break-even analysis (based on Cowboy's perspective)
    const variableRevenuePerPerson = (ticketPrice * ticketSplitToCowboy / 100) + coverCharge + barRevenue + (merchandiseRevenue * merchSplitToCowboy / 100)
    const variableCOGSPerPerson = (barRevenue * barCOGS / 100) + (merchandiseRevenue * merchSplitToCowboy / 100 * merchandiseCOGS / 100)
    const contributionMarginPerPerson = variableRevenuePerPerson - variableCOGSPerPerson
    const breakEvenAttendance = contributionMarginPerPerson > 0 ? Math.ceil(totalFixedCosts / contributionMarginPerPerson) : 0

    // Profit margin (overall)
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Risk assessment (based on Cowboy's break-even)
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low'
    if (breakEvenAttendance > estimatedAttendance * 1.2) riskLevel = 'High'
    else if (breakEvenAttendance > estimatedAttendance * 0.8) riskLevel = 'Medium'

    // Recommendation
    let recommendation = 'Excellent opportunity for both parties!'
    if (cowboyNetProfit < 0 && bandNetProfit < 0) recommendation = 'Not recommended - both parties will lose money'
    else if (cowboyNetProfit < 0) recommendation = 'Unfavorable for venue - consider renegotiating terms'
    else if (bandNetProfit < 0) recommendation = 'Unfavorable for band - they may not accept'
    else if (cowboyProfitMargin < 10) recommendation = 'Marginal for venue - consider reducing costs'
    else if (cowboyProfitMargin >= 30 && bandProfitMargin >= 30) recommendation = 'Outstanding - very profitable for both parties!'

    return {
      totalRevenue,
      totalCOGS,
      totalFixedCosts,
      grossProfit,
      netProfit,
      breakEvenAttendance,
      profitMargin,
      riskLevel,
      recommendation,
      revenuePerCustomer,
      costPerCustomer,
      profitPerCustomer,
      cowboy: {
        revenue: cowboyRevenue,
        cogs: totalCOGS,
        fixedCosts: totalFixedCosts,
        grossProfit: cowboyGrossProfit,
        netProfit: cowboyNetProfit,
        profitMargin: cowboyProfitMargin
      },
      band: {
        revenue: bandRevenue,
        costs: bandOffer,
        netProfit: bandNetProfit,
        profitMargin: bandProfitMargin
      }
    }
  }, [inputs])

  const updateInput = (field: keyof FinancialInputs, value: number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveScenario = () => {
    const name = prompt('Enter a name for this scenario:')
    if (name && name.trim()) {
      const newScenario = {
        name: name.trim(),
        inputs: { ...inputs },
        results: { ...results },
        timestamp: new Date()
      }
      setSavedScenarios(prev => [...prev, newScenario])
    }
  }

  const loadScenario = (scenario: typeof savedScenarios[0]) => {
    setInputs(scenario.inputs)
  }

  const clearInputs = () => {
    setInputs({
      bandOffer: 0,
      estimatedAttendance: 0,
      ticketPrice: 15,
      barRevenue: 25,
      merchandiseRevenue: 0, // default to 0
      coverCharge: 10,
      ticketSplitToCowboy: 0, // default to 0%
      merchSplitToCowboy: 0, // default to 0%
      barCOGS: 30,
      merchandiseCOGS: 40,
      staffCosts: 800,
      utilitiesCosts: 200,
      facilityCosts: 300,
      marketingCosts: 150,
      otherFixedCosts: 100
    })
  }

  // Calculate drink estimates for bar revenue
  const calculateDrinkEstimate = (barRevenue: number) => {
    if (barRevenue <= 0) return ''
    
    // Assume average drink cost after COGS
    const avgDrinkPrice = 6 // Average drink price
    const avgDrinkCost = avgDrinkPrice * (inputs.barCOGS / 100) // Cost of drink
    const avgDrinkProfit = avgDrinkPrice - avgDrinkCost // Profit per drink
    
    const drinksNeeded = Math.ceil(barRevenue / avgDrinkPrice)
    const drinksRange = `${Math.max(1, Math.ceil(barRevenue / 8))}-${Math.ceil(barRevenue / 4)}`
    
    return `≈ ${drinksNeeded} drinks ($${avgDrinkPrice} avg) or ${drinksRange} drinks ($4-8 range)`
  }

  // Download financial report
  const downloadReport = () => {
    const reportContent = `
FINANCIAL ANALYSIS REPORT
The Cowboy Music Venue

Generated: ${new Date().toLocaleDateString()}
Show Details: ${inputs.estimatedAttendance} expected attendance

=== COWBOY FINANCIAL SUMMARY ===
Revenue: $${results.cowboy.revenue.toLocaleString()}
COGS: $${results.cowboy.cogs.toLocaleString()}
Fixed Costs: $${results.cowboy.fixedCosts.toLocaleString()}
NET PROFIT: $${results.cowboy.netProfit.toLocaleString()}
Profit Margin: ${results.cowboy.profitMargin.toFixed(1)}%

=== BAND FINANCIAL SUMMARY ===
Revenue: $${results.band.revenue.toLocaleString()}
Costs (Payment to Venue): $${results.band.costs.toLocaleString()}
NET PROFIT: $${results.band.netProfit.toLocaleString()}
Profit Margin: ${results.band.profitMargin.toFixed(1)}%

=== BREAK-EVEN ANALYSIS ===
Break-even Attendance: ${results.breakEvenAttendance}
Risk Level: ${results.riskLevel}
Recommendation: ${results.recommendation}

=== REVENUE BREAKDOWN ===
Ticket Price: $${inputs.ticketPrice} (Cowboy gets ${inputs.ticketSplitToCowboy}%)
Cover Charge: $${inputs.coverCharge} (100% to Cowboy)
Bar Revenue per Person: $${inputs.barRevenue} (100% to Cowboy)
Merchandise per Person: $${inputs.merchandiseRevenue} (Cowboy gets ${inputs.merchSplitToCowboy}%)

Generated by The Cowboy Venue Management System
    `

    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cowboy-financial-analysis-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-slate-700 p-2 rounded-lg hover:bg-slate-600 transition-colors touch-manipulation"
              >
                <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
              <div className="bg-green-500 p-2 sm:p-3 rounded-lg">
                <CalculatorIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Financial Analysis</h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">Break-even analysis and profitability calculator</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={downloadReport}
                className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base touch-manipulation"
              >
                Download Report
              </button>
              <button
                onClick={saveScenario}
                className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base touch-manipulation"
              >
                Save Scenario
              </button>
              <button
                onClick={clearInputs}
                className="px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base touch-manipulation"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Financial Comparison Summary */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-600" />
            Financial Comparison
          </h2>
          
          {/* Cowboy vs Band Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Cowboy Results */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
              <h3 className="text-lg font-bold text-green-800 mb-3 text-center">The Cowboy</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    ${results.cowboy.revenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Revenue</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${results.cowboy.netProfit >= 0 ? 'bg-white' : 'bg-red-50'}`}>
                  <div className={`text-lg font-bold ${results.cowboy.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${results.cowboy.netProfit.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Net Profit</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg col-span-2">
                  <div className="text-lg font-bold text-blue-600">
                    {results.cowboy.profitMargin.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Profit Margin</div>
                </div>
              </div>
            </div>

            {/* Band Results */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4">
              <h3 className="text-lg font-bold text-purple-800 mb-3 text-center">The Band</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    ${results.band.revenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Revenue</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${results.band.netProfit >= 0 ? 'bg-white' : 'bg-red-50'}`}>
                  <div className={`text-lg font-bold ${results.band.netProfit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    ${results.band.netProfit.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Net Profit</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg col-span-2">
                  <div className="text-lg font-bold text-blue-600">
                    {results.band.profitMargin.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Profit Margin</div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Overall Analysis */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {results.breakEvenAttendance.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Break-even Attendance</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {results.profitMargin.toFixed(1)}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Combined Margin</div>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              results.riskLevel === 'Low' ? 'bg-green-50 border border-green-200' :
              results.riskLevel === 'Medium' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <div className={`text-xl sm:text-2xl font-bold ${
                results.riskLevel === 'Low' ? 'text-green-600' :
                results.riskLevel === 'Medium' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {results.riskLevel}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Risk Level</div>
            </div>
            <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-gray-600">
                ${results.revenuePerCustomer.toFixed(0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Revenue/Customer</div>
            </div>
          </div>
          
          {/* Recommendation */}
          <div className={`mt-4 p-4 rounded-lg flex items-center ${
            results.cowboy.netProfit < 0 || results.band.netProfit < 0 ? 'bg-red-50 border border-red-200' :
            results.cowboy.profitMargin < 10 ? 'bg-yellow-50 border border-yellow-200' :
            'bg-green-50 border border-green-200'
          }`}>
            {results.cowboy.netProfit < 0 || results.band.netProfit < 0 ? 
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3" /> :
              results.cowboy.profitMargin < 10 ?
              <InformationCircleIcon className="h-5 w-5 text-yellow-600 mr-3" /> :
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
            }
            <div>
              <div className="font-semibold text-gray-900">Recommendation</div>
              <div className="text-sm text-gray-700">{results.recommendation}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Section */}
          <div className="space-y-6">
            
            {/* Basic Show Details */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-600" />
                Show Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Band Offer ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.bandOffer || ''}
                    onChange={(e) => updateInput('bandOffer', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Attendance
                  </label>
                  <input
                    type="number"
                    value={inputs.estimatedAttendance || ''}
                    onChange={(e) => updateInput('estimatedAttendance', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Venue Revenue (Cowboy Gets 100%) */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Venue Revenue (100% to Cowboy)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Cover Charge ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.coverCharge || ''}
                    onChange={(e) => updateInput('coverCharge', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  />
                  <div className="text-xs text-green-600 mt-1">Door charge for entry</div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Avg Bar Revenue per Person ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.barRevenue || ''}
                    onChange={(e) => updateInput('barRevenue', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  />
                  {inputs.barRevenue > 0 && (
                    <div className="text-xs text-green-600 mt-1 bg-green-50 p-2 rounded">
                      💡 {calculateDrinkEstimate(inputs.barRevenue)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shared Revenue (Negotiable Split) */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Shared Revenue (Negotiable Split)
              </h3>
              <div className="space-y-4">
                
                {/* Ticket Revenue */}
                <div className="bg-white p-4 rounded-lg border border-yellow-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-1">
                        Ticket Price ($)
                      </label>
                      <input
                        type="number"
                        value={inputs.ticketPrice || ''}
                        onChange={(e) => updateInput('ticketPrice', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-1">
                        Cowboy's Share (%)
                      </label>
                      <input
                        type="number"
                        value={inputs.ticketSplitToCowboy || ''}
                        onChange={(e) => updateInput('ticketSplitToCowboy', Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        min="0"
                        max="100"
                      />
                      <div className="text-xs text-yellow-600 mt-1">
                        Band gets {100 - inputs.ticketSplitToCowboy}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Merchandise Revenue */}
                <div className="bg-white p-4 rounded-lg border border-yellow-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-1">
                        Avg Merchandise per Person ($)
                      </label>
                      <input
                        type="number"
                        value={inputs.merchandiseRevenue || ''}
                        onChange={(e) => updateInput('merchandiseRevenue', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                      <div className="text-xs text-yellow-600 mt-1">T-shirts, CDs, etc.</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-1">
                        Cowboy's Share (%)
                      </label>
                      <input
                        type="number"
                        value={inputs.merchSplitToCowboy || ''}
                        onChange={(e) => updateInput('merchSplitToCowboy', Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        min="0"
                        max="100"
                      />
                      <div className="text-xs text-yellow-600 mt-1">
                        Band gets {100 - inputs.merchSplitToCowboy}%
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>

            {/* COGS - Venue Only */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-orange-800 mb-4">
                Cost of Goods Sold - Venue Only (%)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    Bar COGS (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.barCOGS || ''}
                    onChange={(e) => updateInput('barCOGS', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    min="0"
                    max="100"
                  />
                  <div className="text-xs text-orange-600 mt-1">Cost of drinks/food sold</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    Merchandise COGS (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.merchandiseCOGS || ''}
                    onChange={(e) => updateInput('merchandiseCOGS', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    min="0"
                    max="100"
                  />
                  <div className="text-xs text-orange-600 mt-1">Only if venue sells merchandise</div>
                </div>
              </div>
            </div>

            {/* Fixed Costs - Venue Only */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">
                Venue Fixed Costs (Per Show)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    Staff Costs ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.staffCosts || ''}
                    onChange={(e) => updateInput('staffCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  />
                  <div className="text-xs text-red-600 mt-1">Bartenders, security, sound tech</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    Utilities ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.utilitiesCosts || ''}
                    onChange={(e) => updateInput('utilitiesCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  />
                  <div className="text-xs text-red-600 mt-1">Power, water, AC for event</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    Facility Costs ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.facilityCosts || ''}
                    onChange={(e) => updateInput('facilityCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  />
                  <div className="text-xs text-red-600 mt-1">Cleaning, setup, maintenance</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    Marketing ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.marketingCosts || ''}
                    onChange={(e) => updateInput('marketingCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  />
                  <div className="text-xs text-red-600 mt-1">Ads, flyers, promotion</div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    Other Fixed Costs ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.otherFixedCosts || ''}
                    onChange={(e) => updateInput('otherFixedCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  />
                  <div className="text-xs text-red-600 mt-1">Insurance, permits, misc expenses</div>
                </div>
              </div>
            </div>

          </div>

          {/* Results Section */}
          <div className="space-y-6">
            
            {/* Detailed Financial Breakdown - Split View */}
            
            {/* Cowboy Detailed Breakdown */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                The Cowboy - Financial Breakdown
              </h3>
              <div className="space-y-4">
                
                {/* Cowboy Revenue */}
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Cowboy Revenue</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Cover Charges ({inputs.estimatedAttendance} × ${inputs.coverCharge})</span>
                      <span>${(inputs.estimatedAttendance * inputs.coverCharge).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bar Sales ({inputs.estimatedAttendance} × ${inputs.barRevenue})</span>
                      <span>${(inputs.estimatedAttendance * inputs.barRevenue).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tickets ({inputs.ticketSplitToCowboy}% of ${(inputs.estimatedAttendance * inputs.ticketPrice).toLocaleString()})</span>
                      <span>${(inputs.estimatedAttendance * inputs.ticketPrice * inputs.ticketSplitToCowboy / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Merchandise ({inputs.merchSplitToCowboy}% of ${(inputs.estimatedAttendance * inputs.merchandiseRevenue).toLocaleString()})</span>
                      <span>${(inputs.estimatedAttendance * inputs.merchandiseRevenue * inputs.merchSplitToCowboy / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-800 border-t border-green-200 pt-2">
                      <span>Total Cowboy Revenue</span>
                      <span>${results.cowboy.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Cowboy COGS */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2">Cost of Goods Sold</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Bar COGS ({inputs.barCOGS}%)</span>
                      <span>${(inputs.estimatedAttendance * inputs.barRevenue * inputs.barCOGS / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Merchandise COGS ({inputs.merchandiseCOGS}%)</span>
                      <span>${(inputs.estimatedAttendance * inputs.merchandiseRevenue * inputs.merchSplitToCowboy / 100 * inputs.merchandiseCOGS / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-orange-800 border-t border-orange-200 pt-2">
                      <span>Total COGS</span>
                      <span>${results.cowboy.cogs.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Cowboy Gross Profit */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex justify-between font-semibold text-blue-800">
                    <span>Gross Profit (Revenue - COGS)</span>
                    <span>${results.cowboy.grossProfit.toLocaleString()}</span>
                  </div>
                </div>

                {/* Cowboy Fixed Costs */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-2">Fixed Costs</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Band Payment</span>
                      <span>${inputs.bandOffer.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Staff</span>
                      <span>${inputs.staffCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Utilities</span>
                      <span>${inputs.utilitiesCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Facility</span>
                      <span>${inputs.facilityCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marketing</span>
                      <span>${inputs.marketingCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other</span>
                      <span>${inputs.otherFixedCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-red-800 border-t border-red-200 pt-2">
                      <span>Total Fixed Costs</span>
                      <span>${results.cowboy.fixedCosts.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Cowboy Net Profit */}
                <div className={`p-4 rounded-lg border-2 ${results.cowboy.netProfit >= 0 ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
                  <div className={`flex justify-between font-bold text-lg ${results.cowboy.netProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                    <span>COWBOY NET PROFIT</span>
                    <span>${results.cowboy.netProfit.toLocaleString()}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Band Detailed Breakdown */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">
                The Band - Financial Breakdown
              </h3>
              <div className="space-y-4">
                
                {/* Band Revenue */}
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Band Revenue</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Tickets ({100 - inputs.ticketSplitToCowboy}% of ${(inputs.estimatedAttendance * inputs.ticketPrice).toLocaleString()})</span>
                      <span>${(inputs.estimatedAttendance * inputs.ticketPrice * (100 - inputs.ticketSplitToCowboy) / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Merchandise ({100 - inputs.merchSplitToCowboy}% of ${(inputs.estimatedAttendance * inputs.merchandiseRevenue).toLocaleString()})</span>
                      <span>${(inputs.estimatedAttendance * inputs.merchandiseRevenue * (100 - inputs.merchSplitToCowboy) / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-purple-800 border-t border-purple-200 pt-2">
                      <span>Total Band Revenue</span>
                      <span>${results.band.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Band Costs */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-2">Band Costs</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Payment to Venue</span>
                      <span>${inputs.bandOffer.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-red-600 mt-2">
                      * Band also has their own costs (travel, equipment, etc.) not shown here
                    </div>
                  </div>
                </div>

                {/* Band Net Profit */}
                <div className={`p-4 rounded-lg border-2 ${results.band.netProfit >= 0 ? 'bg-purple-100 border-purple-300' : 'bg-red-100 border-red-300'}`}>
                  <div className={`flex justify-between font-bold text-lg ${results.band.netProfit >= 0 ? 'text-purple-800' : 'text-red-800'}`}>
                    <span>BAND NET PROFIT</span>
                    <span>${results.band.netProfit.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Before band's own expenses (travel, equipment, etc.)
                  </div>
                </div>

              </div>
            </div>

            {/* Per Customer Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Per Customer Analysis
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${results.revenuePerCustomer.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue per Customer</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    ${results.costPerCustomer.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Cost per Customer</div>
                </div>
                <div className={`text-center p-4 rounded-lg ${results.profitPerCustomer >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
                  <div className={`text-2xl font-bold ${results.profitPerCustomer >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ${results.profitPerCustomer.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Combined Profit per Customer</div>
                </div>
              </div>
              
              {/* Individual breakdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Cowboy Per Customer</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Revenue:</span>
                      <span>${inputs.estimatedAttendance > 0 ? (results.cowboy.revenue / inputs.estimatedAttendance).toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit:</span>
                      <span className={inputs.estimatedAttendance > 0 && results.cowboy.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${inputs.estimatedAttendance > 0 ? (results.cowboy.netProfit / inputs.estimatedAttendance).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Band Per Customer</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Revenue:</span>
                      <span>${inputs.estimatedAttendance > 0 ? (results.band.revenue / inputs.estimatedAttendance).toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit:</span>
                      <span className={inputs.estimatedAttendance > 0 && results.band.netProfit >= 0 ? 'text-purple-600' : 'text-red-600'}>
                        ${inputs.estimatedAttendance > 0 ? (results.band.netProfit / inputs.estimatedAttendance).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Break-even Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Break-even Analysis (Venue Perspective)
              </h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {results.breakEvenAttendance.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">People needed for venue to break even</div>
                    
                    {inputs.estimatedAttendance > 0 && (
                      <div className={`text-sm font-medium ${
                        results.breakEvenAttendance <= inputs.estimatedAttendance ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {results.breakEvenAttendance <= inputs.estimatedAttendance 
                          ? `✓ Safe - ${inputs.estimatedAttendance - results.breakEvenAttendance} person buffer`
                          : `⚠ Risk - Need ${results.breakEvenAttendance - inputs.estimatedAttendance} more people`
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Scenario Analysis */}
                {inputs.estimatedAttendance > 0 && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="font-semibold">Worst Case (70%)</div>
                      <div>{Math.round(inputs.estimatedAttendance * 0.7)} people</div>
                      <div className="text-xs mt-1">
                        <div className={results.breakEvenAttendance <= inputs.estimatedAttendance * 0.7 ? 'text-green-600' : 'text-red-600'}>
                          Venue: {results.breakEvenAttendance <= inputs.estimatedAttendance * 0.7 ? 'Profit' : 'Loss'}
                        </div>
                        <div className="text-purple-600">
                          Band: ${Math.round((results.band.revenue * 0.7) - results.band.costs).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="font-semibold">Expected</div>
                      <div>{inputs.estimatedAttendance} people</div>
                      <div className="text-xs mt-1">
                        <div className={results.breakEvenAttendance <= inputs.estimatedAttendance ? 'text-green-600' : 'text-red-600'}>
                          Venue: {results.breakEvenAttendance <= inputs.estimatedAttendance ? 'Profit' : 'Loss'}
                        </div>
                        <div className="text-purple-600">
                          Band: ${results.band.netProfit.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-semibold">Best Case (130%)</div>
                      <div>{Math.round(inputs.estimatedAttendance * 1.3)} people</div>
                      <div className="text-xs mt-1">
                        <div className={results.breakEvenAttendance <= inputs.estimatedAttendance * 1.3 ? 'text-green-600' : 'text-red-600'}>
                          Venue: {results.breakEvenAttendance <= inputs.estimatedAttendance * 1.3 ? 'Profit' : 'Loss'}
                        </div>
                        <div className="text-purple-600">
                          Band: ${Math.round((results.band.revenue * 1.3) - results.band.costs).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Saved Scenarios */}
        {savedScenarios.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Saved Scenarios
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedScenarios.map((scenario, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
                    <button
                      onClick={() => loadScenario(scenario)}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Load
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Band: ${scenario.inputs.bandOffer.toLocaleString()}</div>
                    <div>Attendance: {scenario.inputs.estimatedAttendance}</div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className={scenario.results.cowboy.netProfit >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        Cowboy: ${scenario.results.cowboy.netProfit.toLocaleString()}
                      </div>
                      <div className={scenario.results.band.netProfit >= 0 ? 'text-purple-600 font-semibold' : 'text-red-600 font-semibold'}>
                        Band: ${scenario.results.band.netProfit.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {scenario.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
