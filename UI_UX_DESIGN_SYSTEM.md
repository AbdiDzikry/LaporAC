# 🎨 LAPORAC - MODERN UI/UX DESIGN SYSTEM

**Version**: 2.0 - Professional & Modern  
**Date**: 26 Februari 2026  
**Status**: ✅ Production Ready

---

## 🎯 DESIGN PHILOSOPHY

### Core Principles
1. **Professional** - Clean, corporate-ready design
2. **Modern** - Contemporary UI patterns & animations
3. **Accessible** - WCAG 2.1 compliant
4. **Responsive** - Mobile-first approach
5. **Performant** - Optimized animations & transitions

---

## 🎨 COLOR PALETTE

### Primary Colors (Blue Theme)
```css
--color-primary-50:  #eff6ff  /* Lightest backgrounds */
--color-primary-100: #dbeafe  /* Subtle highlights */
--color-primary-200: #bfdbfe  /* Border accents */
--color-primary-300: #93c5fd  /* Hover states */
--color-primary-400: #60a5fa  /* Secondary elements */
--color-primary-500: #3b82f6  /* Primary actions */
--color-primary-600: #2563eb  /* Buttons, links */
--color-primary-700: #1d4ed8  /* Active states */
--color-primary-800: #1e40af  /* Dark accents */
--color-primary-900: #1e3a8a  /* Text highlights */
```

### Neutral Grays
```css
--color-gray-50:  #f9fafb  /* Page backgrounds */
--color-gray-100: #f3f4f6  /* Card backgrounds */
--color-gray-200: #e5e7eb  /* Borders */
--color-gray-300: #d1d5db  /* Dividers */
--color-gray-400: #9ca3af  /* Placeholder text */
--color-gray-500: #6b7280  /* Secondary text */
--color-gray-600: #4b5563  /* Body text */
--color-gray-700: #374151  /* Headings */
--color-gray-800: #1f2937  /* Primary text */
--color-gray-900: #111827  /* Darkest text */
```

### Semantic Colors
```css
Success: #10b981  /* Green - Completed, approved */
Warning: #f59e0b  /* Yellow - Pending, caution */
Error:   #ef4444  /* Red - Errors, rejected */
Info:    #3b82f6  /* Blue - Information */
```

---

## 🔤 TYPOGRAPHY

### Font Family
```css
Primary: 'Inter', system-ui, sans-serif
Mono:    'JetBrains Mono', monospace (for code, numbers)
```

### Font Sizes
```
xs:   12px  /* Captions, labels */
sm:   14px  /* Secondary text */
base: 16px  /* Body text */
lg:   18px  /* Subheadings */
xl:   20px  /* Section titles */
2xl:  24px  /* Page titles */
```

### Font Weights
```
300: Light      /* Rarely used */
400: Regular    /* Body text */
500: Medium     /* Emphasis */
600: Semibold   /* Subheadings */
700: Bold       /* Headings */
800: Black      /* Display */
900: Heavy      /* Logos */
```

---

## 📐 SPACING SYSTEM

Based on 4px grid:
```
1:  4px    /* Micro spacing */
2:  8px    /* Tight spacing */
3:  12px   /* Base spacing */
4:  16px   /* Standard gap */
5:  20px   /* Comfortable gap */
6:  24px   /* Section padding */
8:  32px   /* Large padding */
10: 40px   /* Hero padding */
12: 48px   /* Page sections */
```

---

## 🎭 SHADOWS

```css
shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1)
shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1)
shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1)
shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25)
```

### Usage
- **Cards**: shadow-sm, hover:shadow-md
- **Dropdowns**: shadow-lg
- **Modals**: shadow-xl
- **Popovers**: shadow-2xl

---

## 🔘 COMPONENTS

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">
  Primary Action
</button>
```
- Gradient: blue-600 → blue-700
- Hover: blue-700 → blue-800
- Shadow: shadow-md → shadow-lg
- Radius: rounded-xl

#### Secondary Button
```html
<button class="btn btn-secondary">
  Secondary Action
</button>
```
- Background: white
- Border: gray-200
- Hover: gray-50 background

#### Success Button
```html
<button class="btn btn-success">
  Complete Action
</button>
```
- Gradient: green-600 → emerald-600

#### Danger Button
```html
<button class="btn btn-danger">
  Delete Action
</button>
```
- Gradient: red-600 → red-700

---

### Cards

#### Standard Card
```html
<div class="card">
  <!-- Content -->
</div>
```
- Background: white
- Border: gray-200
- Shadow: shadow-sm
- Radius: rounded-2xl
- Hover: shadow-md

#### Elevated Card
```html
<div class="card-elevated">
  <!-- Content -->
</div>
```
- Shadow: shadow-lg
- Hover: shadow-xl, transform -translate-y-0.5

---

### Forms

#### Input Field
```html
<input type="text" class="input" placeholder="Enter text...">
```
- Background: gray-50
- Border: ring-1 ring-gray-200
- Focus: ring-2 ring-blue-600, bg-white
- Radius: rounded-xl
- Padding: px-4 py-2.5

#### Error State
```html
<input type="text" class="input input-error">
```
- Ring: red-300
- Focus: ring-red-600
- Background: red-50 → white on focus

---

### Badges

#### Status Badges
```html
<span class="badge badge-primary">Status</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
```
- Padding: px-2.5 py-1
- Radius: rounded-lg
- Font: text-xs font-bold uppercase

---

### Tables

#### Modern Table
```html
<table class="table-modern">
  <thead>
    <tr>
      <th>Header</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data</td>
    </tr>
  </tbody>
</table>
```
- Header: bg-gray-50, text-gray-500 uppercase
- Row: border-gray-100, hover:bg-gray-50/80
- Cell: px-6 py-4

---

## ✨ ANIMATIONS

### Fade In
```css
.animate-fade-in
```
- Duration: 200ms
- Effect: opacity 0 → 1

### Fade In Up
```css
.animate-fade-in-up
```
- Duration: 300ms
- Effect: opacity 0 → 1, translateY(10px) → 0

### Scale In
```css
.animate-scale-in
```
- Duration: 200ms
- Effect: opacity 0 → 1, scale(0.95) → 1

### Slide In Right
```css
.animate-slide-in-right
```
- Duration: 300ms
- Effect: opacity 0 → 1, translateX(20px) → 0

---

## 🎯 INTERACTION STATES

### Hover
- Cards: shadow-md, border-gray-300
- Buttons: shadow-lg, gradient shift
- Table rows: bg-gray-50/80
- Sidebar items: bg-gray-100/80

### Focus
- Inputs: ring-2 ring-blue-600
- Buttons: ring-2 ring-offset-2
- All interactive: outline-2px primary-500

### Active
- Buttons: gradient to darker shade
- Scale: transform scale(0.98)

### Disabled
- Opacity: 0.5
- Cursor: not-allowed
- Pointer events: none

---

## 📱 RESPONSIVE BREAKPOINTS

```css
sm:  640px   /* Mobile landscape */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */
2xl: 1536px  /* Extra large */
```

### Grid System
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns

---

## 🎨 SIDEBAR DESIGN

### Features
- Gradient logo with scale animation
- Hover expand (84px → 280px)
- Active state: gradient background
- Smooth transitions (200ms)
- Shadow: shadow-xl

### Active State
```
bg-gradient-to-r from-blue-50 to-blue-100/50
text-blue-700 font-bold
border border-blue-200/50
shadow-sm
```

---

## 🖼️ IMAGES & ICONS

### Icons
- Size: 20px (w-5 h-5)
- Stroke width: 2
- Color: Inherit from text
- Hover: Color shift to primary

### Avatars
- Size: 40px (w-10 h-10)
- Radius: rounded-full
- Border: 2px white
- Shadow: shadow-sm

---

## 📊 DATA VISUALIZATION

### Charts
- Font: Inter
- Colors: Blue palette
- Grid: gray-200
- Text: gray-600

### Progress Bars
- Track: gray-200
- Fill: Gradient blue-600 → blue-700
- Radius: rounded-full
- Height: 8px

---

## 🎯 ACCESSIBILITY

### Color Contrast
- Text on white: Minimum gray-600
- Text on blue: white only
- Interactive elements: 3:1 ratio minimum

### Focus Indicators
- All interactive: 2px outline
- Offset: 2px
- Color: primary-500

### Screen Readers
- ARIA labels on icons
- Alt text on images
- Semantic HTML

---

## 🚀 PERFORMANCE

### Optimizations
- CSS variables for theming
- Hardware-accelerated animations
- Lazy loading for images
- Minimal reflows

### Best Practices
- Transform & opacity for animations
- Will-change for complex animations
- Contain property for isolated components

---

## 📝 USAGE EXAMPLES

### Card with Button
```html
<div class="card p-6">
  <h3 class="text-lg font-bold text-gray-900 mb-4">Title</h3>
  <p class="text-gray-600 mb-6">Description text here.</p>
  <div class="flex gap-3">
    <button class="btn btn-primary">Action</button>
    <button class="btn btn-secondary">Cancel</button>
  </div>
</div>
```

### Form Example
```html
<form class="space-y-4">
  <div>
    <label class="block text-sm font-semibold text-gray-700 mb-2">
      Email
    </label>
    <input type="email" class="input" placeholder="you@example.com">
  </div>
  <button type="submit" class="btn btn-primary w-full">
    Submit
  </button>
</form>
```

### Status Badge
```html
<div class="flex items-center gap-2">
  <span class="badge badge-success">Completed</span>
  <span class="badge badge-warning">Pending</span>
  <span class="badge badge-error">Rejected</span>
</div>
```

---

## 🎊 WHAT'S NEW IN V2.0

### Added
- ✅ CSS variables for theming
- ✅ Gradient backgrounds
- ✅ Smooth animations
- ✅ Modern shadows
- ✅ Improved accessibility
- ✅ Better hover states
- ✅ Professional color palette

### Improved
- ✅ Better contrast ratios
- ✅ Smoother transitions
- ✅ More consistent spacing
- ✅ Enhanced focus states
- ✅ Modernized components

### Changed
- ✅ Buttons: Now with gradients
- ✅ Cards: Rounded-2xl (was rounded-lg)
- ✅ Inputs: Ring-based borders
- ✅ Badges: More vibrant colors
- ✅ Sidebar: Gradient logo

---

**Last Updated**: 26 Februari 2026  
**Version**: 2.0.0  
**Status**: Production Ready ✅
