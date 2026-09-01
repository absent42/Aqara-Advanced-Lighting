# Contributing to Aqara Advanced Lighting

Thank you for your interest in contributing to the Aqara Advanced Lighting integration for Home Assistant. This document provides guidelines for contributing code, submitting presets, and reporting issues.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Contributions](#code-contributions)
- [Contributing Language Translations](#contributing-language-translations)
- [Submitting Custom Presets](#submitting-custom-presets)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Code Style](#code-style)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow Home Assistant community guidelines

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your contribution
4. Make your changes
5. Test your changes thoroughly
6. Submit a pull request

## Development Setup

### Prerequisites

- Python 3.13 or higher
- Node.js 18 or higher (for frontend build tools only)
- Home Assistant development environment
- Docker (for HA dev container, optional)
- Git

**Note**: The frontend is built with Lit (TypeScript/web components). Node.js is only used as a build tool to compile and bundle the frontend code. The final output is vanilla JavaScript that runs in the browser.

### Backend Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Aqara-Advanced-Lighting.git
cd Aqara-Advanced-Lighting

# Install development dependencies
pip install -r requirements_test.txt
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd custom_components/aqara_advanced_lighting/frontend_src

# Install dependencies
npm install

# Build frontend
npm run build

# Watch mode for development
npm run watch
```

### Running in Home Assistant

1. Copy the `custom_components/aqara_advanced_lighting` folder to your Home Assistant `custom_components` directory
2. Restart Home Assistant
3. Add the integration through the UI

## Code Contributions

### What to Contribute

We welcome contributions for:

- Bug fixes
- New features for supported light models (T1, T1M, T1 Strip, T2 Bulb)
- Performance improvements
- Documentation improvements
- Code quality improvements
- Test coverage improvements

### Before You Start

1. Check existing issues and pull requests to avoid duplicates
2. For major changes, open an issue first to discuss the approach
3. Review the existing codebase to understand architecture patterns and code style

### Code Standards

This project follows Home Assistant integration quality standards and best practices.

#### Python Code

- **Python Version**: 3.13+
- **Type Hints**: Required for all functions and methods
- **Formatting**: Use Ruff for formatting
- **Linting**: PyLint and Ruff
- **Type Checking**: MyPy
- **Async**: All I/O operations must be async
- **Error Handling**: Use appropriate Home Assistant exceptions
- **Documentation**: Docstrings required for all public methods

Example:
```python
async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Aqara Advanced Lighting from a config entry."""
    # Implementation
```

#### TypeScript/Lit Frontend Code

The frontend is built with **Lit** (lightweight web components library) and TypeScript:

- **Framework**: Lit 3.x for web components
- **Language**: TypeScript with modern ES6+ features
- **Type Safety**: Full TypeScript type checking
- **Formatting**: Follow existing code style
- **Build Output**: Compiles to vanilla JavaScript (no runtime dependencies)
- **Home Assistant Integration**: Follow HA frontend patterns and custom element standards

#### Key Rules

- Keep functions focused and single-purpose
- Avoid over-engineering
- Write tests for new functionality
- Follow existing patterns in the codebase

### Development Commands

```bash
# Backend - Run linters
pre-commit run --all-files

# Backend - Run tests for integration
scripts/run-tests.sh \
  --cov=custom_components.aqara_advanced_lighting \
  --cov-report term-missing

# Backend - Type checking
mypy homeassistant/components/aqara_advanced_lighting

# Backend - Update requirements
python -m script.gen_requirements_all

# Frontend - Build
cd custom_components/aqara_advanced_lighting/frontend_src
npm run build

# Frontend - Development watch mode
npm run watch
```

## Contributing Language Translations

We welcome translations of the integration into other languages. Translations help make the integration accessible to Home Assistant users worldwide.

### What Gets Translated

The integration has two separate translation systems:

1. **Backend Translations** - Service actions, config flow, and exception messages
2. **Frontend Panel Translations** - UI labels, buttons, and tooltips in the Aqara Lighting panel

### Translation File Structure

Translations are stored in two separate locations:

**Backend Translations** (Home Assistant standard):
```
custom_components/aqara_advanced_lighting/translations/
├── en.json          # English (reference translation)
├── de.json          # German
├── fr.json          # French
├── es.json          # Spanish
└── [language].json  # Your translation
```

**Frontend Panel Translations** (embedded in compiled JavaScript):
```
custom_components/aqara_advanced_lighting/frontend_src/translations/
├── panel.en.json    # English panel UI (reference)
├── panel.de.json    # German panel UI
├── panel.fr.json    # French panel UI
└── panel.[lang].json  # Your panel translation
```

Each language file uses the ISO 639-1 language code (e.g., `de` for German, `fr` for French, `es` for Spanish).

### Why Two Translation Systems?

Home Assistant's translation API for custom integrations only serves standard sections (config, services, exceptions). Custom UI elements like the panel must embed their translations directly in the compiled JavaScript. This is why panel translations are separate and require a frontend rebuild.

### How to Create a Translation

#### Step 1: Copy the English Templates

You need to translate **both** backend and frontend files:

**Backend Translation:**
```bash
cd custom_components/aqara_advanced_lighting/translations/
cp en.json [your_language_code].json
```

**Frontend Panel Translation:**
```bash
cd custom_components/aqara_advanced_lighting/frontend_src/translations/
cp panel.en.json panel.[your_language_code].json
```

For example, to create a German translation:
```bash
# Backend
cd custom_components/aqara_advanced_lighting/translations/
cp en.json de.json

# Frontend
cd ../frontend_src/translations/
cp panel.en.json panel.de.json
```

#### Step 2: Translate the Content

Open your new translation files and translate all text values while keeping the JSON structure and keys unchanged.

**Backend Translation Structure (en.json):**

```json
{
  "config": {
    "step": {
      "user": {
        "title": "Set up Aqara Advanced Lighting",
        "description": "Configure advanced lighting control for Aqara lights via Zigbee2MQTT.",
        "data": {
          "z2m_base_topic": "Zigbee2MQTT base topic"
        }
      }
    },
    "error": {
      "mqtt_not_loaded": "MQTT integration is not loaded.",
      "unknown": "An unexpected error occurred."
    }
  },
  "services": {
    "set_dynamic_effect": {
      "name": "Set dynamic effect",
      "description": "Activate a dynamic RGB effect on Aqara lights.",
      "fields": {
        "entity_id": {
          "name": "Light entity",
          "description": "The light entity or group to control."
        }
      }
    }
  },
  "exceptions": {
    "device_not_found": {
      "message": "Device {device} was not found."
    }
  }
}
```

**Frontend Panel Translation Structure (panel.en.json):**

```json
{
  "title": "Aqara Advanced Lighting",
  "tabs": {
    "activate": "Activate",
    "effects": "Effects",
    "patterns": "Patterns"
  },
  "editors": {
    "name_label": "Name",
    "save_button": "Save",
    "cancel_button": "Cancel"
  }
}
```

**Important Rules:**

- **DO translate**: All text values (strings after the `:`)
- **DO NOT translate**: JSON keys, placeholders like `{device_name}`, or special values like `mdi:icon-name`
- **Preserve structure**: Keep the exact same JSON structure and nesting
- **Maintain placeholders**: Keep placeholders like `{device_name}` exactly as they appear

#### Step 3: Translation Best Practices

**Language Style:**
- Be concise and clear
- Use terminology consistent with Home Assistant in your language
- Avoid emojis or special characters
- Write for non-technical users when possible

**Capitalization Rules:**
- **Dialog/Section Titles**: Use Title Case (capitalize major words)
  - Examples: "Create Effect Preset", "Segment Pattern Presets", "Transition Settings"
- **Field Labels/Service Names**: Use sentence case (capitalize only the first word and proper nouns)
  - Examples: "Light entity", "Color temperature", "Set dynamic effect"
- **Descriptions**: Use sentence case
  - Examples: "Select the light device to control", "Brightness level for the effect"

**Context Awareness:**
- Service descriptions should explain what the service does
- Field descriptions should clarify what the user needs to provide
- Error messages should be helpful and actionable

**Good Examples:**

```json
// Dialog title - Title Case
"create_effect_title": "Create Effect Preset"

// Field label - Sentence case
"name": "Effect brightness"

// Description - Sentence case, clear and concise
"description": "Select the light device to control"

// Bad - Too verbose
"description": "This is the field where you need to select which light device you want to control"

// Bad - Wrong capitalization for field label (should be sentence case)
"name": "Effect Brightness"
```

### Complete Translation Sections

**Backend Translation (en.json)** should include:

1. **config** - Configuration flow text (setup wizard and reconfigure flow)
2. **exceptions** - Error messages with placeholders
3. **services** - All service action definitions

**Services to Translate:**
- `set_dynamic_effect` - Set dynamic effect
- `stop_effect` - Stop effect
- `set_segment_pattern` - Set segment pattern
- `create_gradient` - Create gradient
- `create_blocks` - Create blocks
- `start_cct_sequence` - Start CCT sequence
- `stop_cct_sequence` - Stop CCT sequence
- `pause_cct_sequence` - Pause CCT sequence
- `resume_cct_sequence` - Resume CCT sequence
- `start_segment_sequence` - Start RGB segment sequence
- `stop_segment_sequence` - Stop RGB segment sequence
- `pause_segment_sequence` - Pause RGB segment sequence
- `resume_segment_sequence` - Resume RGB segment sequence

**Frontend Panel Translation (panel.[lang].json)** should include:

1. **title** - Panel title
2. **tabs** - Tab labels (Activate, Effects, Patterns, CCT, Segments, Presets, Config)
3. **errors** - Error messages shown in the panel
4. **target** - Light selection UI
5. **presets** - Preset management UI
6. **dialogs** - Dialog titles and descriptions
7. **config** - Device configuration UI
8. **transition_curve** - Transition curve editor
9. **tooltips** - Hover tooltips
10. **options** - Dropdown options
11. **editors** - Form field labels and buttons

### Testing Your Translation

#### Step 1: Rebuild the Frontend (Required for Panel Translations)

If you translated the frontend panel (`panel.[lang].json`), you must rebuild the frontend:

```bash
cd custom_components/aqara_advanced_lighting/frontend_src
npm install  # Only needed first time
npm run build
```

This compiles your panel translations into the JavaScript bundle.

#### Step 2: Copy Translation Files to Home Assistant

**Backend translation:**
```bash
# Copy your backend translation to your HA custom_components folder
cp custom_components/aqara_advanced_lighting/translations/[language].json \
  /config/custom_components/aqara_advanced_lighting/translations/
```

**Frontend panel (after rebuild):**
```bash
# Copy the rebuilt frontend with embedded translations
cp custom_components/aqara_advanced_lighting/frontend/aqara_panel.js \
  /config/custom_components/aqara_advanced_lighting/frontend/
```

#### Step 3: Set Your Language in Home Assistant

- Go to your user profile (click your username)
- Select Language
- Choose your translated language
- Restart Home Assistant to load the new translations

#### Step 4: Test the Translation Appears

**Backend translations:**
- **Configuration Flow**: Try adding the integration (Settings > Devices & Services > Add Integration)
- **Services**: Open Developer Tools > Actions and search for "Aqara" services
- **Error Messages**: Trigger errors (try invalid device IDs) to see exception translations

**Frontend panel translations:**
- **Panel UI**: Open the Aqara Lighting panel and check all tabs, buttons, and labels
- **Dialogs**: Open the effect/pattern editors to test dialog translations
- **Tooltips**: Hover over UI elements to verify tooltip translations

#### Step 5: Verify Completeness

- [ ] All service names appear in your language
- [ ] All field descriptions are translated
- [ ] Error messages display in your language
- [ ] Panel UI is fully translated (if applicable)
- [ ] No English text appears where it shouldn't
- [ ] Placeholders like `{device}` remain unchanged

#### Common Issues

**Translation not appearing:**
- Verify the file is named correctly with the ISO 639-1 code
- Check JSON syntax is valid (use a JSON validator)
- Ensure Home Assistant language setting matches your file name
- Restart Home Assistant after adding the translation file

**Partial translation showing:**
- Missing translations fall back to English
- Compare your file structure to `en.json` to find missing keys
- Ensure all nested objects are complete

**JSON syntax errors:**
- Use a JSON validator (many online tools available)
- Common mistakes: missing commas, trailing commas, unescaped quotes
- Validate before submitting

### Submitting Your Translation

#### Prepare the Pull Request

1. **Ensure completeness:**
   - All sections translated (both backend and frontend if applicable)
   - JSON syntax is valid
   - Frontend rebuilt if panel translation was added
   - Tested in Home Assistant
   - No English text remains (except in placeholders/keys)

2. **Files to include in your PR:**
   - **Backend translation**: `custom_components/aqara_advanced_lighting/translations/[language].json`
   - **Frontend panel translation** (optional): `custom_components/aqara_advanced_lighting/frontend_src/translations/panel.[language].json`
   - **Rebuilt frontend** (if panel translation added): `custom_components/aqara_advanced_lighting/frontend/aqara_panel.js`

3. **Create a pull request with:**
   - Clear PR title: "Add [Language Name] translation"
   - Description including:
     - Language name and code
     - What was translated (backend only, or backend + frontend panel)
     - Confirmation of testing
     - Native language proficiency level

**Example PR Description (Backend + Frontend):**

```markdown
## Description
Add German (de) translation for Aqara Advanced Lighting integration

## Details
- Language: German (de)
- Translated sections:
  - Backend: Config flow, services, exceptions
  - Frontend: Panel UI (all tabs, dialogs, tooltips)
- Testing: Tested in Home Assistant 2025.12 with German locale
- Native speaker: Yes

## Files Changed
- `translations/de.json` - Backend translation
- `frontend_src/translations/panel.de.json` - Frontend panel translation
- `frontend/aqara_panel.js` - Rebuilt frontend with German translations

## Checklist
- [x] All sections translated
- [x] JSON syntax validated
- [x] Frontend rebuilt (npm run build)
- [x] Tested in Home Assistant
- [x] No English text in values
- [x] Follows translation best practices
```

**Example PR Description (Backend Only):**

```markdown
## Description
Add German (de) translation for Aqara Advanced Lighting integration (backend only)

## Details
- Language: German (de)
- Translated sections: Config flow, services, exceptions
- Testing: Tested in Home Assistant 2025.12 with German locale
- Native speaker: Yes

## Files Changed
- `translations/de.json` - Backend translation

## Checklist
- [x] All sections translated
- [x] JSON syntax validated
- [x] Tested in Home Assistant
- [x] No English text in values
- [x] Follows translation best practices
```

#### Translation Updates

If you notice issues with an existing translation or want to improve it:

1. Open the existing translation file
2. Make your improvements
3. Test the changes
4. Submit a pull request with a clear description of what was improved

### Translation Maintenance

Translations may need updates when:
- New services are added
- Service parameters change
- New error messages are added
- UI text is modified

If you maintain a translation, watch for integration updates that might require translation updates.

## Submitting Custom Presets

We welcome community-created presets that showcase creative uses of the lights. High-quality presets may be included as built-in defaults.

### Preset Types

1. **Dynamic Effects** - RGB effects with custom colors and speeds
2. **Segment Patterns** - Individual segment color configurations
3. **CCT Sequences (Standard)** - Timed color temperature and brightness step sequences
4. **CCT Sequences (Solar)** - Color temperature tied to real-time sun elevation
5. **CCT Sequences (Schedule)** - Color temperature at fixed clock times or sunrise/sunset offsets
6. **Segment Sequences** - Animated segment sequences with multiple steps
7. **Dynamic Scenes** - Multi-light color transitions with hold and distribution control

### Preset Submission Guidelines

#### Quality Requirements

- Preset must work reliably on the specified device type(s)
- Should demonstrate a unique or useful lighting pattern
- Must have a clear, descriptive name
- Should include all necessary parameters
- Tested on actual hardware

#### How to Submit Presets

1. Create your preset using the integration UI
2. Export the preset configuration using one of these methods:

**Method 1: Selective Preset Export (Recommended)**
   - Open the Aqara Lighting panel in Home Assistant
   - Navigate to the **My Presets** tab
   - Click the **Select** button at the top of the page to enter selection mode
   - Select the presets you want to submit using the checkboxes
   - Click **Export Selected** to download a JSON file containing only your chosen presets
   - Open the downloaded file in a text editor
   - Your preset data is organized by category:
     - `effect_presets` - Dynamic RGB effects
     - `segment_pattern_presets` - Segment color patterns
     - `cct_sequence_presets` - CCT sequences (standard, solar, and schedule modes)
     - `segment_sequence_presets` - RGB segment sequences
     - `dynamic_scene_presets` - Dynamic scenes
   - Copy the preset data for your submission file

**Method 2: Access Storage File (Advanced)**
   - Navigate to your Home Assistant config directory (usually `/config/` or `~/.homeassistant/`)
   - Open `.storage/aqara_advanced_lighting.presets` in a text editor
   - Find your preset by name in the appropriate section
   - Copy your preset data
   - Note: This method requires direct filesystem access

**Method 3: Use HTTP API (Advanced)**
   - Create a REST API call using curl or Developer Tools:
     ```bash
     curl -H "Authorization: Bearer YOUR_LONG_LIVED_ACCESS_TOKEN" \
       http://YOUR_HA_IP:8123/api/aqara_advanced_lighting/user_presets?type=effect
     ```
   - Replace `type=effect` with your preset type: `effect`, `segment_pattern`, `cct_sequence`, `segment_sequence`, or `dynamic_scene`
   - Find your preset in the JSON response and copy the preset data

3. Create a preset submission file in `preset_submissions/` directory:

**File naming**: `preset_type_name.json`

**Examples**: `effect_ocean_waves.json`, `cct_solar_daylight_tracking.json`, `scene_sunset_glow.json`

```json
{
  "preset_type": "effect",
  "name": "Ocean Waves",
  "description": "Gentle blue-green waves reminiscent of ocean water",
  "author": "YourGitHubUsername",
  "device_types": ["t1m", "t1"],
  "tested_on": ["T1M"],
  "icon": "mdi:waves",
  "preset_data": {
    "device_type": "t1m",
    "effect": "flow1",
    "effect_speed": 25,
    "effect_brightness": 80,
    "effect_colors": [
      {"x": 0.1610, "y": 0.3549},
      {"x": 0.1566, "y": 0.2854},
      {"x": 0.1532, "y": 0.2458}
    ]
  }
}
```

4. Submit a pull request with:
   - Your preset file(s) in `preset_submissions/`
   - A brief description of the preset
   - Device type(s) tested on

#### Preset File Format

```json
{
  "preset_type": "effect|segment_pattern|cct_sequence|cct_solar|cct_schedule|segment_sequence|dynamic_scene",
  "name": "Preset Name",
  "description": "Detailed description of what the preset does",
  "author": "GitHub username",
  "device_types": ["t2_bulb", "t1", "t1m", "t1_strip"],
  "tested_on": ["T1M", "T2 Bulb"],
  "icon": "mdi:icon-name",
  "preset_data": {
    // Actual preset configuration data
  }
}
```

#### CCT Solar and Schedule Presets

CCT sequences support three modes. Solar and schedule presets use the same `cct_sequence` preset type but include mode-specific fields:

**Solar mode** - Color temperature tracks the sun's elevation in real time:
```json
{
  "preset_type": "cct_solar",
  "name": "Daylight Tracking",
  "description": "Adjusts color temperature based on the sun's position throughout the day",
  "author": "YourGitHubUsername",
  "device_types": ["t2_bulb", "t2_cct", "t1m", "t1_strip"],
  "tested_on": ["T2 Bulb"],
  "icon": "mdi:white-balance-sunny",
  "preset_data": {
    "name": "Daylight Tracking",
    "icon": "mdi:white-balance-sunny",
    "mode": "solar",
    "steps": [],
    "loop_mode": "continuous",
    "end_behavior": "maintain",
    "solar_steps": [
      {"sun_elevation": -6, "color_temp": 2700, "brightness": 50, "phase": "any"},
      {"sun_elevation": 0, "color_temp": 3200, "brightness": 128, "phase": "any"},
      {"sun_elevation": 20, "color_temp": 4500, "brightness": 200, "phase": "any"},
      {"sun_elevation": 45, "color_temp": 6500, "brightness": 255, "phase": "any"}
    ],
    "auto_resume_delay": 0
  }
}
```

Solar step fields:
- `sun_elevation` - Sun angle in degrees (-90 to 90). Values are interpolated between steps.
- `color_temp` - Color temperature in Kelvin (1000-10000)
- `brightness` - Brightness level (1-255)
- `phase` - When this step applies: `"rising"`, `"setting"`, or `"any"` (both)

**Schedule mode** - Color temperature at fixed clock times or sunrise/sunset offsets:
```json
{
  "preset_type": "cct_schedule",
  "name": "Work Day Rhythm",
  "description": "Warm morning, bright midday, warm evening based on clock time",
  "author": "YourGitHubUsername",
  "device_types": ["t2_bulb", "t2_cct", "t1m", "t1_strip"],
  "tested_on": ["T2 Bulb"],
  "icon": "mdi:clock-outline",
  "preset_data": {
    "name": "Work Day Rhythm",
    "icon": "mdi:clock-outline",
    "mode": "schedule",
    "steps": [],
    "loop_mode": "continuous",
    "end_behavior": "maintain",
    "schedule_steps": [
      {"time": "06:00", "color_temp": 2700, "brightness": 102, "label": "Dawn"},
      {"time": "09:00", "color_temp": 5000, "brightness": 230, "label": "Morning"},
      {"time": "12:00", "color_temp": 6500, "brightness": 255, "label": "Midday"},
      {"time": "sunset-30", "color_temp": 3500, "brightness": 180, "label": "Pre-sunset"},
      {"time": "sunset+90", "color_temp": 2700, "brightness": 102, "label": "Evening"}
    ],
    "auto_resume_delay": 0
  }
}
```

Schedule step fields:
- `time` - Fixed time as `"HH:MM"` or relative to sun as `"sunrise+N"` / `"sunset-N"` (minutes)
- `color_temp` - Color temperature in Kelvin (1000-10000)
- `brightness` - Brightness level (1-255)
- `label` - Display label for the step (optional)

#### Dynamic Scene Presets

Dynamic scenes cycle multiple lights through a set of colors with configurable transitions:

```json
{
  "preset_type": "dynamic_scene",
  "name": "Sunset Glow",
  "description": "Warm sunset colors that slowly rotate across lights",
  "author": "YourGitHubUsername",
  "device_types": ["t2_bulb", "t1m", "t1_strip"],
  "tested_on": ["T2 Bulb"],
  "icon": "mdi:weather-sunset",
  "preset_data": {
    "name": "Sunset Glow",
    "icon": "mdi:weather-sunset",
    "colors": [
      {"x": 0.5916, "y": 0.3824, "brightness_pct": 70},
      {"x": 0.6399, "y": 0.3297, "brightness_pct": 70},
      {"x": 0.5143, "y": 0.4400, "brightness_pct": 70},
      {"x": 0.4112, "y": 0.2598, "brightness_pct": 70}
    ],
    "transition_time": 120.0,
    "hold_time": 180.0,
    "distribution_mode": "shuffle_rotate",
    "offset_delay": 30.0,
    "random_order": false,
    "loop_mode": "continuous",
    "loop_count": null,
    "end_behavior": "restore"
  }
}
```

Dynamic scene fields:
- `colors` - 1-8 colors in CIE 1931 XY with per-color `brightness_pct` (1-100)
- `transition_time` - Seconds to transition between colors
- `hold_time` - Seconds to hold each color before transitioning
- `distribution_mode` - How colors are assigned to lights: `"shuffle_rotate"`, `"synchronized"`, or `"random"`
- `offset_delay` - Seconds between each light starting its transition (0 = all at once)
- `random_order` - Randomize the color order each cycle
- `loop_mode` - `"once"`, `"count"`, or `"continuous"`
- `end_behavior` - What to do when done: `"maintain"`, `"turn_off"`, or `"restore"`

#### Preset Naming Guidelines

- Use clear, descriptive names
- Avoid generic names like "Cool Effect" or "Pattern 1"
- Reference what the preset does or looks like
- Good examples: "Sunset Fade", "Rainbow Chase", "Candlelight Flicker", "Daylight Tracking"
- Bad examples: "My Effect", "Test 1", "Cool Pattern"

#### What Makes a Good Preset

- **Unique**: Offers something different from existing presets
- **Purposeful**: Serves a specific use case or aesthetic
- **Polished**: Well-tested with good parameter choices
- **Documented**: Clear description helps users understand when to use it
- **Universal**: Works well across different room sizes/setups when possible

## Pull Request Process

### Before Submitting

1. Ensure all tests pass
2. Run linters and fix any issues
3. Update documentation if needed
4. Add tests for new functionality
5. Follow commit message guidelines

### Commit Messages

Use clear, descriptive commit messages:

```
Add ocean waves dynamic effect preset

- Creates gentle blue-green wave effect
- Tested on T1M with 26 segments
- Optimized speed for smooth transitions
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Preset submission

## Testing
Describe testing performed:
- Hardware tested on
- Test cases covered
- Screenshots/videos (if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No new warnings
```

### Review Process

1. Maintainer reviews code/preset
2. Automated tests run
3. Feedback provided if changes needed
4. Approval and merge when ready

## Testing

### Backend Tests

```bash
# Run all integration tests
scripts/run-tests.sh

# Run with coverage
scripts/run-tests.sh \
  --cov=custom_components.aqara_advanced_lighting \
  --cov-report term-missing \
  --cov-report html

# Run a specific test file, or select by name
scripts/run-tests.sh tests/test_config_flow.py
scripts/run-tests.sh -k device_registry
```

The tests need `pytest-homeassistant-custom-component`. The script uses it when
it is installed and otherwise builds the same fixtures from the Home Assistant
core checkout that provides the installed `homeassistant` package, so it works
in a core dev container where that package is absent. Note that installing the
plugin pins its own core version, which will downgrade a 2026.x checkout.

Run it inside whatever environment has Home Assistant installed:

```bash
docker exec <container> /workspaces/integrations/aqara_advanced_lighting/scripts/run-tests.sh
```

### Manual Testing

1. Install integration in test Home Assistant instance
2. Test on actual Aqara hardware
3. Verify all features work as expected
4. Check for errors in Home Assistant logs
5. Test edge cases and error conditions

### Testing Checklist

- [ ] Feature works as intended
- [ ] No errors in Home Assistant logs
- [ ] UI elements display correctly
- [ ] Works on all supported device types (if applicable)
- [ ] Error handling works properly
- [ ] Performance is acceptable

## Code Style

### Python

Follow PEP 8 and Home Assistant guidelines:

```python
"""Module docstring."""
from __future__ import annotations

import asyncio
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry
) -> bool:
    """Set up from config entry."""
    # Implementation
    return True
```

### TypeScript/Lit

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @property({ type: String }) public name = '';
  @state() private _count = 0;

  static styles = css`
    :host {
      display: block;
    }
  `;

  protected render() {
    return html`
      <div>Hello, ${this.name}!</div>
    `;
  }
}
```

## Questions or Issues?

- Check existing [issues](https://github.com/absent42/Aqara-Advanced-Lighting/issues)
- Review the codebase and README for architecture and feature details
- Open a new issue for bugs or feature requests
- Join discussions for questions and ideas

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes (for significant contributions)
- README credits section

Thank you for contributing to Aqara Advanced Lighting!
