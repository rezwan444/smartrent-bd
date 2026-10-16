# SmartRent BD — Project Context & Rebranding Instructions

You are working on **SmartRent BD**, a student-focused rental housing and roommate-matching platform for Bangladesh.

The current repository was created by duplicating an older project. Some existing text, branding, metadata, labels, descriptions, and other project-related content may still belong to the previous project.

Your task is to inspect the existing codebase and update the outdated content so that the entire project consistently represents SmartRent BD.

## 1. Project Identity

- **Project Name:** SmartRent BD
- **Brand Name:** SmartRent BD
- **Project Type:** Student rental housing marketplace and roommate-matching platform
- **Target Audience:** University students and other people looking for affordable accommodation in Bangladesh, as well as property owners.
- **Primary Market:** Bangladesh
- **Primary Language:** English for the initial interface, unless the existing product requirements specify otherwise.
- **Currency:** Bangladeshi Taka (BDT), displayed as ৳.
- **Tagline:** Find Your Place. Feel at Home.

## 2. Project Purpose

SmartRent BD helps users discover suitable rental accommodation and find compatible roommates.

The platform is intended to support:

1. Property listings for rooms, flats, messes, and hostels.
2. Search and filtering by location, budget, property type, facilities, and availability.
3. Property-owner and listing verification.
4. Roommate profiles and lifestyle preferences.
5. Explainable roommate compatibility scores.
6. Mutual-consent-based contact sharing.
7. Property visit and booking requests.
8. Reviews from verified tenants.
9. Scam reporting and temporary hiding of listings under review.
10. Shared rent, utility, and mess expense splitting.
11. Maintenance requests and saved-search alerts.

These are the intended product requirements. Do not claim that any feature is implemented or operational unless the existing code actually supports it.

## 3. Brand Colors

Use the following established color palette consistently wherever the existing design supports it.

- Forest Green: `#24483D` — primary brand color and primary actions.
- Terracotta: `#B66A43` — restrained accent color.
- Muted Sage: `#DDE8DF` — secondary surfaces and selected states.
- Warm White: `#FAF9F6` — main background.
- Charcoal: `#252923` — headings and body text.
- Border Gray: `#E5E5DF` — borders and dividers.

Do not introduce a completely different color scheme. Preserve existing component styling unless a change is necessary to remove outdated branding or align with the established palette.

## 4. Typography and Visual Identity

- Primary font: Inter.
- Heading font: Manrope.
- Brand icon concept: a simple house combined with a location pin.
- The logo must not contain leaves or unrelated decorative symbols.
- Keep the visual identity professional, practical, trustworthy, and appropriate for a real rental marketplace.
- Avoid generic AI-generated landing-page patterns, excessive gradients, unnecessary animations, and decorative elements that do not serve a purpose.

Do not recreate or replace the logo if a finalized logo asset already exists in the repository.

## 5. What You Must Inspect and Update

Inspect the existing repository for outdated project-specific content, including:

- Page titles and headings.
- Navigation labels and menu items.
- Homepage hero text and descriptions.
- Buttons, links, calls to action, and form labels.
- Placeholder text and empty states.
- Authentication page titles, descriptions, and messages.
- Dashboard labels and page descriptions.
- Loading, error, success, and validation messages.
- Footer text and copyright notices.
- Metadata, SEO titles, meta descriptions, Open Graph metadata, and page descriptions.
- `package.json` project name, where appropriate.
- README and project documentation.
- Manifest, favicon references, application name, and theme color.
- Existing hardcoded references to the previous project.
- Sample content and mock data that clearly belong to the previous product.

Update these items only when they are relevant to the previous branding or the SmartRent BD identity.

## 6. Writing Style

All user-facing text should be natural, concise, professional, and easy to understand.

Prefer practical language that helps users find accommodation and complete tasks.

Examples:

- "Find a room that fits your budget."
- "Explore available rooms and shared flats."
- "List your property."
- "Request a visit."
- "Compare roommate preferences."
- "Manage shared expenses."

Do not use exaggerated marketing claims, fake testimonials, fabricated statistics, or claims of verified properties without supporting data.

Do not invent property listings, user reviews, verification results, or platform capabilities and present them as real.

## 7. Important Technical Constraints

- The project uses Next.js with the App Router and TypeScript.
- TypeScript is mandatory throughout the application.
- Preserve the existing framework, architecture, dependencies, and working functionality.
- Do not convert TypeScript files to JavaScript.
- Do not rewrite the application or introduce a new architecture.
- Do not install new dependencies unless absolutely necessary for the requested content updates.
- Do not implement missing product features as part of this task.
- Do not change database schemas, authentication logic, API behavior, or business logic merely to update branding.
- Never expose or modify secret values in environment files.
- Preserve `.env.local` and other private configuration files.
- Do not remove working code just because its purpose is not immediately obvious.

## 8. Execution Instructions

1. Inspect the repository and identify the previous project's name and outdated content.
2. Make a concise list of the content that needs updating.
3. Update the relevant files directly, keeping changes limited to rebranding and project-related text.
4. Preserve the current layout and functionality wherever possible.
5. Run the existing lint, type-check, or build scripts if available.
6. Report which files were changed, what was updated, and whether any checks failed.
7. Do not claim success for checks that you did not actually run.

**Primary objective:** Make the existing repository consistently identify itself as SmartRent BD without unnecessarily changing its architecture, functionality, or design.

Start by inspecting the current codebase, then make the required changes. Do not stop after producing recommendations; perform the updates directly.
