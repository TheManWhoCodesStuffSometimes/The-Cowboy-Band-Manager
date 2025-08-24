// components/financial/FinancialDashboard.tsx - Cowboy vs Band Split + PDF export
'use client'

import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalculatorIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  DocumentArrowDownIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'

/*********************************
 * Types
 *********************************/
interface FinancialInputs {
  // Show basics
  bandOffer: number // Band guarantee paid by Cowboy
  estimatedAttendance: number
  ticketPrice: number
  coverCharge: number // Cowboy collects if used (set 0 if ticketed show only)

  // Per-person averages
  barRevenue: number // Cowboy bar revenue per person
  merchandiseRevenue: number // Band merch revenue per person (defaults to 0)

  // COGS
  barCOGS: number // % of bar revenue
  merchandiseCOGS: number // % of merch revenue (band bears this)

  // Fixed costs (Cowboy)
  staffCosts: number
  utilitiesCosts: number
  facilityCosts: number
  marketingCosts: number
  otherFixedCosts: number

  // Splits to Cowboy (defaults 0)
  ticketSplitPct: number // % of ticket gross that goes to Cowboy
  merchSplitPct: number // % of merch gross that goes to Cowboy

  // Optional band-side expenses (travel/lodging/crew)
  bandExpenses: number

  // Drink estimate helper (ties to Bar COGS)
  avgDrinkIngredientCost: number // estimated ingredient cost per drink ($)
}

interface SideResults {
  totalRevenue: number
  totalCOGS: number
  totalFixedCosts: number
  grossProfit: number
  netProfit: number
  revenuePerCustomer: number
  costPerCustomer: number
  profitPerCustomer: number
}

interface GlobalKPIs {
  cowboyBreakEvenAttendance: number
  cowboyProfitMargin: number
  cowboyRiskLevel: 'Low' | 'Medium' | 'High'
  recommendation: string
  drinksEstimate: {
    impliedMenuPrice: number
    drinksCount: number
  }
}

/*********************************
 * Component
 *********************************/
export default function FinancialDashboard() {
  const router = useRouter()
  const pdfRef = useRef<HTMLDivElement | null>(null)

  const [inputs, setInputs] = useState<FinancialInputs>({
    bandOffer: 0,
    estimatedAttendance: 0,
    ticketPrice: 15,
    coverCharge: 10,

    barRevenue: 25, // per person average (Cowboy)
    merchandiseRevenue: 0, // default 0 — band merch per person

    barCOGS: 30, // 30% of bar revenue
    merchandiseCOGS: 40, // 40% of BAND merch revenue

    staffCosts: 800,
    utilitiesCosts: 200,
    facilityCosts: 300,
    marketingCosts: 150,
    otherFixedCosts: 100,

    ticketSplitPct: 0,
    merchSplitPct: 0,

    bandExpenses: 0,

    avgDrinkIngredientCost: 2.0, // $2 ingredient cost → with 30% COGS => ~$6.67 price
  })

  const updateInput = (field: keyof FinancialInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
  }

  /*********************************
   * Core calcs
   *********************************/
  const {
    bandOffer,
    estimatedAttendance,
    ticketPrice,
    coverCharge,
    barRevenue,
    merchandiseRevenue,
    barCOGS,
    merchandiseCOGS,
    staffCosts,
    utilitiesCosts,
    facilityCosts,
    marketingCosts,
    otherFixedCosts,
    ticketSplitPct,
    merchSplitPct,
    bandExpenses,
    avgDrinkIngredientCost,
  } = inputs

  const ticketRevenue = estimatedAttendance * ticketPrice
  const coverRevenue = estimatedAttendance * coverCharge
  const totalBarRevenue = estimatedAttendance * barRevenue
  const totalMerchRevenue = estimatedAttendance * merchandiseRevenue

  const cowboyTicketShare = ticketRevenue * (ticketSplitPct / 100)
  const bandTicketShare = ticketRevenue - cowboyTicketShare

  const cowboyMerchShare = totalMerchRevenue * (merchSplitPct / 100)
  const bandMerchShare = totalMerchRevenue - cowboyMerchShare

  // COGS split: Cowboy only bears bar COGS; Band bears merch COGS
  const cowboyCOGS = totalBarRevenue * (barCOGS / 100)
  const bandCOGS = bandMerchShare * (merchandiseCOGS / 100)

  // Fixed costs: Cowboy bears venue fixed costs + band guarantee
  const cowboyFixed =
    bandOffer +
    staffCosts +
    utilitiesCosts +
    facilityCosts +
    marketingCosts +
    otherFixedCosts

  // Cowboy revenue streams: bar, cover, ticket split, merch split
  const cowboyRevenue = totalBarRevenue + coverRevenue + cowboyTicketShare + cowboyMerchShare
  const cowboyGross = cowboyRevenue - cowboyCOGS
  const cowboyNet = cowboyGross - cowboyFixed

  // Band revenue streams: ticket remainder + merch remainder + guarantee
  const bandRevenueTotal = bandTicketShare + bandMerchShare + bandOffer
  const bandFixed = bandExpenses
  const bandGross = bandRevenueTotal - bandCOGS
  const bandNet = bandGross - bandFixed

  // Per-customer metrics
  const cowboyRevenuePerCustomer = estimatedAttendance > 0 ? cowboyRevenue / estimatedAttendance : 0
  const cowboyCostPerCustomer =
    estimatedAttendance > 0 ? (cowboyCOGS + cowboyFixed) / estimatedAttendance : 0
  const cowboyProfitPerCustomer = estimatedAttendance > 0 ? cowboyNet / estimatedAttendance : 0

  const bandRevenuePerCustomer = estimatedAttendance > 0 ? bandRevenueTotal / estimatedAttendance : 0
  const bandCostPerCustomer = estimatedAttendance > 0 ? (bandCOGS + bandFixed) / estimatedAttendance : 0
  const bandProfitPerCustomer = estimatedAttendance > 0 ? bandNet / estimatedAttendance : 0

  // Cowboy break-even uses only Cowboy contribution margin
  const cowboyVariableRevPerPerson =
    barRevenue +
    coverCharge +
    ticketPrice * (ticketSplitPct / 100) +
    merchandiseRevenue * (merchSplitPct / 100)

  const cowboyVariableCostPerPerson = barRevenue * (barCOGS / 100)
  const cowboyContributionPerPerson =
    cowboyVariableRevPerPerson - cowboyVariableCostPerPerson

  const cowboyBreakEvenAttendance =
    cowboyContributionPerPerson > 0
      ? Math.ceil(cowboyFixed / cowboyContributionPerPerson)
      : 0

  const cowboyProfitMargin = cowboyRevenue > 0 ? (cowboyNet / cowboyRevenue) * 100 : 0

  // Risk & recommendation (Cowboy focus)
  let cowboyRiskLevel: GlobalKPIs['cowboyRiskLevel'] = 'Low'
  if (cowboyBreakEvenAttendance > estimatedAttendance * 1.2) cowboyRiskLevel = 'High'
  else if (cowboyBreakEvenAttendance > estimatedAttendance * 0.8) cowboyRiskLevel = 'Medium'

  let recommendation = 'Excellent opportunity - high profit potential!'
  if (cowboyNet < 0) recommendation = 'Not recommended - Cowboy operates at a loss'
  else if (cowboyProfitMargin < 10) recommendation = 'Marginal - consider negotiating costs or terms'
  else if (cowboyProfitMargin < 20) recommendation = 'Acceptable - reasonable profit expected'
  else if (cowboyProfitMargin >= 30) recommendation = 'Outstanding - very profitable booking!'

  // Drink estimate (ties to COGS): price ≈ ingredientCost / (COGS%)
  const impliedMenuPrice =
    barCOGS > 0 ? avgDrinkIngredientCost / (barCOGS / 100) : 0
  const drinksCount = impliedMenuPrice > 0 ? barRevenue / impliedMenuPrice : 0

  const cowboyResults: SideResults = {
    totalRevenue: cowboyRevenue,
    totalCOGS: cowboyCOGS,
    totalFixedCosts: cowboyFixed,
    grossProfit: cowboyGross,
    netProfit: cowboyNet,
    revenuePerCustomer: cowboyRevenuePerCustomer,
    costPerCustomer: cowboyCostPerCustomer,
    profitPerCustomer: cowboyProfitPerCustomer,
  }

  const bandResults: SideResults = {
    totalRevenue: bandRevenueTotal,
    totalCOGS: bandCOGS,
    totalFixedCosts: bandFixed,
    grossProfit: bandGross,
    netProfit: bandNet,
    revenuePerCustomer: bandRevenuePerCustomer,
    costPerCustomer: bandCostPerCustomer,
    profitPerCustomer: bandProfitPerCustomer,
  }

  const kpis: GlobalKPIs = {
    cowboyBreakEvenAttendance,
    cowboyProfitMargin,
    cowboyRiskLevel,
    recommendation,
    drinksEstimate: { impliedMenuPrice, drinksCount },
  }

  /*********************************
   * PDF
   *********************************/
  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return
    const mod = await import('html2pdf.js')
    const html2pdf = (mod as any).default || (mod as any)

    const opt = {
      margin: 0.35,
      filename: 'Cowboy-vs-Band-Financial-Analysis.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    }

    html2pdf().set(opt).from(pdfRef.current).save()
  }

  const clearInputs = () => {
    setInputs({
      bandOffer: 0,
      estimatedAttendance: 0,
      ticketPrice: 15,
      coverCharge: 10,
      barRevenue: 25,
      merchandiseRevenue: 0, // keep 0 default on reset
      barCOGS: 30,
      merchandiseCOGS: 40,
      staffCosts: 800,
      utilitiesCosts: 200,
      facilityCosts: 300,
      marketingCosts: 150,
      otherFixedCosts: 100,
      ticketSplitPct: 0,
      merchSplitPct: 0,
      bandExpenses: 0,
      avgDrinkIngredientCost: 2.0,
    })
  }

  /*********************************
   * UI
   *********************************/
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
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">Cowboy vs Band — break-even & profitability</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDownloadPDF}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base touch-manipulation flex items-center"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Download PDF
              </button>
              <button
                onClick={clearInputs}
                className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base touch-manipulation"
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

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            {/* Cowboy Net */}
            <div className={`text-center p-4 rounded-lg ${cowboyResults.netProfit >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`text-xl sm:text-2xl font-bold ${cowboyResults.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${cowboyResults.netProfit.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Cowboy Net Profit</div>
            </div>
            {/* Band Net */}
            <div className={`text-center p-4 rounded-lg ${bandResults.netProfit >= 0 ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`text-xl sm:text-2xl font-bold ${bandResults.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ${bandResults.netProfit.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Band Net Profit</div>
            </div>
            {/* Cowboy Break-even */}
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {kpis.cowboyBreakEvenAttendance.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Cowboy Break-even Attendance</div>
            </div>
            {/* Margin */}
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {kpis.cowboyProfitMargin.toFixed(1)}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Cowboy Profit Margin</div>
            </div>
            {/* Risk */}
            <div className={`text-center p-4 rounded-lg ${
              kpis.cowboyRiskLevel === 'Low' ? 'bg-green-50 border border-green-200' :
              kpis.cowboyRiskLevel === 'Medium' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <div className={`text-xl sm:text-2xl font-bold ${
                kpis.cowboyRiskLevel === 'Low' ? 'text-green-600' :
                kpis.cowboyRiskLevel === 'Medium' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {kpis.cowboyRiskLevel}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Risk Level</div>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`mt-4 p-4 rounded-lg flex items-center ${
            cowboyResults.netProfit < 0 ? 'bg-red-50 border border-red-200' :
            kpis.cowboyProfitMargin < 10 ? 'bg-yellow-50 border border-yellow-200' :
            'bg-green-50 border border-green-200'
          }`}>
            {cowboyResults.netProfit < 0 ? (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3" />
            ) : kpis.cowboyProfitMargin < 10 ? (
              <InformationCircleIcon className="h-5 w-5 text-yellow-600 mr-3" />
            ) : (
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
            )}
            <div>
              <div className="font-semibold text-gray-900">Recommendation</div>
              <div className="text-sm text-gray-700">{kpis.recommendation}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Inputs */}
          <div className="space-y-6">
            {/* Show Details */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-600" />
                Show Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Band Guarantee ($)</label>
                  <input
                    type="number"
                    value={bandOffer || ''}
                    onChange={(e) => updateInput('bandOffer', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Attendance</label>
                  <input
                    type="number"
                    value={estimatedAttendance || ''}
                    onChange={(e) => updateInput('estimatedAttendance', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Note: For most ticketed shows, set <span className="font-semibold">Cover Charge</span> to 0. Use it only for non-ticketed door cover scenarios.</p>
            </div>

            {/* Revenue Per Customer (shared inputs) */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Per Customer</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price ($)</label>
                  <input
                    type="number"
                    value={ticketPrice || ''}
                    onChange={(e) => updateInput('ticketPrice', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Charge ($)</label>
                  <input
                    type="number"
                    value={coverCharge || ''}
                    onChange={(e) => updateInput('coverCharge', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                {/* Bar revenue + drink estimate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Avg Bar Revenue per Person ($)
                    <span className="ml-1 relative group">
                      <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400" />
                      <span className="invisible group-hover:visible absolute z-10 left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-700 shadow-md">
                        Uses Bar COGS (%) and Avg Drink Ingredient Cost ($) to estimate typical menu price and drinks per guest.
                        <br />
                        <span className="block mt-1 text-gray-500">
                          Price ≈ cost / (COGS%). Drinks ≈ Bar $ / Price.
                        </span>
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    value={barRevenue || ''}
                    onChange={(e) => updateInput('barRevenue', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <div className="mt-1 text-xs text-gray-600">
                    Est. price/drink: {impliedMenuPrice > 0 ? `$${impliedMenuPrice.toFixed(2)}` : '—'} •
                    Est. drinks/person: {drinksCount > 0 ? `≈ ${drinksCount.toFixed(1)}` : '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avg Merchandise per Person ($)</label>
                  <input
                    type="number"
                    value={merchandiseRevenue || ''}
                    onChange={(e) => updateInput('merchandiseRevenue', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              {/* Drink cost + COGS helper */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avg Drink Ingredient Cost ($)</label>
                  <input
                    type="number"
                    value={avgDrinkIngredientCost || ''}
                    onChange={(e) => updateInput('avgDrinkIngredientCost', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 mt-1">Ex: Beer ~$1.50–$2.00, Cocktail ~$2.50–$3.50</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bar COGS (%)</label>
                  <input
                    type="number"
                    value={barCOGS || ''}
                    onChange={(e) => updateInput('barCOGS', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min={0}
                    max={100}
                  />
                  <div className="text-xs text-gray-500 mt-1">Typical range: 25–35%</div>
                </div>
              </div>
            </div>

            {/* Splits & Non-Cowboy inputs separator */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Terms & Splits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cowboy % of Ticket Sales</label>
                  <input
                    type="number"
                    value={ticketSplitPct || ''}
                    onChange={(e) => updateInput('ticketSplitPct', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min={0}
                    max={100}
                  />
                  <div className="text-xs text-gray-500 mt-1">Default 0% — bands usually keep ticket revenue.</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cowboy % of Merch Sales</label>
                  <input
                    type="number"
                    value={merchSplitPct || ''}
                    onChange={(e) => updateInput('merchSplitPct', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min={0}
                    max={100}
                  />
                  <div className="text-xs text-gray-500 mt-1">Default 0% — most venues take no merch cut.</div>
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Band-side Assumptions (does not affect Cowboy unless negotiated)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Merchandise COGS (%)</label>
                    <input
                      type="number"
                      value={merchandiseCOGS || ''}
                      onChange={(e) => updateInput('merchandiseCOGS', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min={0}
                      max={100}
                    />
                    <div className="text-xs text-gray-500 mt-1">Typical range: 35–50%</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Band Travel/Lodging/Crew ($)</label>
                    <input
                      type="number"
                      value={bandExpenses || ''}
                      onChange={(e) => updateInput('bandExpenses', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <div className="text-xs text-gray-500 mt-1">Optional — for band net profit view.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Costs (Cowboy) */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fixed Costs (Cowboy)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Staff ($)</label>
                  <input
                    type="number"
                    value={staffCosts || ''}
                    onChange={(e) => updateInput('staffCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Utilities ($)</label>
                  <input
                    type="number"
                    value={utilitiesCosts || ''}
                    onChange={(e) => updateInput('utilitiesCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facility ($)</label>
                  <input
                    type="number"
                    value={facilityCosts || ''}
                    onChange={(e) => updateInput('facilityCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marketing ($)</label>
                  <input
                    type="number"
                    value={marketingCosts || ''}
                    onChange={(e) => updateInput('marketingCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Fixed Costs ($)</label>
                  <input
                    type="number"
                    value={otherFixedCosts || ''}
                    onChange={(e) => updateInput('otherFixedCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Results (PDF section) */}
          <div className="space-y-6" ref={pdfRef}>
            {/* Side-by-side breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Breakdown — Cowboy vs Band</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cowboy */}
                <div className="border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">Cowboy (Venue)</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Bar Sales</span><span>${totalBarRevenue.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Cover Charges</span><span>${coverRevenue.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Ticket Share ({ticketSplitPct}%)</span><span>${cowboyTicketShare.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Merch Share ({merchSplitPct}%)</span><span>${cowboyMerchShare.toLocaleString()}</span></div>
                    <div className="flex justify-between font-semibold text-green-800 border-t border-green-200 pt-2"><span>Total Revenue</span><span>${cowboyResults.totalRevenue.toLocaleString()}</span></div>
                  </div>

                  <div className="space-y-1 text-sm mt-4">
                    <div className="flex justify-between"><span>Bar COGS ({barCOGS}%)</span><span>${cowboyCOGS.toLocaleString()}</span></div>
                    <div className="flex justify-between font-semibold text-yellow-800 border-t border-yellow-200 pt-2"><span>Total COGS</span><span>${cowboyResults.totalCOGS.toLocaleString()}</span></div>
                  </div>

                  <div className="flex justify-between font-semibold text-blue-800 mt-4"><span>Gross Profit</span><span>${cowboyResults.grossProfit.toLocaleString()}</span></div>

                  <div className="space-y-1 text-sm mt-4">
                    <div className="flex justify-between"><span>Band Guarantee</span><span>${bandOffer.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Staff</span><span>${staffCosts.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Utilities</span><span>${utilitiesCosts.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Facility</span><span>${facilityCosts.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Marketing</span><span>${marketingCosts.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Other</span><span>${otherFixedCosts.toLocaleString()}</span></div>
                    <div className="flex justify-between font-semibold text-red-800 border-t border-red-200 pt-2"><span>Total Fixed</span><span>${cowboyResults.totalFixedCosts.toLocaleString()}</span></div>
                  </div>

                  <div className={`mt-4 p-3 rounded-lg ${cowboyResults.netProfit >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex justify-between font-bold text-lg">
                      <span className={`${cowboyResults.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>NET PROFIT</span>
                      <span className={`${cowboyResults.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>${cowboyResults.netProfit.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                    <div className="text-center p-2 bg-green-50 rounded"><div className="font-semibold">Rev/Guest</div><div>${cowboyResults.revenuePerCustomer.toFixed(2)}</div></div>
                    <div className="text-center p-2 bg-red-50 rounded"><div className="font-semibold">Cost/Guest</div><div>${cowboyResults.costPerCustomer.toFixed(2)}</div></div>
                    <div className="text-center p-2 bg-blue-50 rounded"><div className="font-semibold">Profit/Guest</div><div>${cowboyResults.profitPerCustomer.toFixed(2)}</div></div>
                  </div>
                </div>

                {/* Band */}
                <div className="border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Band (Act)</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Ticket Sales (after Cowboy %)</span><span>${bandTicketShare.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Merch Sales (after Cowboy %)</span><span>${bandMerchShare.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Guarantee from Cowboy</span><span>${bandOffer.toLocaleString()}</span></div>
                    <div className="flex justify-between font-semibold text-green-800 border-t border-green-200 pt-2"><span>Total Revenue</span><span>${bandResults.totalRevenue.toLocaleString()}</span></div>
                  </div>

                  <div className="space-y-1 text-sm mt-4">
                    <div className="flex justify-between"><span>Merch COGS ({merchandiseCOGS}%)</span><span>${bandCOGS.toLocaleString()}</span></div>
                    <div className="flex justify-between font-semibold text-yellow-800 border-t border-yellow-200 pt-2"><span>Total COGS</span><span>${bandResults.totalCOGS.toLocaleString()}</span></div>
                  </div>

                  <div className="flex justify-between font-semibold text-blue-800 mt-4"><span>Gross Profit</span><span>${bandResults.grossProfit.toLocaleString()}</span></div>

                  <div className="space-y-1 text-sm mt-4">
                    <div className="flex justify-between"><span>Band Expenses</span><span>${bandExpenses.toLocaleString()}</span></div>
                    <div className="flex justify-between font-semibold text-red-800 border-t border-red-200 pt-2"><span>Total Fixed</span><span>${bandResults.totalFixedCosts.toLocaleString()}</span></div>
                  </div>

                  <div className={`mt-4 p-3 rounded-lg ${bandResults.netProfit >= 0 ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex justify-between font-bold text-lg">
                      <span className={`${bandResults.netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>NET PROFIT</span>
                      <span className={`${bandResults.netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>${bandResults.netProfit.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                    <div className="text-center p-2 bg-green-50 rounded"><div className="font-semibold">Rev/Guest</div><div>${bandResults.revenuePerCustomer.toFixed(2)}</div></div>
                    <div className="text-center p-2 bg-red-50 rounded"><div className="font-semibold">Cost/Guest</div><div>${bandResults.costPerCustomer.toFixed(2)}</div></div>
                    <div className="text-center p-2 bg-blue-50 rounded"><div className="font-semibold">Profit/Guest</div><div>${bandResults.profitPerCustomer.toFixed(2)}</div></div>
                  </div>
                </div>
              </div>

              {/* Cowboy break-even callout */}
              <div className="bg-blue-50 p-4 rounded-lg mt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{kpis.cowboyBreakEvenAttendance.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 mb-2">People needed for Cowboy to break even</div>
                  {estimatedAttendance > 0 && (
                    <div className={`text-sm font-medium ${kpis.cowboyBreakEvenAttendance <= estimatedAttendance ? 'text-green-600' : 'text-red-600'}`}>
                      {kpis.cowboyBreakEvenAttendance <= estimatedAttendance
                        ? `✓ Safe – ${estimatedAttendance - kpis.cowboyBreakEvenAttendance} person buffer`
                        : `⚠ Risk – Need ${kpis.cowboyBreakEvenAttendance - estimatedAttendance} more people`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assumptions blurb for PDF */}
        <div className="bg-white rounded-xl shadow p-4 text-xs text-gray-600">
          <div className="font-semibold mb-1">Assumptions</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Ticket/merch splits apply to gross revenue; Cowboy does not bear merch COGS.</li>
            <li>Band guarantee is a Cowboy fixed cost and a Band revenue line.</li>
            <li>Drink estimate uses Avg Drink Ingredient Cost and Bar COGS (Price ≈ cost / COGS%).</li>
            <li>For ticketed shows, set Cover Charge to 0 to avoid double counting.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
