# MDA Colony Master Plan — 12.0m Boulevard Vastu Layout

Interactive CAD Master Plan Explorer for a **26,274.03 m² (38.45 Bighas / 31,412.06 Gaj)** residential township adhering strictly to Meerut Development Authority (MDA) subdivision norms.

---

## Architectural Fixes & Key Highlights

1. **Continuous Unbroken 1E–18E Belt (Zero Empty Spaces):**
   * **Belt 1 (Plots 1E to 18E):** Runs continuously and unbroken along the western boundary wall from `y = 8.0` all the way down to `y = 412.46` (the southern boundary).
   * **No Empty Spaces:** The 40'-0" gap previously left between 12E and 13E is completely filled with residential plots.
   * **Direct Road Access:** Every single plot from 1E to 18E opens directly **East (→)** onto the 30'-0" wide West Avenue-1.
   * **Boulevard T-Junction:** Plots 12E and 13E sit right at the grand T-junction of the 12.0m Main Boulevard and West Avenue-1.

2. **Single 12.0m (40'-0") Boulevard Corridor:**
   * Runs straight and uninterrupted from the **East Entrance Gate Flare (`x = 935`)** across the colony and terminates at **West Avenue-1 (`x = 47`)** in an engineered T-junction.
   * Does not punch a dead-end hole into the western boundary wall.
   * Plots North of the road (`y = 8 to 258`) and Plots South of the road (`y = 298 to 412.46`) are separated by the clear 40'-0" roadway corridor with **zero plot overlap**.

3. **Bottom-Left Corner Void Completely Eliminated:**
   * West Wing columns (Belt 1: Plots 1–18, Belt 2: Plots 19–35, Belt 3: Plots 36–52) extend continuously down to the south boundary wall (`y = 412.46`), eliminating all empty dark corners.

4. **100% Comprehensive Click Inspector:**
   * **Click ANY Plot:** Displays plot number, Vastu orientation, exact dimensions in feet/inches and meters (`nominalSizeFt` & `nominalSizeM`), area in Gaj / Sq.Ft / m², setbacks, and abutting road width.
   * **Click ANY Road:** Displays road classification (12.0m Boulevard, 9.0m Comb Roads), exact length, width, total area in Sq.Ft/Gaj/SQM, and engineering role.
   * **Click ANY Park or Utility:** Displays exact dimensions, area share, and community amenities.

5. **0% South-Facing Plots (100% Vastu Compliant):**
   * 83 East-Facing (→)
   * 65 West-Facing (←)
   * 12 North-Facing (↑)
   * **0 South-Facing Plots (0.0%)** (160 total residential plots).

6. **Exact 13.00% Parks & Green Space (3,805.62 m²):**
   * Strictly meets the mandatory **13% to 15%** MDA quota:
     * **Central Vastu Community Park (Park-1):** 3,155.62 m² (10.78%) — positioned North of the 12m Boulevard.
     * **North Buffer Park (Park-2):** 650.00 m² (2.22%).

7. **Clean, Distraction-Free UI Optimized for Mobile:**
   * Multi-touch pinch-to-zoom and pan.
   * Smooth bottom-sheet inspector drawer for mobile devices.
   * Clean status chips and instant plot search.

---

## Land-Use Breakdown Table

| Land Use Category | Area (SQ.M) | Area (Gaj) | Bighas | % Share |
| :--- | :---: | :---: | :---: | :---: |
| **1. Net Saleable Residential Plotted Area (160 Plots)** | 20,063.50 | 23,995.73 | 26.35 | **68.54%** |
| **2. Parks & Green Space (Park-1 Central + Park-2 Buffer)** | 3,805.62 | 4,551.49 | 5.00 | **13.00%** |
| **3. Roads (12.0m Main Boulevard + 9.0m Comb Roads)** | 4,813.57 | 5,757.06 | 6.32 | **16.44%** |
| **4. Shopping Arcade (10 Units) & Utilities (STP/Guard)** | 591.34 | 707.16 | 0.78 | **2.02%** |
| **TOTAL SITE AREA** | **26,274.03** | **31,412.06** | **38.45** | **100.00%** |

---

## File Structure

- `index.html`: Production responsive interactive CAD master plan viewer.
- `mda_colony_master_plan_cad_explorer.html`: Mirror standalone CAD file.
- `README.md`: Architectural documentation and land-use balance sheet.
- `.github/workflows/pages.yml`: Automated CI/CD deployment to GitHub Pages.
- `IMG_0082.jpg`, `IMG_0083.jpg`, `IMG_0085.jpg`: Site boundary blueprints & architect reference drawings.
