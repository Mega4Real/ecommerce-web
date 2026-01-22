CSS Refactoring Implementation Plan
Goal Description
Consolidate duplicated CSS styles across text-heavy pages (ShippingReturns, PrivacyPolicy, TermsOfService, About) into shared classes in 
index.css
. This reduces code duplication and ensures consistent styling across the application.

User Review Required
NOTE

No functional changes. This is purely a code organization and maintenance task.

Proposed Changes
CSS Shared Styles
[MODIFY] 
index.css
Add .text-page, .text-header, .text-section classes.
Add .values-grid for the About page (generic grid for values/features).
Page Components
[MODIFY] 
ShippingReturns.jsx
Update to use new shared classes.
Remove import of 
ShippingReturns.css
.
[MODIFY] 
PrivacyPolicy.jsx
Update to use new shared classes.
Remove import of 
PrivacyPolicy.css
.
[MODIFY] 
TermsOfService.jsx
Update to use new shared classes.
Remove import of 
TermsOfService.css
.
[MODIFY] 
About.jsx
Update to use new shared classes.
Remove import of 
About.css
 (or keep minimal if specific styles remain).
CSS Files Removal
[DELETE] 
ShippingReturns.css
[DELETE] 
PrivacyPolicy.css
[DELETE] 
TermsOfService.css
[DELETE] 
About.css
Verification Plan
Manual Verification
Visual Check: Open the application locally and navigate to:
/shipping-returns
/privacy-policy
/terms-of-service
/about
Verify: ensure the layout, typography, and spacing remain identical to the previous design. Check mobile responsiveness (padding changes).