// app/lights/page.tsx - Mobile-optimized Lights Manager
'use client'

import { useEffect } from 'react'
import { LightBulbIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

// TypeScript declarations for window functions
declare global {
  interface Window {
    generateColorCombo: () => void;
    setFilter: (filter: string) => void;
    toggleDropdown: () => void;
    toggleColorExclusion: (colorName: string) => void;
    selectAllColors: () => void;
    selectNoneColors: () => void;
    selectWarmColors: () => void;
    selectCoolColors: () => void;
    clearHistory: () => void;
  }
}

export default function LightsPage() {
  const router = useRouter()

  useEffect(() => {
    // Inject CSS styles with mobile optimizations
    const styleElement = document.createElement('style')
    styleElement.textContent = `
      .filter-btn.active {
        background-color: #3B82F6 !important;
        color: white !important;
      }
      
      .dropdown-toggle.open .dropdown-arrow {
        transform: rotate(180deg);
      }
      
      .dropdown-content.open {
        display: block !important;
      }
      
      .color-exclusion-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 6px 4px;
        border: 2px solid transparent;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: white;
        min-height: 60px;
      }
      
      @media (min-width: 640px) {
        .color-exclusion-btn {
          padding: 8px;
          min-height: 70px;
        }
      }
      
      .color-exclusion-btn:hover {
        transform: scale(1.05);
        border-color: #3B82F6;
      }
      
      .color-exclusion-btn.excluded {
        border-color: #EF4444;
        background: #FEF2F2;
        opacity: 0.6;
      }
      
      .color-exclusion-btn.excluded .color-circle::after {
        content: '✕';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #EF4444;
        font-weight: bold;
        font-size: 14px;
      }
      
      @media (min-width: 640px) {
        .color-exclusion-btn.excluded .color-circle::after {
          font-size: 16px;
        }
      }
      
      .color-circle {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid #E5E7EB;
        margin-bottom: 4px;
        position: relative;
        flex-shrink: 0;
      }
      
      @media (min-width: 640px) {
        .color-circle {
          width: 36px;
          height: 36px;
        }
      }
      
      .color-label {
        font-size: 10px;
        text-align: center;
        color: #374151;
        font-weight: 500;
        line-height: 1.2;
      }
      
      @media (min-width: 640px) {
        .color-label {
          font-size: 12px;
        }
      }
      
      .preset-info {
        background: linear-gradient(to bottom right, #DBEAFE, #BFDBFE);
        padding: 16px;
        border-radius: 12px;
        border-left: 4px solid #3B82F6;
      }
      
      .preset-number {
        font-size: 20px;
        font-weight: bold;
        color: #1E40AF;
        margin-bottom: 8px;
      }
      
      @media (min-width: 640px) {
        .preset-number {
          font-size: 24px;
        }
      }
      
      .preset-pattern {
        font-size: 14px;
        color: #374151;
        margin-bottom: 12px;
        font-weight: 600;
        line-height: 1.3;
      }
      
      @media (min-width: 640px) {
        .preset-pattern {
          font-size: 16px;
        }
      }
      
      .preset-colors {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        justify-content: center;
      }
      
      @media (min-width: 640px) {
        .preset-colors {
          gap: 8px;
        }
      }
      
      .preset-color {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid #E5E7EB;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        flex-shrink: 0;
      }
      
      @media (min-width: 640px) {
        .preset-color {
          width: 28px;
          height: 28px;
        }
      }
      
      .remote-color {
        background: linear-gradient(to bottom right, #EEF2FF, #E0E7FF);
        padding: 16px;
        border-radius: 12px;
        border-left: 4px solid #6366F1;
        text-align: center;
      }
      
      .remote-color-display {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        margin: 12px auto;
        border: 3px solid #E5E7EB;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
      
      @media (min-width: 640px) {
        .remote-color-display {
          width: 64px;
          height: 64px;
        }
      }
      
      .color-name {
        font-size: 16px;
        font-weight: bold;
        color: #374151;
        margin-top: 8px;
      }
      
      @media (min-width: 640px) {
        .color-name {
          font-size: 18px;
        }
      }
      
      .history-item {
        background: #F9FAFB;
        padding: 12px;
        border-radius: 8px;
        border-left: 3px solid #3B82F6;
        margin-bottom: 12px;
      }
      
      @media (min-width: 640px) {
        .history-item {
          padding: 16px;
        }
      }
      
      .history-preset {
        color: #1E40AF;
        font-weight: bold;
        margin-bottom: 4px;
        font-size: 14px;
      }
      
      @media (min-width: 640px) {
        .history-preset {
          font-size: 16px;
        }
      }
      
      .history-remote {
        color: #6366F1;
        font-weight: bold;
        margin-bottom: 4px;
        font-size: 14px;
      }
      
      @media (min-width: 640px) {
        .history-remote {
          font-size: 16px;
        }
      }
      
      .timestamp {
        font-size: 12px;
        color: #6B7280;
      }
      
      @media (min-width: 640px) {
        .timestamp {
          font-size: 14px;
        }
      }
    `
    document.head.appendChild(styleElement)

    // Inject the JavaScript functionality (keeping the same logic)
    const scriptElement = document.createElement('script')
    scriptElement.innerHTML = `
      // Stage light presets from the hub
      const stagePresets = {
          1: { name: "Red-Yellow-Red", colors: ["#FF0000", "#FFD700", "#FF0000"], category: "static", temperature: "warm" },
          2: { name: "White-Red-White-Red (Random Yellow)", colors: ["#FFFFFF", "#FF0000", "#FFFFFF", "#FF0000"], category: "static", temperature: "mixed" },
          3: { name: "All Green", colors: ["#00AA00"], category: "static", temperature: "cool" },
          4: { name: "Red-White-Blue-White-Red", colors: ["#FF0000", "#FFFFFF", "#0066FF", "#FFFFFF", "#FF0000"], category: "static", temperature: "mixed" },
          5: { name: "All Purple", colors: ["#8A2BE2"], category: "static", temperature: "cool" },
          6: { name: "Blue-Yellow-Blue-Yellow-Blue", colors: ["#0066FF", "#FFD700", "#0066FF", "#FFD700", "#0066FF"], category: "static", temperature: "mixed" },
          7: { name: "Teal-Red-Teal-Red", colors: ["#20B2AA", "#FF0000", "#20B2AA", "#FF0000"], category: "static", temperature: "mixed" },
          13: { name: "All Red (Motion)", colors: ["#FF0000"], category: "motion", temperature: "warm" },
          14: { name: "White-Red-White-Red (Random Yellow)", colors: ["#FFFFFF", "#FF0000", "#FFFFFF", "#FF0000"], category: "motion", temperature: "mixed" },
          15: { name: "All Green Motion", colors: ["#00AA00"], category: "motion", temperature: "cool" },
          16: { name: "Red-White-Blue-White-Red (Motion)", colors: ["#FF0000", "#FFFFFF", "#0066FF", "#FFFFFF", "#FF0000"], category: "motion", temperature: "mixed" },
          17: { name: "Purple-Teal-Purple (Motion)", colors: ["#8A2BE2", "#20B2AA", "#8A2BE2"], category: "motion", temperature: "cool" },
          18: { name: "Blue-Yellow-Blue (Motion)", colors: ["#0066FF", "#FFD700", "#0066FF"], category: "motion", temperature: "mixed" },
          19: { name: "Teal-Red-Teal-Red-Teal (Motion)", colors: ["#20B2AA", "#FF0000", "#20B2AA", "#FF0000", "#20B2AA"], category: "motion", temperature: "mixed" },
          25: { name: "All White Dim", colors: ["#E6E6E6"], category: "special", temperature: "neutral" },
          37: { name: "All White Bright", colors: ["#FFFFFF"], category: "special", temperature: "neutral" },
          44: { name: "Fast Strobe (Stage Facing Off)", colors: ["#FFFFFF"], category: "strobe", temperature: "neutral" },
          45: { name: "Slow Strobe (Stage Facing Off)", colors: ["#FFFFFF"], category: "strobe", temperature: "neutral" },
          46: { name: "Random Slow Strobe", colors: ["#FF0000", "#0066FF", "#00AA00", "#FFD700"], category: "strobe", temperature: "mixed" },
          47: { name: "Fast Strobe (Stage Facing On)", colors: ["#FFFFFF"], category: "strobe", temperature: "neutral" },
          48: { name: "Off", colors: ["#000000"], category: "special", temperature: "neutral" }
      };

      // Remote colors with temperature classification
      const remoteColors = {
          'Red': { hex: '#FF0000', temp: 'warm' },
          'Orange': { hex: '#FF8C00', temp: 'warm' }, 
          'Yellow': { hex: '#FFD700', temp: 'warm' },
          'Green': { hex: '#00AA00', temp: 'cool' },
          'Light Blue': { hex: '#87CEEB', temp: 'cool' },
          'Blue': { hex: '#0066FF', temp: 'cool' },
          'Dark Blue': { hex: '#000080', temp: 'cool' },
          'Purple': { hex: '#8A2BE2', temp: 'cool' },
          'Pink': { hex: '#FF69B4', temp: 'warm' },
          'Teal': { hex: '#20B2AA', temp: 'cool' },
          'Cyan': { hex: '#00FFFF', temp: 'cool' },
          'White': { hex: '#FFFFFF', temp: 'neutral' }
      };

      // Remote colors mapped to stage colors for exact matching
      const colorMapping = {
          '#FF0000': 'Red',
          '#FF8C00': 'Orange', 
          '#FFD700': 'Yellow',
          '#00AA00': 'Green',
          '#87CEEB': 'Light Blue',
          '#0066FF': 'Blue',
          '#000080': 'Dark Blue',
          '#8A2BE2': 'Purple',
          '#FF69B4': 'Pink',
          '#20B2AA': 'Teal',
          '#00FFFF': 'Cyan',
          '#FFFFFF': 'White',
          '#E6E6E6': 'White',
          '#000000': 'White'
      };

      let recentCombinations = JSON.parse(localStorage.getItem('cowboyLightHistory') || '[]');
      let excludedColors = JSON.parse(localStorage.getItem('cowboyExcludedColors') || '[]');
      let currentFilter = 'all';

      window.setFilter = function(filter) {
          currentFilter = filter;
          document.querySelectorAll('.filter-btn').forEach(btn => {
              btn.classList.remove('active');
          });
          event.target.classList.add('active');
      }

      window.toggleDropdown = function() {
          const toggle = document.getElementById('dropdownToggle');
          const content = document.getElementById('dropdownContent');
          toggle.classList.toggle('open');
          content.classList.toggle('open');
          updateDropdownLabel();
      }

      function updateDropdownLabel() {
          const label = document.getElementById('dropdownLabel');
          const excludedCount = excludedColors.length;
          const totalColors = Object.keys(remoteColors).length;
          const activeCount = totalColors - excludedCount;
          
          if (excludedCount === 0) {
              label.textContent = \`All colors active (\${totalColors})\`;
          } else if (excludedCount === totalColors) {
              label.textContent = 'All colors excluded!';
          } else {
              label.textContent = \`\${activeCount} colors active, \${excludedCount} excluded\`;
          }
      }

      function initializeColorExclusion() {
          const grid = document.getElementById('colorExclusionGrid');
          grid.innerHTML = Object.keys(remoteColors).map(colorName => {
              const colorData = remoteColors[colorName];
              const isExcluded = excludedColors.includes(colorName);
              return \`
                  <div class="color-exclusion-btn \${isExcluded ? 'excluded' : ''}" 
                       onclick="toggleColorExclusion('\${colorName}')">
                      <div class="color-circle" style="background-color: \${colorData.hex}"></div>
                      <div class="color-label">\${colorName}</div>
                  </div>
              \`;
          }).join('');
          updateDropdownLabel();
      }

      window.toggleColorExclusion = function(colorName) {
          const index = excludedColors.indexOf(colorName);
          if (index > -1) {
              excludedColors.splice(index, 1);
          } else {
              excludedColors.push(colorName);
          }
          localStorage.setItem('cowboyExcludedColors', JSON.stringify(excludedColors));
          initializeColorExclusion();
      }

      window.selectAllColors = function() {
          excludedColors = [];
          localStorage.setItem('cowboyExcludedColors', JSON.stringify(excludedColors));
          initializeColorExclusion();
      }

      window.selectNoneColors = function() {
          excludedColors = Object.keys(remoteColors);
          localStorage.setItem('cowboyExcludedColors', JSON.stringify(excludedColors));
          initializeColorExclusion();
      }

      window.selectWarmColors = function() {
          excludedColors = Object.keys(remoteColors).filter(colorName => 
              remoteColors[colorName].temp !== 'warm'
          );
          localStorage.setItem('cowboyExcludedColors', JSON.stringify(excludedColors));
          initializeColorExclusion();
      }

      window.selectCoolColors = function() {
          excludedColors = Object.keys(remoteColors).filter(colorName => 
              remoteColors[colorName].temp !== 'cool'
          );
          localStorage.setItem('cowboyExcludedColors', JSON.stringify(excludedColors));
          initializeColorExclusion();
      }

      function getMatchingRemoteColor(stageColors) {
          const exactMatches = [];
          stageColors.forEach(stageColor => {
              if (colorMapping[stageColor]) {
                  const matchedColor = colorMapping[stageColor];
                  if (!excludedColors.includes(matchedColor)) {
                      exactMatches.push(matchedColor);
                  }
              }
          });
          
          if (exactMatches.length > 0) {
              return exactMatches[Math.floor(Math.random() * exactMatches.length)];
          }
          
          const availableColors = Object.keys(remoteColors).filter(color => 
              !excludedColors.includes(color)
          );
          
          if (availableColors.length > 0) {
              return availableColors[Math.floor(Math.random() * availableColors.length)];
          }
          
          return 'White';
      }

      window.generateColorCombo = function() {
          let filteredPresets = Object.keys(stagePresets).map(Number);
          
          if (currentFilter === 'warm') {
              filteredPresets = filteredPresets.filter(preset => 
                  stagePresets[preset].temperature === 'warm'
              );
          } else if (currentFilter === 'cool') {
              filteredPresets = filteredPresets.filter(preset => 
                  stagePresets[preset].temperature === 'cool'
              );
          } else if (currentFilter !== 'all') {
              filteredPresets = filteredPresets.filter(preset => 
                  stagePresets[preset].category === currentFilter
              );
          }
          
          const recentPresets = recentCombinations.map(combo => combo.preset);
          let availablePresets = filteredPresets.filter(preset => 
              !recentPresets.slice(0, 5).includes(preset)
          );
          
          if (availablePresets.length === 0) {
              availablePresets = filteredPresets;
          }
          
          if (availablePresets.length === 0) {
              availablePresets = Object.keys(stagePresets).map(Number);
          }
          
          const selectedPreset = availablePresets[Math.floor(Math.random() * availablePresets.length)];
          const presetData = stagePresets[selectedPreset];
          const remoteColorName = getMatchingRemoteColor(presetData.colors);
          
          const newCombo = {
              preset: selectedPreset,
              presetName: presetData.name,
              presetColors: presetData.colors,
              remoteColor: remoteColorName,
              remoteColorHex: remoteColors[remoteColorName].hex,
              category: presetData.category,
              temperature: presetData.temperature,
              timestamp: new Date().toLocaleString(),
              id: Date.now()
          };
          
          recentCombinations.unshift(newCombo);
          
          if (recentCombinations.length > 10) {
              recentCombinations = recentCombinations.slice(0, 10);
          }
          
          localStorage.setItem('cowboyLightHistory', JSON.stringify(recentCombinations));
          
          displayCurrentCombo(newCombo);
          updateHistoryDisplay();
      }

      function displayCurrentCombo(combo) {
          const comboDiv = document.getElementById('currentCombo');
          const stagePreset = document.getElementById('stagePreset');
          const remoteColor = document.getElementById('remoteColor');
          const mainBtn = document.getElementById('mainGenerateBtn');
          
          comboDiv.style.display = 'block';
          comboDiv.classList.remove('hidden');
          mainBtn.style.display = 'none';
          
          stagePreset.innerHTML = \`
              <div class="preset-info">
                  <div class="preset-number">Preset #\${combo.preset}</div>
                  <div class="preset-pattern">\${combo.presetName}</div>
                  <div class="preset-colors">
                      \${combo.presetColors.map(color => \`
                          <div class="preset-color" style="background-color: \${color}"></div>
                      \`).join('')}
                  </div>
              </div>
          \`;
          
          remoteColor.innerHTML = \`
              <div class="remote-color">
                  <div class="remote-color-display" style="background-color: \${combo.remoteColorHex}"></div>
                  <div class="color-name">\${combo.remoteColor}</div>
              </div>
          \`;
          
          if (recentCombinations.length === 1) {
              comboDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }

      function updateHistoryDisplay() {
          const historyList = document.getElementById('historyList');
          
          if (recentCombinations.length === 0) {
              historyList.innerHTML = '<p class="text-gray-500 italic text-center py-4">No recent combinations yet. Generate your first coordination!</p>';
              return;
          }
          
          historyList.innerHTML = recentCombinations.map(combo => \`
              <div class="history-item">
                  <div class="history-preset">🎭 Stage: Preset #\${combo.preset} - \${combo.presetName} <span class="text-gray-500">(\${combo.category}\${combo.temperature ? \`, \${combo.temperature}\` : ''})</span></div>
                  <div class="history-remote">📱 Sign: \${combo.remoteColor}</div>
                  <div class="timestamp">\${combo.timestamp}</div>
              </div>
          \`).join('');
      }

      window.clearHistory = function() {
          if (confirm('Are you sure you want to clear the coordination history?')) {
              recentCombinations = [];
              localStorage.removeItem('cowboyLightHistory');
              updateHistoryDisplay();
          }
      }

      // Initialize display when the component loads
      setTimeout(() => {
          updateHistoryDisplay();
          initializeColorExclusion();
      }, 100);
    `
    document.head.appendChild(scriptElement)

    return () => {
      document.head.removeChild(styleElement)
      document.head.removeChild(scriptElement)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-slate-700 p-2 rounded-lg hover:bg-slate-600 transition-colors touch-manipulation"
              >
                <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
              <div className="bg-blue-500 p-2 sm:p-3 rounded-lg">
                <LightBulbIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Lights Manager</h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">Coordinate your stage presets with sign remote colors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Title Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">🤠 Cowboy Saloon Lights Coordinator</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600">Generate perfect stage and sign light combinations</p>
        </div>

        {/* Main Generate Button */}
        <div className="text-center mb-6 sm:mb-8">
          <button 
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white text-lg sm:text-xl font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 touch-manipulation" 
            onClick={() => window.generateColorCombo()} 
            id="mainGenerateBtn"
          >
            🎨 Generate Perfect Light Coordination 🎨
          </button>
        </div>

        {/* Current Combination Display */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 hidden" id="currentCombo">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">🎯 Current Light Setup</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Stage Lights */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6">
              <h4 className="text-lg sm:text-xl font-bold text-blue-700 mb-4 text-center">🎭 Stage Lights (Hub Preset)</h4>
              <div id="stagePreset"></div>
            </div>
            
            {/* Sign Remote */}
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 sm:p-6">
              <h4 className="text-lg sm:text-xl font-bold text-indigo-700 mb-4 text-center">📱 Sign Remote Color</h4>
              <div id="remoteColor"></div>
            </div>
          </div>
          
          <div className="text-center mt-4 sm:mt-6">
            <button 
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 touch-manipulation" 
              onClick={() => window.generateColorCombo()}
            >
              🔄 Generate New Coordination 🔄
            </button>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Filter Options</h3>
          
          {/* Filter Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <button className="filter-btn active bg-blue-500 text-white px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors touch-manipulation" onClick={() => window.setFilter('all')}>All Presets</button>
            <button className="filter-btn bg-gray-200 text-gray-700 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-300 transition-colors touch-manipulation" onClick={() => window.setFilter('motion')}>Motion Only</button>
            <button className="filter-btn bg-gray-200 text-gray-700 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-300 transition-colors touch-manipulation" onClick={() => window.setFilter('static')}>Static Colors</button>
            <button className="filter-btn bg-gray-200 text-gray-700 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-300 transition-colors touch-manipulation" onClick={() => window.setFilter('strobe')}>Strobe Effects</button>
            <button className="filter-btn bg-gray-200 text-gray-700 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-300 transition-colors touch-manipulation" onClick={() => window.setFilter('special')}>Special Effects</button>
            <button className="filter-btn bg-gray-200 text-gray-700 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-300 transition-colors touch-manipulation" onClick={() => window.setFilter('warm')}>🔥 Warm Colors</button>
            <button className="filter-btn bg-gray-200 text-gray-700 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-300 transition-colors touch-manipulation" onClick={() => window.setFilter('cool')}>❄️ Cool Colors</button>
          </div>
          
          {/* Color Exclusion Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">🚫 Color Exclusion Filter</h4>
            <p className="text-gray-600 text-xs sm:text-sm mb-4">Select colors to exclude from generation</p>
            
            <div className="relative">
              <button
                className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-left hover:border-blue-300 transition-colors flex justify-between items-center touch-manipulation"
                onClick={() => window.toggleDropdown()}
                id="dropdownToggle"
              >
                <span id="dropdownLabel" className="text-gray-700 text-sm sm:text-base">Click to manage color exclusions</span>
                <span className="dropdown-arrow text-gray-500 transform transition-transform">▼</span>
              </button>
              
              <div className="dropdown-content absolute top-full left-0 right-0 bg-white border-2 border-gray-300 border-t-0 rounded-b-lg max-h-64 overflow-y-auto z-50 hidden" id="dropdownContent">
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4" id="colorExclusionGrid"></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-4 border-t border-gray-200">
                  <button className="bg-blue-500 text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm hover:bg-blue-600 transition-colors touch-manipulation" onClick={() => window.selectAllColors()}>Select All</button>
                  <button className="bg-gray-500 text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm hover:bg-gray-600 transition-colors touch-manipulation" onClick={() => window.selectNoneColors()}>Select None</button>
                  <button className="bg-red-500 text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm hover:bg-red-600 transition-colors touch-manipulation" onClick={() => window.selectWarmColors()}>🔥 Warm Only</button>
                  <button className="bg-indigo-500 text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm hover:bg-indigo-600 transition-colors touch-manipulation" onClick={() => window.selectCoolColors()}>❄️ Cool Only</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">📋 Recent Light Combinations</h3>
          <div id="historyList" className="space-y-3"></div>
          <div className="text-center mt-4 sm:mt-6">
            <button 
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors touch-manipulation" 
              onClick={() => window.clearHistory()}
            >
              Clear History
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}// app/dashboard/page.tsx - New Management Overview Page
'use client'

import Link from 'next/link'
import { SpeakerWaveIcon, MicrophoneIcon, LightBulbIcon } from '@heroicons/react/24/outline'

export default function DashboardPage() {
  // Handle logout
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isAppAuthenticated')
    }
    // Refresh the page to trigger the app-level login
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-orange-500 p-2 sm:p-3 rounded-lg">
                <SpeakerWaveIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">The Cowboy Saloon</h1>
                <p className="text-sm sm:text-base text-gray-600">Management Dashboard</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Welcome Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            🤠 Welcome to the Saloon
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your management tool to get started. Everything you need to run the show.
          </p>
        </div>

        {/* Management Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          
          {/* Band Management Card */}
          <Link href="/bands" className="group">
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-orange-300 hover:border-orange-500 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 h-full">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-orange-500 p-4 sm:p-5 rounded-xl group-hover:bg-orange-600 transition-colors">
                  <SpeakerWaveIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-orange-900 mb-2">Band Booking</h3>
                  <p className="text-sm sm:text-base text-orange-700 leading-relaxed">
                    AI-powered band analytics, booking management, and smart recommendations for your venue.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <div className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold group-hover:bg-orange-700 transition-colors">
                    Manage Bands →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* DJ Management Card */}
          <Link href="/dj" className="group">
            <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-pink-300 hover:border-pink-500 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 h-full">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-pink-500 p-4 sm:p-5 rounded-xl group-hover:bg-pink-600 transition-colors">
                  <MicrophoneIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-pink-900 mb-2">DJ Dashboard</h3>
                  <p className="text-sm sm:text-base text-pink-700 leading-relaxed">
                    Live song request management, blacklist control, and cooldown tracking for performances.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <div className="bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold group-hover:bg-pink-700 transition-colors">
                    DJ Controls →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Lights Management Card */}
          <Link href="/lights" className="group md:col-span-2 lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-blue-300 hover:border-blue-500 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 h-full">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-blue-500 p-4 sm:p-5 rounded-xl group-hover:bg-blue-600 transition-colors">
                  <LightBulbIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">Lights Control</h3>
                  <p className="text-sm sm:text-base text-blue-700 leading-relaxed">
                    Smart lighting coordination and scene management for performances and events.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold group-hover:bg-blue-700 transition-colors">
                    Control Lights →
                  </div>
                </div>
              </div>
            </div>
          </Link>

        </div>

        {/* Quick Stats or Info Section */}
        <div className="mt-12 sm:mt-16 bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">System Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">✓</div>
                <div className="text-sm sm:text-base text-green-800 font-medium">All Systems Online</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">⚡</div>
                <div className="text-sm sm:text-base text-blue-800 font-medium">Real-time Updates</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">🤖</div>
                <div className="text-sm sm:text-base text-purple-800 font-medium">AI Analytics Ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
