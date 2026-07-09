# Original User Request

## Initial Request — 2026-07-09T22:14:35+05:30

Fix all frontend bugs, remove stale hardcoded data, and add missing features to the Wanna Watch movie recommender app. Keep output minimal and concise.

Working directory: D:\PROJECTS 2026\movie-recommender
Integrity mode: demo

## Requirements

### R1. Fix Search Bar Spell-Check Bug
The header search bar has browser spell-check overlays (e.g., suggesting "bustards'" over the search input). Update the search input component to disable spellcheck and autocomplete.

### R2. Fix "Trending This Week" Section
The "Trending This Week" section on the Home page is currently empty. It must correctly fetch and display the trending movie list. The "See more" link must also be functional or removed if unnecessary.

### R3. Update Footer Stats
The footer currently displays "4,800 ML Brain Movies". Update this text to read "800K+ Movies in ML Brain" to match the new dynamic engine coverage. Also ensure there are no redundant data fetching calls on the homepage.

## Verification Resources
Since these are frontend UI fixes, the verifying agent should use a programmatic check (reading the source code to ensure `spellCheck={false}` is present, `4,800` is replaced, and the `Trending` component is wired up to a state variable or data source) or use a browser tool to verify rendering. 

## Acceptance Criteria

### Bug Fixes
- [ ] The header search input element includes `spellCheck={false}` and `autoComplete="off"`.
- [ ] The "Trending This Week" section on the Home page successfully renders a list of movie items (the mapped array is not empty).
- [ ] The footer component no longer contains the text "4,800 ML Brain Movies" and instead reads "800K+ Movies in ML Brain".
- [ ] No new third-party libraries are installed to accomplish these fixes (restricted per integrity mode).
