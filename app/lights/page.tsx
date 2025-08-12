// app/lights/page.tsx - UPDATED WITH COWBOY LIGHTS COORDINATOR
'use client'

import { useEffect } from 'react'
import { LightBulbIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function LightsPage() {
  const router = useRouter()

  useEffect(() => {
    // Inject the lights coordinator styles and scripts
    const styleElement = document.createElement('style')
    styleElement.textContent = `
        .lights-container * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        .lights-container {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #1a1a1a, #2d1810);
            color: #fff;
            min-height: 100vh;
            padding: 10px;
        }
        
        .lights-inner-container {
            max-width: 1000px;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 15px;
            padding: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            border: 2px solid #8B4513;
        }
        
        .lights-title {
            text-align: center;
            font-size: 2em;
            margin-bottom: 20px;
            color: #D2691E;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
            font-weight: bold;
            letter-spacing: 1px;
        }
        
        .lights-subtitle {
            text-align: center;
            font-size: 1em;
            margin-bottom: 25px;
            color: #CD853F;
            font-style: italic;
        }
        
        .lights-generate-section {
            background: rgba(139, 69, 19, 0.2);
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
            border: 1px solid #8B4513;
        }
        
        .lights-filter-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 8px;
            margin-bottom: 15px;
        }
        
        .lights-filter-btn {
            padding: 8px 12px;
            background: rgba(139, 69, 19, 0.3);
            color: #CD853F;
            border: 2px solid #8B4513;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.8em;
            transition: all 0.3s ease;
            text-align: center;
            white-space: nowrap;
        }
        
        .lights-filter-btn:hover {
            background: rgba(139, 69, 19, 0.5);
        }
        
        .lights-filter-btn.active {
            background: #8B4513;
            color: white;
        }
        
        .lights-color-exclusion-section {
            background: rgba(139, 69, 19, 0.15);
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 15px;
            border: 1px solid #8B4513;
        }
        
        .lights-exclusion-title {
            font-size: 1.1em;
            margin-bottom: 10px;
            color: #D2691E;
            text-align: center;
        }
        
        .lights-dropdown-container {
            position: relative;
            margin: 10px 0;
        }
        
        .lights-dropdown-toggle {
            width: 100%;
            padding: 12px;
            background: rgba(0, 0, 0, 0.4);
            border: 2px solid #8B4513;
            border-radius: 8px;
            color: #E0E0E0;
            cursor: pointer;
            font-size: 1em;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
        }
        
        .lights-dropdown-toggle:hover {
            background: rgba(0, 0, 0, 0.6);
        }
        
        .lights-dropdown-arrow {
            font-size: 1.2em;
            transition: transform 0.3s ease;
        }
        
        .lights-dropdown-toggle.open .lights-dropdown-arrow {
            transform: rotate(180deg);
        }
        
        .lights-dropdown-content {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #8B4513;
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 250px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        }
        
        .lights-dropdown-content.open {
            display: block;
        }
        
        .lights-color-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
            gap: 8px;
            padding: 10px;
        }
        
        .lights-color-exclusion-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 6px;
            border: 2px solid transparent;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            background: rgba(0, 0, 0, 0.3);
        }
        
        .lights-color-exclusion-btn:hover {
            transform: scale(1.05);
        }
        
        .lights-color-exclusion-btn.excluded {
            border-color: #FF4444;
            background: rgba(255, 68, 68, 0.2);
            opacity: 0.5;
        }
        
        .lights-color-exclusion-btn.excluded .lights-color-circle::after {
            content: '✕';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #FF4444;
            font-weight: bold;
            font-size: 1em;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        }
        
        .lights-color-circle {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.4);
            margin-bottom: 4px;
            position: relative;
        }
        
        .lights-color-label {
            font-size: 0.7em;
            text-align: center;
            color: #E0E0E0;
        }
        
        .lights-exclusion-controls {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-top: 10px;
        }
        
        .lights-exclusion-control-btn {
            padding: 8px 10px;
            background: rgba(139, 69, 19, 0.4);
            color: #CD853F;
            border: 1px solid #8B4513;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.8em;
            transition: all 0.3s ease;
            text-align: center;
        }
        
        .lights-exclusion-control-btn:hover {
            background: rgba(139, 69, 19, 0.6);
        }
        
        .lights-generate-btn {
            width: 100%;
            padding: 12px;
            font-size: 1.1em;
            background: linear-gradient(45deg, #D2691E, #CD853F);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(210, 105, 30, 0.3);
        }
        
        .lights-generate-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(210, 105, 30, 0.5);
        }
        
        .lights-current-combo {
            margin: 20px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            border-left: 5px solid #D2691E;
        }
        
        .lights-combo-title {
            font-size: 1.3em;
            margin-bottom: 10px;
            color: #D2691E;
        }
        
        .lights-setup-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
            margin: 15px 0;
        }
        
        .lights-stage-lights, .lights-sign-remote {
            background: rgba(0, 0, 0, 0.3);
            padding: 12px;
            border-radius: 8px;
            border: 2px solid #4169E1;
        }
        
        .lights-sign-remote {
            border-color: #FF6347;
        }
        
        .lights-section-title {
            font-size: 1em;
            margin-bottom: 8px;
            text-align: center;
            font-weight: bold;
        }
        
        .lights-stage-title {
            color: #4169E1;
        }
        
        .lights-remote-title {
            color: #FF6347;
        }
        
        .lights-preset-info {
            background: rgba(65, 105, 225, 0.2);
            padding: 12px;
            border-radius: 6px;
            margin: 8px 0;
            border-left: 4px solid #4169E1;
        }
        
        .lights-preset-number {
            font-size: 1.8em;
            font-weight: bold;
            color: #87CEEB;
            margin-bottom: 5px;
        }
        
        .lights-preset-pattern {
            font-size: 1.1em;
            color: #E0E0E0;
            margin-bottom: 8px;
        }
        
        .lights-preset-colors {
            display: flex;
            gap: 8px;
            margin-top: 10px;
        }
        
        .lights-preset-color {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.4);
        }
        
        .lights-remote-color {
            background: rgba(255, 99, 71, 0.2);
            padding: 12px;
            border-radius: 6px;
            margin: 8px 0;
            border-left: 4px solid #FF6347;
            text-align: center;
        }
        
        .lights-remote-color-display {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin: 10px auto;
            border: 3px solid rgba(255, 255, 255, 0.5);
        }
        
        .lights-color-name {
            font-size: 1.2em;
            font-weight: bold;
            margin-top: 10px;
        }
        
        .lights-recent-history {
            margin-top: 30px;
            background: rgba(139, 69, 19, 0.1);
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #8B4513;
        }
        
        .lights-history-title {
            font-size: 1.3em;
            margin-bottom: 15px;
            color: #CD853F;
        }
        
        .lights-history-item {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 3px solid #8B4513;
        }
        
        .lights-history-preset {
            color: #87CEEB;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .lights-history-remote {
            color: #FF6347;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .lights-timestamp {
            font-size: 0.9em;
            color: #999;
            margin-top: 8px;
        }
        
        .lights-clear-history {
            margin-top: 15px;
            padding: 8px 15px;
            background: #8B4513;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
        }
        
        .lights-clear-history:hover {
            background: #A0522D;
        }
        
        @media (max-width: 768px) {
            .lights-inner-container {
                padding: 10px;
                margin: 5px;
            }
            
            .lights-title {
                font-size: 1.5em;
                margin-bottom: 15px;
            }
            
            .lights-subtitle {
                font-size: 0.9em;
                margin-bottom: 20px;
            }
            
            .lights-filter-options {
                grid-template-columns: repeat(2, 1fr);
                gap: 6px;
            }
            
            .lights-filter-btn {
                font-size: 0.7em;
                padding: 6px 8px;
            }
            
            .lights-generate-btn {
                font-size: 1em;
                padding: 10px;
            }
            
            .lights-color-grid {
                grid-template-columns: repeat(4, 1fr);
            }
            
            .lights-exclusion-controls {
                grid-template-columns: 1fr;
                gap: 6px;
            }
        }
        
        @media (min-width: 769px) {
            .lights-setup-grid {
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
        }
    `
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
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

      {/* Lights Coordinator */}
      <div className="lights-container">
        <div className="lights-inner-container">
          <h1 className="lights-title">🤠 The Cowboy Saloon Lights Coordinator 🎵</h1>
          <p className="lights-subtitle">Coordinate your stage presets with sign remote colors</p>
          
          <button className="lights-generate-btn" onClick={() => window.generateColorCombo && window.generateColorCombo()} id="mainGenerateBtn">
            🎨 Generate Perfect Light Coordination 🎨
          </button>
          
          <div className="lights-current-combo" id="currentCombo" style={{display: 'none'}}>
            <h3 className="lights-combo-title">🎯 Current Light Setup</h3>
            
            <div className="lights-setup-grid">
              <div className="lights-stage-lights">
                <h4 className="lights-section-title lights-stage-title">🎭 Stage Lights (Hub Preset)</h4>
                <div id="stagePreset"></div>
              </div>
              
              <div className="lights-sign-remote">
                <h4 className="lights-section-title lights-remote-title">📱 Sign Remote Color</h4>
                <div id="remoteColor"></div>
              </div>
            </div>
            
            <button className="lights-generate-btn" onClick={() => window.generateColorCombo && window.generateColorCombo()} style={{marginTop: '15px'}}>
              🔄 Generate New Coordination 🔄
            </button>
          </div>
          
          <div className="lights-generate-section">
            <div className="lights-filter-options">
              <button className="lights-filter-btn active" onClick={() => window.setFilter && window.setFilter('all')}>All Presets</button>
              <button className="lights-filter-btn" onClick={() => window.setFilter && window.setFilter('motion')}>Motion Only</button>
              <button className="lights-filter-btn" onClick={() => window.setFilter && window.setFilter('static')}>Static Colors</button>
              <button className="lights-filter-btn" onClick={() => window.setFilter && window.setFilter('strobe')}>Strobe Effects</button>
              <button className="lights-filter-btn" onClick={() => window.setFilter && window.setFilter('special')}>Special Effects</button>
              <button className="lights-filter-btn" onClick={() => window.setFilter && window.setFilter('warm')}>🔥 Warm Colors</button>
              <button className="lights-filter-btn" onClick={() => window.setFilter && window.setFilter('cool')}>❄️ Cool Colors</button>
            </div>
            
            <div className="lights-color-exclusion-section">
              <h4 className="lights-exclusion-title">🚫 Color Exclusion Filter</h4>
              <p style={{textAlign: 'center', color: '#999', fontSize: '0.8em', marginBottom: '10px'}}>
                Exclude unwanted colors from generation
              </p>
              
              <div className="lights-dropdown-container">
                <div className="lights-dropdown-toggle" onClick={() => window.toggleDropdown && window.toggleDropdown()} id="dropdownToggle">
                  <span id="dropdownLabel">Click to manage color exclusions</span>
                  <span className="lights-dropdown-arrow">▼</span>
                </div>
                <div className="lights-dropdown-content" id="dropdownContent">
                  <div className="lights-color-grid" id="colorExclusionGrid"></div>
                  <div className="lights-exclusion-controls">
                    <button className="lights-exclusion-control-btn" onClick={() => window.selectAllColors && window.selectAllColors()}>Select All</button>
                    <button className="lights-exclusion-control-btn" onClick={() => window.selectNoneColors && window.selectNoneColors()}>Select None</button>
                    <button className="lights-exclusion-control-btn" onClick={() => window.selectWarmColors && window.selectWarmColors()}>🔥 Warm Only</button>
                    <button className="lights-exclusion-control-btn" onClick={() => window.selectCoolColors && window.selectCoolColors()}>❄️ Cool Only</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lights-recent-history">
            <h3 className="lights-history-title">📋 Recent Light Combinations</h3>
            <div id="historyList"></div>
            <button className="lights-clear-history" onClick={() => window.clearHistory && window.clearHistory()}>Clear History</button>
          </div>
        </div>
      </div>

      {/* Inject the JavaScript functionality */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Stage light presets from the hub (based on your image)
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
              '#E6E6E6': 'White', // Dim white maps to white
              '#000000': 'White'  // Black/off maps to white for contrast
          };

          let recentCombinations = JSON.parse(localStorage.getItem('cowboyLightHistory') || '[]');
          let excludedColors = JSON.parse(localStorage.getItem('cowboyExcludedColors') || '[]');
          let currentFilter = 'all';

          window.setFilter = function(filter) {
              currentFilter = filter;
              
              // Update button states
              document.querySelectorAll('.lights-filter-btn').forEach(btn => {
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
                      <div class="lights-color-exclusion-btn \${isExcluded ? 'excluded' : ''}" 
                           onclick="toggleColorExclusion('\${colorName}')">
                          <div class="lights-color-circle" style="background-color: \${colorData.hex}"></div>
                          <div class="lights-color-label">\${colorName}</div>
                      </div>
                  \`;
              }).join('');
              
              updateDropdownLabel();
          }

          window.toggleColorExclusion = function(colorName) {
              const index = excludedColors.indexOf(colorName);
              
              if (index > -1) {
                  // Remove from excluded
                  excludedColors.splice(index, 1);
              } else {
                  // Add to excluded
                  excludedColors.push(colorName);
              }
              
              localStorage.setItem('cowboyExcludedColors', JSON.stringify(excludedColors));
              initializeColorExclusion();
          }

          function getMatchingRemoteColor(stageColors) {
              // Find exact matches first
              const exactMatches = [];
              stageColors.forEach(stageColor => {
                  if (colorMapping[stageColor]) {
                      const matchedColor = colorMapping[stageColor];
                      // Only add if not excluded
                      if (!excludedColors.includes(matchedColor)) {
                          exactMatches.push(matchedColor);
                      }
                  }
              });
              
              if (exactMatches.length > 0) {
                  // Return a random exact match
                  return exactMatches[Math.floor(Math.random() * exactMatches.length)];
              }
              
              // Fallback: find any non-excluded color
              const availableColors = Object.keys(remoteColors).filter(color => 
                  !excludedColors.includes(color)
              );
              
              if (availableColors.length > 0) {
                  return availableColors[Math.floor(Math.random() * availableColors.length)];
              }
              
              // Last resort: return White even if excluded
              return 'White';
          }

          window.generateColorCombo = function() {
              // Filter presets by current category
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
              
              // Remove recently used presets
              const recentPresets = recentCombinations.map(combo => combo.preset);
              let availablePresets = filteredPresets.filter(preset => 
                  !recentPresets.slice(0, 5).includes(preset) // Avoid last 5 presets
              );
              
              // If no presets available in filter, use all filtered presets
              if (availablePresets.length === 0) {
                  availablePresets = filteredPresets;
              }
              
              // If still no presets (weird edge case), fall back to all presets
              if (availablePresets.length === 0) {
                  availablePresets = Object.keys(stagePresets).map(Number);
              }
              
              // Pick a random available preset
              const selectedPreset = availablePresets[Math.floor(Math.random() * availablePresets.length)];
              const presetData = stagePresets[selectedPreset];
              
              // Get exact matching remote color (respecting exclusions)
              const remoteColorName = getMatchingRemoteColor(presetData.colors);
              
              // Store in recent history
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
              
              // Keep only last 10 combinations
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
              
              // Display stage preset
              stagePreset.innerHTML = \`
                  <div class="lights-preset-info">
                      <div class="lights-preset-number">Preset #\${combo.preset}</div>
                      <div class="lights-preset-pattern">\${combo.presetName}</div>
                      <div class="lights-preset-colors">
                          \${combo.presetColors.map(color => \`
                              <div class="lights-preset-color" style="background-color: \${color}"></div>
                          \`).join('')}
                      </div>
                  </div>
              \`;
              
              // Display remote color
              remoteColor.innerHTML = \`
                  <div class="lights-remote-color">
                      <div class="lights-remote-color-display" style="background-color: \${combo.remoteColorHex}"></div>
                      <div class="lights-color-name">\${combo.remoteColor}</div>
                  </div>
              \`;
              
              // Add a first-time user button if no combo exists yet
              if (recentCombinations.length === 1) {
                  comboDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
          }

          function updateHistoryDisplay() {
              const historyList = document.getElementById('historyList');
              
              if (recentCombinations.length === 0) {
                  historyList.innerHTML = '<p style="color: #999; font-style: italic;">No recent combinations yet. Generate your first coordination!</p>';
                  return;
              }
              
              historyList.innerHTML = recentCombinations.map(combo => \`
                  <div class="lights-history-item">
                      <div class="lights-history-preset">🎭 Stage: Preset #\${combo.preset} - \${combo.presetName} <span style="color: #999;">(\${combo.category}\${combo.temperature ? \`, \${combo.temperature}\` : ''})</span></div>
                      <div class="lights-history-remote">📱 Sign: \${combo.remoteColor}</div>
                      <div class="lights-timestamp">\${combo.timestamp}</div>
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
      }} />
    </div>
  )
}.stringify(excludedColors));
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
              // Find exact matches first
              const exactMatches = [];
              stageColors.forEach(stageColor => {
                  if (colorMapping[stageColor]) {
                      const matchedColor = colorMapping[stageColor];
                      // Only add if not excluded
                      if (!excludedColors.includes(matchedColor)) {
                          exactMatches.push(matchedColor);
                      }
                  }
              });
              
              if (exactMatches.length > 0) {
                  // Return a random exact match
                  return exactMatches[Math.floor(Math.random() * exactMatches.length)];
              }
              
              // Fallback: find any non-excluded color
              const availableColors = Object.keys(remoteColors).filter(color => 
                  !excludedColors.includes(color)
              );
              
              if (availableColors.length > 0) {
                  return availableColors[Math.floor(Math.random() * availableColors.length)];
              }
              
              // Last resort: return White even if excluded
              return 'White';
          }

          window.generateColorCombo = function() {
              // Filter presets by current category
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
              
              // Remove recently used presets
              const recentPresets = recentCombinations.map(combo => combo.preset);
              let availablePresets = filteredPresets.filter(preset => 
                  !recentPresets.slice(0, 5).includes(preset) // Avoid last 5 presets
              );
              
              // If no presets available in filter, use all filtered presets
              if (availablePresets.length === 0) {
                  availablePresets = filteredPresets;
              }
              
              // If still no presets (weird edge case), fall back to all presets
              if (availablePresets.length === 0) {
                  availablePresets = Object.keys(stagePresets).map(Number);
              }
              
              // Pick a random available preset
              const selectedPreset = availablePresets[Math.floor(Math.random() * availablePresets.length)];
              const presetData = stagePresets[selectedPreset];
              
              // Get exact matching remote color (respecting exclusions)
              const remoteColorName = getMatchingRemoteColor(presetData.colors);
              
              // Store in recent history
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
              
              // Keep only last 10 combinations
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
              
              // Display stage preset
              stagePreset.innerHTML = \`
                  <div class="lights-preset-info">
                      <div class="lights-preset-number">Preset #\${combo.preset}</div>
                      <div class="lights-preset-pattern">\${combo.presetName}</div>
                      <div class="lights-preset-colors">
                          \${combo.presetColors.map(color => \`
                              <div class="lights-preset-color" style="background-color: \${color}"></div>
                          \`).join('')}
                      </div>
                  </div>
              \`;
              
              // Display remote color
              remoteColor.innerHTML = \`
                  <div class="lights-remote-color">
                      <div class="lights-remote-color-display" style="background-color: \${combo.remoteColorHex}"></div>
                      <div class="lights-color-name">\${combo.remoteColor}</div>
                  </div>
              \`;
              
              // Add a first-time user button if no combo exists yet
              if (recentCombinations.length === 1) {
                  comboDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
          }

          function updateHistoryDisplay() {
              const historyList = document.getElementById('historyList');
              
              if (recentCombinations.length === 0) {
                  historyList.innerHTML = '<p style="color: #999; font-style: italic;">No recent combinations yet. Generate your first coordination!</p>';
                  return;
              }
              
              historyList.innerHTML = recentCombinations.map(combo => \`
                  <div class="lights-history-item">
                      <div class="lights-history-preset">🎭 Stage: Preset #\${combo.preset} - \${combo.presetName} <span style="color: #999;">(\${combo.category}\${combo.temperature ? \`, \${combo.temperature}\` : ''})</span></div>
                      <div class="lights-history-remote">📱 Sign: \${combo.remoteColor}</div>
                      <div class="lights-timestamp">\${combo.timestamp}</div>
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
      }} />

      {/* TypeScript interface to extend window object */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Extend window object for TypeScript
          if (typeof window !== 'undefined') {
            window.generateColorCombo = window.generateColorCombo || function() {};
            window.setFilter = window.setFilter || function() {};
            window.toggleDropdown = window.toggleDropdown || function() {};
            window.toggleColorExclusion = window.toggleColorExclusion || function() {};
            window.selectAllColors = window.selectAllColors || function() {};
            window.selectNoneColors = window.selectNoneColors || function() {};
            window.selectWarmColors = window.selectWarmColors || function() {};
            window.selectCoolColors = window.selectCoolColors || function() {};
            window.clearHistory = window.clearHistory || function() {};
          }
        `
      }} />
    </div>
  )
}
