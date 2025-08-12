// app/lights/page.tsx - REDESIGNED TO MATCH APP THEME
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
    // Inject the JavaScript functionality
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
      document.head.removeChild(scriptElement)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="bg-slate-700 p-2 rounded-lg hover:bg-slate-600 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-white" />
              </button>
              <div className="bg-blue-500 p-3 rounded-lg">
                <LightBulbIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Lights Manager</h1>
                <p className="text-gray-600">Coordinate your stage presets with sign remote colors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Title Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">🤠 Cowboy Saloon Lights Coordinator</h2>
          <p className="text-xl text-gray-600">Generate perfect stage and sign light combinations</p>
        </div>

        {/* Main Generate Button */}
        <div className="text-center mb-8">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200" 
            onClick={() => window.generateColorCombo()} 
            id="mainGenerateBtn"
          >
            🎨 Generate Perfect Light Coordination 🎨
          </button>
        </div>

        {/* Current Combination Display */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 hidden" id="currentCombo">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">🎯 Current Light Setup</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stage Lights */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h4 className="text-xl font-bold text-blue-700 mb-4 text-center">🎭 Stage Lights (Hub Preset)</h4>
              <div id="stagePreset"></div>
            </div>
            
            {/* Sign Remote */}
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
              <h4 className="text-xl font-bold text-indigo-700 mb-4 text-center">📱 Sign Remote Color</h4>
              <div id="remoteColor"></div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200" 
              onClick={() => window.generateColorCombo()}
            >
              🔄 Generate New Coordination 🔄
            </button>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Filter Options</h3>
          
          {/* Filter Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            <button className="filter-btn active bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors" onClick={() => window.setFilter('all')}>All Presets</button>
            <button className="filter-btn bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors" onClick={() => window.setFilter('motion')}>Motion Only</button>
            <button className="filter-btn bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors" onClick={() => window.setFilter('static')}>Static Colors</button>
            <button className="filter-btn bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors" onClick={() => window.setFilter('strobe')">Strobe Effects</button>
            <button className="filter-btn bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors" onClick={() => window.setFilter('special')">Special Effects</button>
            <button className="filter-btn bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors" onClick={() => window.setFilter('warm')}>🔥 Warm Colors</button>
            <button className="filter-btn bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors" onClick={() => window.setFilter('cool')}>❄️ Cool Colors</button>
          </div>
          
          {/* Color Exclusion Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">🚫 Color Exclusion Filter</h4>
            <p className="text-gray-600 text-sm mb-4">Select colors to exclude from generation</p>
            
            <div className="relative">
              <button
                className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-left hover:border-blue-300 transition-colors flex justify-between items-center"
                onClick={() => window.toggleDropdown()}
                id="dropdownToggle"
              >
                <span id="dropdownLabel" className="text-gray-700">Click to manage color exclusions</span>
                <span className="dropdown-arrow text-gray-500 transform transition-transform">▼</span>
              </button>
              
              <div className="dropdown-content absolute top-full left-0 right-0 bg-white border-2 border-gray-300 border-t-0 rounded-b-lg max-h-64 overflow-y-auto z-50 hidden" id="dropdownContent">
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3 p-4" id="colorExclusionGrid"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 border-t border-gray-200">
                  <button className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors" onClick={() => window.selectAllColors()}>Select All</button>
                  <button className="bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition-colors" onClick={() => window.selectNoneColors()}>Select None</button>
                  <button className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors" onClick={() => window.selectWarmColors()}>🔥 Warm Only</button>
                  <button className="bg-indigo-500 text-white px-3 py-2 rounded text-sm hover:bg-indigo-600 transition-colors" onClick={() => window.selectCoolColors()}>❄️ Cool Only</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Recent Light Combinations</h3>
          <div id="historyList" className="space-y-3"></div>
          <div className="text-center mt-6">
            <button 
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors" 
              onClick={() => window.clearHistory()}
            >
              Clear History
            </button>
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
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
          padding: 8px;
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
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
          font-size: 16px;
        }
        
        .color-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid #E5E7EB;
          margin-bottom: 4px;
          position: relative;
        }
        
        .color-label {
          font-size: 12px;
          text-align: center;
          color: #374151;
          font-weight: 500;
        }
        
        .preset-info {
          background: linear-gradient(to br, #DBEAFE, #BFDBFE);
          padding: 16px;
          border-radius: 12px;
          border-left: 4px solid #3B82F6;
        }
        
        .preset-number {
          font-size: 24px;
          font-weight: bold;
          color: #1E40AF;
          margin-bottom: 8px;
        }
        
        .preset-pattern {
          font-size: 16px;
          color: #374151;
          margin-bottom: 12px;
          font-weight: 600;
        }
        
        .preset-colors {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .preset-color {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid #E5E7EB;
          shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .remote-color {
          background: linear-gradient(to br, #EEF2FF, #E0E7FF);
          padding: 16px;
          border-radius: 12px;
          border-left: 4px solid #6366F1;
          text-align: center;
        }
        
        .remote-color-display {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          margin: 12px auto;
          border: 3px solid #E5E7EB;
          shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .color-name {
          font-size: 18px;
          font-weight: bold;
          color: #374151;
          margin-top: 8px;
        }
        
        .history-item {
          background: #F9FAFB;
          padding: 16px;
          border-radius: 8px;
          border-left: 3px solid #3B82F6;
        }
        
        .history-preset {
          color: #1E40AF;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .history-remote {
          color: #6366F1;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .timestamp {
          font-size: 14px;
          color: #6B7280;
        }
      `}</style>
    </div>
  )
}
