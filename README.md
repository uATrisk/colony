# MDA Colony Master Plan — 12.0m Boulevard Vastu Layout

Interactive CAD Master Plan Explorer for a **29,274.03 m² (38.45 Bighas / 35,011.44 Gaj)** residential township adhering strictly to Meerut Development Authority (MDA) subdivision norms.

---

## Architectural Fixes & Key Highlights

1. **Single 12.0m (40'-0") Boulevard Corridor (From Entry to End):**
   - The primary **12.0m (40'-0") Main Spine Road** runs uninterrupted from the **East Entrance Gate (`x = 935`)** across the entire colony to the **West Boundary Wall (`x = 0`)**.
   - Redundant 30' connector roads have been eliminated to minimize road wastage and maximize planned plot yield.
   - Plots North of the road (`y = 8 to 258`) and Plots South of the road (`y = 298 to 412.46`) are cleanly separated with **zero plot overlap**.

2. **Complete 1E–18E Belt Retained Along West Boundary:**
   - Col-W1 (North: Plots 1–12; South: Plots 13–17) is fully preserved along the western boundary wall.
   - All plots directly face East onto the 30'-0" West Avenue-1 with unobstructed vehicular access.

3. **Bottom-Left Corner Void Completely Eliminated:**
   - The west wing columns (Col-W1, Col-W2, Col-W3) now extend continuously down to the south boundary wall (`y = 412.46`), cleanly utilizing all available land without any awkward dead spaces or black voids.

4. **100% Comprehensive Click Inspector:**
   - **Click ANY Plot:** Displays plot number, Vastu orientation, exact dimensions in feet/inches and meters (`nominalSizeFt` & `nominalSizeM`), area in Gaj / Sq.Ft / m², setbacks, and abutting road width.
   - **Click ANY Road:** Displays road classification (12.0m Boulevard, 9.0m Comb Roads), exact length, width, total area in Sq.Ft/Gaj/SQM, and engineering role.
   - **Click ANY Park or Utility:** Displays exact dimensions, area share, and community amenities.

5. **0% South-Facing Plots (100% Vastu Compliant):**
   - 82 East-Facing (→)
   - 65 West-Facing (←)
   - 12 North-Facing (↑)
   - **0 South-Facing Plots (0.0%)** (159 total residential plots).

6. **Exact 13.00% Parks & Green Space (3,805.62 m²):**
   - Strictly meets the mandatory **13% to 15%** MDA quota:
     - **Central Vastu Community Park (Park-1):** 3,155.62 m² (10.78%) — positioned North of the 12m Boulevard.
     - **North Buffer Park (Park-2):** 650.00 m² (2.22%).

7. **Clean, Distraction-Free UI Optimized for Mobile:**
   - Stripped away unnecessary features and decorative clutter.
   - Touch-friendly pinch-to-zoom and pan.
   - Smooth bottom-sheet inspector drawer for mobile devices.
   - Clean status chips and instant plot search.

---

## Land-Use Breakdown Table

| Land Use Category | Area (SQ.M) | Area (Gaj) | Bighas | % Share |
| :--- | :---: | :---: | :---: | :---: |
| **1. Net Saleable Residential Plotted Area (159 Plots)** | 19,943.50 | 23,852.21 | 26.19 | **68.13%** |
| **2. Parks & Green Space (Park-1 Central + Park-2 Buffer)** | 3,805.62 | 4,551.49 | 5.00 | **13.00%** |
| **3. Roads (12.0m Main Boulevard + 9.0m Comb Roads)** | 4,933.57 | 5,900.58 | 6.48 | **16.85%** |
| **4. Shopping Arcade (10 Units) & Utilities (STP/Guard)** | 591.34 | 707.16 | 0.78 | **2.02%** |
| **TOTAL SITE AREA** | **29,274.03** | **35,011.44** | **38.45** | **100.00%** |

---

## File Structure

- `index.html`: Production responsive interactive CAD master plan viewer.
- `mda_colony_master_plan_cad_explorer.html`: Mirror standalone CAD file.
- `README.md`: Architectural documentation and land-use balance sheet.
