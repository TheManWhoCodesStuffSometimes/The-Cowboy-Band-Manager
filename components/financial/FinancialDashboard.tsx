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
}

export default function FinancialDashboard() {
  const router = useRouter()
  
  const [inputs, setInputs] = useState<FinancialInputs>({
    bandOffer: 0,
    estimatedAttendance: 0,
    ticketPrice: 15,
    barRevenue: 25, // per person average
    merchandiseRevenue: 5, // per person average
    coverCharge: 10,
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
    const totalRevenue = ticketRevenue + coverChargeRevenue + totalBarRevenue + totalMerchandiseRevenue

    // COGS calculations
    const barCOGSAmount = totalBarRevenue * (barCOGS / 100)
    const merchandiseCOGSAmount = totalMerchandiseRevenue * (merchandiseCOGS / 100)
    const totalCOGS = barCOGSAmount + merchandiseCOGSAmount

    // Fixed costs
    const totalFixedCosts = bandOffer + staffCosts + utilitiesCosts + facilityCosts + marketingCosts + otherFixedCosts

    // Profit calculations
    const grossProfit = totalRevenue - totalCOGS
    const netProfit = grossProfit - totalFixedCosts

    // Per customer metrics
    const revenuePerCustomer = estimatedAttendance > 0 ? totalRevenue / estimatedAttendance : 0
    const costPerCustomer = estimatedAttendance > 0 ? (totalCOGS + totalFixedCosts) / estimatedAttendance : 0
    const profitPerCustomer = estimatedAttendance > 0 ? netProfit / estimatedAttendance : 0

    // Break-even analysis
    const variableRevenuePerPerson = ticketPrice + coverCharge + barRevenue + merchandiseRevenue
    const variableCOGSPerPerson = (barRevenue * barCOGS / 100) + (merchandiseRevenue * merchandiseCOGS / 100)
    const contributionMarginPerPerson = variableRevenuePerPerson - variableCOGSPerPerson
    const breakEvenAttendance = contributionMarginPerPerson > 0 ? Math.ceil(totalFixedCosts / contributionMarginPerPerson) : 0

    // Profit margin
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Risk assessment
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low'
    if (breakEvenAttendance > estimatedAttendance * 1.2) riskLevel = 'High'
    else if (breakEvenAttendance > estimatedAttendance * 0.8) riskLevel = 'Medium'

    // Recommendation
    let recommendation = 'Excellent opportunity - high profit potential!'
    if (netProfit < 0) recommendation = 'Not recommended - will result in a loss'
    else if (profitMargin < 10) recommendation = 'Marginal - consider negotiating lower costs'
    else if (profitMargin < 20) recommendation = 'Acceptable - reasonable profit expected'
    else if (profitMargin >= 30) recommendation = 'Outstanding - very profitable booking!'

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
      profitPerCustomer
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
      merchandiseRevenue: 5,
      coverCharge: 10,
      barCOGS: 30,
      merchandiseCOGS: 40,
      staffCosts: 800,
      utilitiesCosts: 200,
      facilityCosts: 300,
      marketingCosts: 150,
      otherFixedCosts: 100
    })
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
        
        {/* Quick Results Summary */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-600" />
            Quick Results
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className={`text-center p-4 rounded-lg ${results.netProfit >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`text-xl sm:text-2xl font-bold ${results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${results.netProfit.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Net Profit</div>
            </div>
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
              <div className="text-xs sm:text-sm text-gray-600">Profit Margin</div>
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
          </div>
          
          {/* Recommendation */}
          <div className={`mt-4 p-4 rounded-lg flex items-center ${
            results.netProfit < 0 ? 'bg-red-50 border border-red-200' :
            results.profitMargin < 10 ? 'bg-yellow-50 border border-yellow-200' :
            'bg-green-50 border border-green-200'
          }`}>
            {results.netProfit < 0 ? 
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3" /> :
              results.profitMargin < 10 ?
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

            {/* Revenue Streams */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Revenue Per Customer
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticket Price ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.ticketPrice || ''}
                    onChange={(e) => updateInput('ticketPrice', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Charge ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.coverCharge || ''}
                    onChange={(e) => updateInput('coverCharge', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avg Bar Revenue per Person ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.barRevenue || ''}
                    onChange={(e) => updateInput('barRevenue', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avg Merchandise per Person ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.merchandiseRevenue || ''}
                    onChange={(e) => updateInput('merchandiseRevenue', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* COGS */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cost of Goods Sold (%)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bar COGS (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.barCOGS || ''}
                    onChange={(e) => updateInput('barCOGS', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    max="100"
                  />
                  <div className="text-xs text-gray-500 mt-1">Typical range: 25-35%</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Merchandise COGS (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.merchandiseCOGS || ''}
                    onChange={(e) => updateInput('merchandiseCOGS', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    max="100"
                  />
                  <div className="text-xs text-gray-500 mt-1">Typical range: 35-50%</div>
                </div>
              </div>
            </div>

            {/* Fixed Costs */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Fixed Costs (Per Show)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Costs ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.staffCosts || ''}
                    onChange={(e) => updateInput('staffCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Utilities ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.utilitiesCosts || ''}
                    onChange={(e) => updateInput('utilitiesCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facility Costs ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.facilityCosts || ''}
                    onChange={(e) => updateInput('facilityCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marketing ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.marketingCosts || ''}
                    onChange={(e) => updateInput('marketingCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Fixed Costs ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.otherFixedCosts || ''}
                    onChange={(e) => updateInput('otherFixedCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Results Section */}
          <div className="space-y-6">
            
            {/* Detailed Financial Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Financial Breakdown
              </h3>
              <div className="space-y-4">
                
                {/* Revenue */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Revenue</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Tickets ({inputs.estimatedAttendance} × ${inputs.ticketPrice})</span>
                      <span>${(inputs.estimatedAttendance * inputs.ticketPrice).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cover Charges ({inputs.estimatedAttendance} × ${inputs.coverCharge})</span>
                      <span>${(inputs.estimatedAttendance * inputs.coverCharge).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bar Sales ({inputs.estimatedAttendance} × ${inputs.barRevenue})</span>
                      <span>${(inputs.estimatedAttendance * inputs.barRevenue).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Merchandise ({inputs.estimatedAttendance} × ${inputs.merchandiseRevenue})</span>
                      <span>${(inputs.estimatedAttendance * inputs.merchandiseRevenue).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-800 border-t border-green-200 pt-2">
                      <span>Total Revenue</span>
                      <span>${results.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* COGS */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Cost of Goods Sold</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Bar COGS ({inputs.barCOGS}%)</span>
                      <span>${(inputs.estimatedAttendance * inputs.barRevenue * inputs.barCOGS / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Merchandise COGS ({inputs.merchandiseCOGS}%)</span>
                      <span>${(inputs.estimatedAttendance * inputs.merchandiseRevenue * inputs.merchandiseCOGS / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-yellow-800 border-t border-yellow-200 pt-2">
                      <span>Total COGS</span>
                      <span>${results.totalCOGS.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Gross Profit */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between font-semibold text-blue-800">
                    <span>Gross Profit (Revenue - COGS)</span>
                    <span>${results.grossProfit.toLocaleString()}</span>
                  </div>
                </div>

                {/* Fixed Costs */}
                <div className="bg-red-50 p-4 rounded-lg">
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
                      <span>${results.totalFixedCosts.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Net Profit */}
                <div className={`p-4 rounded-lg ${results.netProfit >= 0 ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'}`}>
                  <div className={`flex justify-between font-bold text-lg ${results.netProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                    <span>NET PROFIT</span>
                    <span>${results.netProfit.toLocaleString()}</span>
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
                  <div className="text-sm text-gray-600">Revenue per Customer</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    ${results.costPerCustomer.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Cost per Customer</div>
                </div>
                <div className={`text-center p-4 rounded-lg ${results.profitPerCustomer >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
                  <div className={`text-2xl font-bold ${results.profitPerCustomer >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ${results.profitPerCustomer.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Profit per Customer</div>
                </div>
              </div>
            </div>

            {/* Break-even Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Break-even Analysis
              </h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {results.breakEvenAttendance.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">People needed to break even</div>
                    
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
                      <div className={results.breakEvenAttendance <= inputs.estimatedAttendance * 0.7 ? 'text-green-600' : 'text-red-600'}>
                        {results.breakEvenAttendance <= inputs.estimatedAttendance * 0.7 ? 'Profitable' : 'Loss'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="font-semibold">Expected</div>
                      <div>{inputs.estimatedAttendance} people</div>
                      <div className={results.breakEvenAttendance <= inputs.estimatedAttendance ? 'text-green-600' : 'text-red-600'}>
                        {results.breakEvenAttendance <= inputs.estimatedAttendance ? 'Profitable' : 'Loss'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-semibold">Best Case (130%)</div>
                      <div>{Math.round(inputs.estimatedAttendance * 1.3)} people</div>
                      <div className={results.breakEvenAttendance <= inputs.estimatedAttendance * 1.3 ? 'text-green-600' : 'text-red-600'}>
                        {results.breakEvenAttendance <= inputs.estimatedAttendance * 1.3 ? 'Profitable' : 'Loss'}
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
                    <div className={scenario.results.netProfit >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      Profit: ${scenario.results.netProfit.toLocaleString()}
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
