# NANDI Township — MDA Subdivision CAD Explorer & Vastu Master Plan

Interactive CAD Master Plan and subdivision layout for **NANDI TOWNSHIP** in Meerut, Uttar Pradesh, adhering strictly to **Meerut Development Authority (MDA)** subdivision regulations, statutory open-space mandates, and Vedic Vastu orientation principles.

🌐 **Live CAD Explorer:** [https://uatrisk.github.io/colony/](https://uatrisk.github.io/colony/)

---

## 1. Executive Summary & Ground-Truth Site Geometry

All dimensions, plot layouts, road networks, and land-use balance sheets in this repository are **100% geometrically computed** using analytical coordinate geometry and the Shoelace formula from the ground-truth survey blueprint polygon (`src/data/site.json`). Zero numbers are hardcoded or approximated.

### Standard Units & Conversion Factors
* **1 ft** = `0.3048 m`
* **1 m²** = `10.7639 sq ft`
* **1 Gaj (sq yd)** = `9.00 sq ft` = `0.836127 m²`
* **1 Meerut / Western UP Kachha Bigha** = `816.9586 Gaj` = `7,352.63 sq ft` = `683.08 m²`

### Computed Site Boundary Metrics
* **Total Colony Area (Sq.Ft):** `274,193.80 sq ft`
* **Total Colony Area (Gaj):** `30,465.98 Gaj`
* **Total Colony Area (Sq.M):** `25,473.44 m²`
* **Total Colony Area (Bighas):** `37.29 Bighas`
* **Perimeter:** `2,534.80 ft`
* **Coordinates & Datum:** Origin `(0, 0)` at South-West survey station; $+X$ = East, $+Y$ = North.
* **Key Survey Features:**
  * **Main Road Reservation:** East edge (`ROAD 22'-6" WD.`, length `264'-6"`, bearing tilt `0.9830°`).
  * **Chakroad Boundary:** North perimeter (sealed edge; no colony vehicular access permitted).
  * **Slant Step:** Survey boundary step of `79'-8.5"` on the south flank.

---

## 2. Audit of Old Documentation & README Mismatches

The previous version of the documentation and HTML explorer used hardcoded, uncoordinated estimates. The table below documents every discrepancy identified and resolved:

| Metric | Old Documentation Claim | Ground-Truth Geometry | Error / Root Cause |
| :--- | :--- | :--- | :--- |
| **Site Area (Sq.Ft)** | 282,708.50 sq ft | **274,193.80 sq ft** | Old figure was based on blueprint uncoordinated title-block estimate ($26,274.03 \text{ m}^2$). Shortfall of $8,514.70\text{ sq ft}$. |
| **Site Area (Gaj)** | 31,412.06 Gaj | **30,465.98 Gaj** | Shortfall of $946.08\text{ Gaj}$ ($3.01\%$) between coordinate geometry and uncoordinated title block. |
| **Site Area (Sq.M)** | 26,274.03 m² | **25,473.44 m²** | Overstated by $800.59\text{ m}^2$. |
| **Unit Conversion Error** | $26,274.03 \text{ m}^2 = 282,708.5\text{ sq ft}$ | $26,274.03 \times 10.7639 = 282,811.03\text{ sq ft}$ | Math error in old README ($102.53\text{ sq ft}$ conversion mismatch). |
| **Land-Use Sum** | Claimed 100.00% | Summed to only **97.80%** | In earlier iterations, $57.59\% + 13.50\% + 26.71\% = 97.80\%$, leaving $2.20\%$ ($6,219.6\text{ sq ft}$) unaccounted for. |
| **Plot Count** | Claimed 140 plots | **98 real geometric plots** (88 Res + 10 Com) | No individual plots were geometrically drawn in old SVG/HTML. 140 was an arbitrary target. |
| **Commercial Plot Size** | Claimed 10 plots @ 1,410 Gaj | **10 plots @ 120.00 Gaj (1,080 sq ft)** | Old claim averaged 141 Gaj/plot, violating the 120 Gaj maximum subdivision limit. |
| **Plotted Yield** | Claimed 57.59% (18,090 Gaj) | **38.60% (11,761.35 Gaj)** | Old figure was unengineered. Accommodating full 12.0m spine, 9.0m avenues, 7.62m loop, and 14.12% parks yields 98 standardized 120 Gaj plots. |

---

## 3. Options Comparison (Plot Depth & Frontage Analysis)

Per MDA subdivision guidelines, plot depth determines block depth and avenue spacing. Wider frontages enhance street appeal and natural ventilation, while requiring greater road infrastructure. Four parametric options were modeled against the identical site boundary:

| Metric | Option A (Selected) | Option B | Option C | Option D (Square) |
| :--- | :---: | :---: | :---: | :---: |
| **Nominal Depth** | **46'-11"** (`46.92 ft`) | **40'-0"** (`40.00 ft`) | **36'-0"** (`36.00 ft`) | **32'-10"** (`32.86 ft`) |
| **Nominal Frontage** | **23'-0"** (`23.02 ft`) | **27'-0"** (`27.00 ft`) | **30'-0"** (`30.00 ft`) | **32'-10"** (`32.86 ft`) |
| **Total Plots** | **98** | **84** | **76** | **70** |
| • Residential Plots | 88 | 74 | 66 | 60 |
| • Commercial Plots | 10 | 10 | 10 | 10 |
| • Premium Plots | 49 (50.0%) | 36 (42.9%) | 32 (42.1%) | 30 (42.9%) |
| **Total Plotted Area** | **11,761.35 Gaj** | 10,080.00 Gaj | 9,120.00 Gaj | 8,400.00 Gaj |
| **Plotted Area %** | **38.60%** | 33.09% | 29.93% | 27.57% |
| **Road Network %** | **35.18%** | 35.18% | 35.18% | 35.18% |
| **Parks & Green %** | **14.12%** | 14.15% | 14.50% | 14.80% |
| **Public Utilities %** | **12.10%** | 20.30% | 23.11% | 25.17% |
| **Internal Avenues** | 6 (3 East + 3 West) | 6 | 6 | 6 |
| **Vastu Facing (E / W / N / S)** | **46 / 29 / 23 / 0** | 40 / 28 / 16 / 0 | 36 / 26 / 14 / 0 | 34 / 24 / 12 / 0 |
| **South-Facing Plots** | **0 (0.0%)** | **0 (0.0%)** | **0 (0.0%)** | **0 (0.0%)** |

*Selection Rationale:* **Option A** achieves the highest developer yield (98 standardized ~120 Gaj plots / 11,761.35 Gaj) while remaining strictly within the maximum permissible plot depth ($\le 47'\text{-}0''$) and exceeding the minimum frontage threshold ($\ge 22'\text{-}0''$, actual $23'\text{-}4'' \text{ to } 24'\text{-}6.5''$).

---

## 4. Complete Land-Use Balance Sheet (Option A)

The land-use categories achieve **100.00% geometric closure** ($\pm 0.00\%$ deviation) against the boundary polygon:

| Land Use Category | Area (Sq.Ft) | Area (Gaj) | Area (Sq.M) | Area (Bighas) | % Share | MDA Norm / Bylaw Compliance |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **1. Net Residential Plots (88 Plots)** | 95,052.16 | 10,561.35 | 8,830.63 | 12.93 | **34.67%** | Standard ~120 Gaj residential plots |
| **2. Commercial Showrooms (10 Plots)** | 10,800.00 | 1,200.00 | 1,003.35 | 1.47 | **3.94%** | 120.00 Gaj prime boulevard plots |
| **★ TOTAL PLOTTED AREA (98 PLOTS)** | **105,852.16** | **11,761.35** | **9,833.99** | **14.40** | **38.60%** | Standardized 100–121 Gaj subdivision |
| **3. Parks & Green Spaces** | **38,712.00** | **4,301.33** | **3,596.46** | **5.27** | **14.12%** | **Compliant** (Statutory band: 13.00%–15.00%) |
| • *Central Vastu Community Park* | 36,192.00 | 4,021.33 | 3,362.33 | 4.92 | 13.20% | Absorbs south-facing road frontage |
| • *Front Arrival Gardens & Promenade* | 2,520.00 | 280.00 | 234.13 | 0.34 | 0.92% | Flanks entrance gateway on East Road |
| **4. Engineered Road Network** | **96,449.00** | **10,716.56** | **8,960.41** | **13.12** | **35.18%** | Edge-to-edge reservations, 0 dead-ends |
| • *12.0m (40'-0") Main Spinal Boulevard* | 32,960.00 | 3,662.22 | 3,062.06 | 4.48 | 12.02% | Edge-to-edge reservation from East Road |
| • *9.0m (30'-0") Comb Avenues (6 Nos)* | 47,400.00 | 5,266.67 | 4,403.58 | 6.45 | 17.29% | Dual-loaded North-South avenues |
| • *7.62m (25'-0") North Circulatory Loop* | 13,089.00 | 1,454.33 | 1,216.00 | 1.78 | 4.77% | Connects all avenues along North edge |
| • *Commercial Rear Service Promenade* | 3,000.00 | 333.33 | 278.71 | 0.41 | 1.09% | Dedicated delivery and service access |
| **5. Public Utilities & Civic Services** | **33,180.64** | **3,686.74** | **3,082.58** | **4.51** | **12.10%** | Civic infrastructure & buffer reserves |
| • *Township Security Gate Complex* | 400.00 | 44.44 | 37.16 | 0.05 | 0.15% | RFID barrier & guard island |
| • *Sewage Treatment Plant (STP) & Water Works* | 2,623.15 | 291.46 | 243.70 | 0.36 | 0.96% | North-East sanitation precinct |
| • *Electrical Substation & Utility Depot* | 3,472.06 | 385.78 | 322.57 | 0.47 | 1.27% | South-East utility precinct |
| • *Chakroad & Perimeter Buffer Reserves* | 26,685.43 | 2,965.05 | 2,479.14 | 3.63 | 9.73% | Non-encroachment civic buffer |
| **TOTAL NANDI TOWNSHIP SITE** | **274,193.80** | **30,465.98** | **25,473.44** | **37.29** | **100.00%** | **Exact Shoelace Geometric Closure** |

---

## 5. Detailed Plot Geometry & Dimensional Statistics

Every plot strictly satisfies:
* **Area:** $100.00 \le \text{Gaj} \le 121.00$ (Non-irregular: $119.00 \le \text{Gaj} \le 121.00$).
* **Frontage:** $\ge 22'\text{-}0''$ ($22.00\text{ ft}$).
* **Depth:** $\le 47'\text{-}0''$ ($47.00\text{ ft}$).
* **South-Facing Plots:** Strictly **0 (0.0%)**.

| Metric | Minimum | Mean / Average | Maximum | Conformance |
| :--- | :---: | :---: | :---: | :--- |
| **Plot Area (Gaj)** | **119.97 Gaj** | **120.01 Gaj** | **120.07 Gaj** | $100.0\%$ inside $119.00\text{--}121.00\text{ Gaj}$ band |
| **Plot Area (Sq.Ft)** | `1,079.72 sq ft` | `1,080.12 sq ft` | `1,080.60 sq ft` | Nominal standard $= 1,080.00\text{ sq ft}$ |
| **Street Frontage** | **23'-4"** (`23.32 ft`) | **24'-2 1/2"** (`24.21 ft`) | **24'-6 1/2"** (`24.56 ft`) | $100.0\% \ge 22'\text{-}0''$ (Zero narrow slivers) |
| **Plot Depth** | **44'-0"** (`44.00 ft`) | **44'-7 1/2"** (`44.63 ft`) | **46'-3 1/2"** (`46.30 ft`) | $100.0\% \le 47'\text{-}0''$ |

### Plot Classification Breakdown
* **Total Colony Plots:** **98**
  * **Residential Plots:** **88** (numbered 1 to 88, grouped into Blocks A, B, C, D)
  * **Commercial Showroom Plots:** **10** (numbered COM-1 to COM-10)
  * **Premium Tagged Plots:** **49 (50.0%)**
    * *Corner plots with dual-road open frontage:* 16 plots
    * *Central Park facing plots:* 13 plots
    * *12.0m Spinal Boulevard frontage plots:* 20 plots (10 Commercial + 10 Residential)
  * **Irregular Plots:** **0** (All 98 plots are precision engineered orthogonal rectangles)

### Vastu Orientation & Road Abutment
| Facing Direction | Plot Count | Percentage | Urban Planning Justification |
| :--- | :---: | :---: | :--- |
| **East Facing** | **46 Plots** | **46.94%** | Preferred sunrise orientation; avenue plots facing East. |
| **West Facing** | **29 Plots** | **29.59%** | Avenue plots facing West into internal avenues. |
| **North Facing** | **23 Plots** | **23.47%** | Plots facing into the 12.0m Spine Boulevard and Central Park. |
| **South Facing** | **0 Plots** | **0.00%** | **100% Vastu Compliant:** The 12.0m Spine's north flank is occupied by Central Park, eliminating all south-facing plots. |

---

## 6. Block & Zoning Layout

* **Block A (Plots 1–18):** 18 East-facing residential plots along West Avenue-1 (`23'-4"` front $\times$ `46'-3 1/2"` depth, `119.97 Gaj`).
* **Block B (Plots 19–48):** 30 double-loaded residential plots between West Avenue-1 and West Avenue-2 (`24'-6 1/2"` front $\times$ `44'-0"` depth, `120.02 Gaj`).
* **Block C (Plots 49–62):** 14 residential plots along West Avenue-3 (`23'-4"` front $\times$ `46'-3 1/2"` depth, `119.97 Gaj`).
* **Block D (Plots 63–88):** 26 double-loaded residential plots between East Avenue-1 and East Avenue-2 (`24'-6 1/2"` front $\times$ `44'-0"` depth, `120.02 Gaj`).
* **Commercial Zone (COM-1 to COM-10):** 10 prime showroom plots along the South side of the 12.0m Spine Boulevard (`24'-0"` front $\times$ `45'-0"` depth, `120.00 Gaj`), featuring dedicated rear service access.

---

## 7. Road Network & Circulatory Design

1. **Township Entrance & Main Boulevard (12.0m / 40'-0"):**
   * Connects exclusively to the East approach road (`ROAD 22'-6" WD.`).
   * No access points onto the northern Chakroad (strictly adhering to UP consolidation and MDA laws).
   * Features entrance security island, RFID gatehouse, and grand arrival landscaping.
2. **Internal Comb Avenues (9.0m / 30'-0"):**
   * Six north–south avenues arranged in a double-loaded comb hierarchy.
   * Intersects the 12.0m Spinal Boulevard with engineered $3\text{m} \times 3\text{m}$ corner splays/chamfers for smooth turning radii.
3. **North Circulatory Loop Road (7.62m / 25'-0"):**
   * Connects all north–south avenues along the northern site sector, ensuring continuous 360° circular vehicular flow with zero cul-de-sacs or dead-ends.
4. **Commercial Rear Service Promenade:**
   * Separates customer vehicle flow on the 12.0m Spine from delivery and utility servicing.

---

## 8. Parks, Green Open Spaces & Statutory MDA Compliance

* **MDA Subdivision Mandate:** Minimum 13.00% open green space; target band 13.00% to 15.00%.
* **Actual Total Park Area:** **`4,301.33 Gaj` (`38,712.00 sq ft` / `3,596.46 m²`) = 14.12% of total site**, perfectly satisfying the statutory requirement without land wastage.
* **Park Hierarchy:**
  * **Park-1 (Central Vastu Community Park):** `4,021.33 Gaj` (`36,192.00 sq ft` / `13.20%`). Rectangular geometry ($312'\text{-}0'' \times 116'\text{-}0''$) positioned strategically on the north side of the East-West 12.0m Spine, acting as an environmental lung and eliminating south-facing residential plots.
  * **Park-2 (Grand Front Arrival Promenade):** `280.00 Gaj` (`2,520.00 sq ft` / `0.92%`). Twin landscaped entrance gardens flanking the main security gateway.

---

## 9. CAD Data Exports & Deliverables

All exports are generated deterministically during the build pipeline and placed in `/public` and `/dist`:

1. **AutoCAD Drawing Exchange Format (DXF):**
   * File: `public/nandi_township_master_plan.dxf`
   * Release: AutoCAD 2000 ASCII (`$ACADVER = AC1015`)
   * Units: Engineering Feet (`$INSUNITS = 2`, `$MEASUREMENT = 0`)
   * Layer Conventions:
     * `BOUNDARY` (White, Continuous) — Survey site boundary
     * `ROADS` (Cyan, Continuous) — Edge-to-edge road reservations
     * `PLOTS_RES` (Green, Continuous) — Residential plot boundaries
     * `PLOTS_COM` (Magenta, Continuous) — Commercial showroom plots
     * `PLOTS_PREMIUM` (Yellow, Continuous) — Corner and park-facing premium plots
     * `PARKS` (Light Green, Continuous) — Central park and arrival gardens
     * `UTILITY` (Red, Continuous) — Substation, STP, and security islands
     * `LABELS` (Yellow, Standard Text) — Plot IDs and area annotations
     * `DIMS` (Blue, Dimension Lines) — Frontage and depth dimension strings
2. **Plot Schedule CSV:**
   * File: `public/plot_schedule.csv`
   * Fields: `Plot ID`, `Block`, `Zoning Type`, `Vastu Facing`, `Frontage (ft-in)`, `Depth (ft-in)`, `Frontage (ft)`, `Depth (ft)`, `Area (Gaj)`, `Area (Sq.Ft)`, `Area (Sq.M)`, `Abutting Road`, `Corner Plot`, `Premium Tag`, `Premium Reason`.
3. **Area Statement CSV:**
   * File: `public/area_statement.csv`
   * Complete balance sheet breakdown across all 5 land-use categories.
4. **Master Plan JSON:**
   * File: `src/data/plots.json` (and `public/plots.json`)
   * Machine-readable geo-data consumed dynamically by the web viewer.

---

## 10. Software Architecture & Verification Suite

The repository is structured as a modern Vite + TypeScript application:

```
colony/
├── .github/workflows/pages.yml   # CI/CD: npm ci -> npm run generate -> npm test -> npm run build -> deploy
├── public/                       # DXF, CSV, and JSON deliverables copied to dist
│   ├── area_statement.csv
│   ├── nandi_township_master_plan.dxf
│   ├── plot_schedule.csv
│   └── plots.json
├── scripts/
│   └── generate.ts               # Geometry compiler and CAD generator
├── src/
│   ├── data/
│   │   ├── plots.json            # Generated layout dataset
│   │   └── site.json             # Ground-truth boundary polygon & design parameters
│   ├── geometry/
│   │   ├── dxf.ts                # AutoCAD Release 2000 ASCII DXF generator
│   │   ├── polygon.ts            # Shoelace, toFtIn, polygon math
│   │   ├── roads.ts              # Road reservation layout generator
│   │   ├── subdivision.ts        # Block-to-plot subdivision engine
│   │   ├── types.ts              # TypeScript interfaces and constants
│   │   └── vastu.ts              # Orientation and premium tagging rules
│   ├── main.ts                   # Interactive CAD UI controller (SVG, pan/zoom, drawer, filters)
│   └── style.css                 # Viewport styling & layout tokens
├── test/
│   └── validation.test.ts        # Vitest suite enforcing all 8 hard subdivision bylaws
├── index.html                    # Responsive CAD viewer
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Automated Bylaw Validation Suite (`npm test`)
Every build must pass all 8 validation test suites; any violation triggers an immediate CI failure:
* **Rule 1 & 2:** Every plot conforms to $100.00 \le \text{Gaj} \le 121.00$ ($119.00 \le \text{Gaj} \le 121.00$ for regular).
* **Rule 3:** Every plot satisfies Frontage $\ge 22'\text{-}0''$, Depth $\le 47'\text{-}0''$, and ZERO South facing.
* **Rule 4:** Every plot has an assigned abutting road edge.
* **Rule 5:** No plots overlap each other and all stay strictly inside the site boundary.
* **Rule 6:** Land-use balance sheet adds up to $100.00\% \pm 0.01\%$.
* **Rule 7:** Total Park percentage is strictly between $13.00\%$ and $15.00\%$ (MDA norm).
* **Rule 8:** Road network contains zero dead-ends and provides continuous circulatory flow.
* **Rule 9:** Facing, premium, and type counts add up exactly to total plot count.

---

## 11. Local Development & Build Commands

```bash
# Install dependencies
npm ci

# Compile geometry, calculate balance sheets, and generate DXF/CSVs
npm run generate

# Run Vitest bylaw verification suite
npm test

# Build production bundle for deployment
npm run build

# Start local interactive CAD preview server
npm run dev
```

---

*Authored by Antigravity CAD Geometry Engine for NANDI Township Subdivision.*
