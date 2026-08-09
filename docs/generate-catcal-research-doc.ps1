$ErrorActionPreference = "Stop"
$outPath = Join-Path $PSScriptRoot "CatCal_System_Features_Research.docx"

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()
$sel = $word.Selection

function Add-Title($text) {
    $sel.Style = "Title"
    $sel.TypeText($text)
    $sel.TypeParagraph()
}

function Add-H1($text) {
    $sel.Style = "Heading 1"
    $sel.TypeText($text)
    $sel.TypeParagraph()
}

function Add-H2($text) {
    $sel.Style = "Heading 2"
    $sel.TypeText($text)
    $sel.TypeParagraph()
}

function Add-H3($text) {
    $sel.Style = "Heading 3"
    $sel.TypeText($text)
    $sel.TypeParagraph()
}

function Add-P($text) {
    $sel.Style = "Normal"
    $sel.TypeText($text)
    $sel.TypeParagraph()
}

function Add-Bullet($text) {
    $sel.Style = "Normal"
    $sel.Range.ListFormat.ApplyBulletDefault()
    $sel.TypeText($text)
    $sel.TypeParagraph()
    $sel.Range.ListFormat.RemoveNumbers()
}

Add-Title "CatCal - Cat Feeding System"
Add-P "Complete System Features (Research Reference)"
Add-P "Document generated for academic / capstone research use."
Add-P ""

Add-H1 "1. System Overview"
Add-P "CatCal is a mobile cat feeding and nutrition management system. It helps cat owners calculate daily calories, plan meal portions, log feedings, track weight, and open cat profiles via QR codes on collar tags."
Add-P ""
Add-P "Technology Stack:"
Add-Bullet "Mobile App: Expo 54, React Native, React 19, expo-router, NativeWind (Tailwind CSS)"
Add-Bullet "Backend API: Node.js, Express 4, Prisma ORM, Zod validation"
Add-Bullet "Database: PostgreSQL (Supabase cloud hosting)"
Add-Bullet "Authentication: JWT (Bearer tokens), bcrypt password hashing"
Add-Bullet "Build and Deployment: EAS Build (APK/AAB), Supabase SQL scripts"
Add-P ""
Add-P "Architecture: The mobile app communicates with a custom REST API. The database is hosted on Supabase PostgreSQL. Authentication is handled by the backend server."

Add-H1 "2. Mobile Application Features"

Add-H2 "2.1 Authentication and Account Management"
Add-Bullet "User registration (full name, email, password)"
Add-Bullet "Login and logout"
Add-Bullet "Session restore on app launch (token stored in AsyncStorage)"
Add-Bullet "Forgot password with 6-digit email verification code"
Add-Bullet "Reset password with code verification"
Add-Bullet "Terms of Service and Privacy Policy screens"
Add-Bullet "Legal consent on sign-up"

Add-H2 "2.2 Main Navigation (Four Tabs)"
Add-Bullet "Home - Dashboard for active cat: daily meals, calories left, quick actions"
Add-Bullet "Cats - List all cats, set active cat, add new cat"
Add-Bullet "Scan QR - Open camera to scan collar QR codes"
Add-Bullet "Profile - Account info, appearance, feeding times, reminders, sign out"

Add-H2 "2.3 Cat Management"
Add-Bullet "Register multiple cats per account"
Add-Bullet "Cat profile: name, photo, birth date, weight (kg/lbs), sex, activity level, health condition, food brand"
Add-Bullet "Photo capture from camera or gallery"
Add-Bullet "Edit cat profile"
Add-Bullet "Delete cat"
Add-Bullet "Set one active cat for the dashboard"
Add-Bullet "Guest/offline mode with local demo data when not signed in"

Add-H2 "2.4 Nutrition and Feeding"
Add-Bullet "Automatic calorie plan using veterinary-style formulas (RER/MER)"
Add-Bullet "Daily kcal, grams per day, grams and kcal per meal"
Add-Bullet "Portions split by number of user-defined meal times"
Add-Bullet "Custom feeding schedule (add/remove meals, up to 6 per day)"
Add-Bullet "Default schedule: Morning 8:00 AM, Evening 6:30 PM (Philippines timezone)"
Add-Bullet "Mark as fed with optional custom feeding time"
Add-Bullet "Daily feeding status (meals done / total, kcal remaining)"
Add-Bullet "Feeding history log"
Add-Bullet "Nutrition plan detail screen with breakdown"
Add-Bullet "Weight history (registration, profile updates, manual logs)"
Add-Bullet "Weight progress with trend (up/down/stable)"

Add-H2 "2.5 QR Code System"
Add-Bullet "Unique QR code per cat on registration (catcal://cat/{id})"
Add-Bullet "Display QR on screen"
Add-Bullet "Share QR via device share sheet"
Add-Bullet "Save QR to photo gallery for printing on collar tags"
Add-Bullet "Full-screen camera QR scanner"
Add-Bullet "Scan resolves cat and opens profile"
Add-Bullet "Invalid QR error handling"

Add-H2 "2.6 Profile and Settings"
Add-Bullet "Display registered full name"
Add-Bullet "Member since date and cat count"
Add-Bullet "Theme: Light / Dark / System"
Add-Bullet "Feeding times: edit labels and times, add/remove meal slots"
Add-Bullet "Feeding reminders toggle (preference stored)"
Add-Bullet "Privacy policy link"
Add-Bullet "Sign out"

Add-H2 "2.7 User Interface and User Experience"
Add-Bullet "Animated splash screen"
Add-Bullet "Loading overlays on async actions (login, sign-up, save cat, log meal)"
Add-Bullet "Full-screen sync loading while fetching user data"
Add-Bullet "Glass-style cards and blur tab bar"
Add-Bullet "Responsive layout for phones and tablets"
Add-Bullet "Philippines timezone greetings (Good morning, {name})"
Add-Bullet "Keyboard-aware forms"
Add-Bullet "Safe area support for notched devices"
Add-Bullet "Accessibility labels"
Add-Bullet "How-it-works guides on key screens"

Add-H1 "3. Backend API Features"
Add-P "The REST API exposes 31+ operations organized as follows:"
Add-P ""
Add-H2 "3.1 Health Endpoints"
Add-Bullet "GET /health - API service status"
Add-Bullet "GET /health/db - Database connectivity check"

Add-H2 "3.2 Authentication (/api/auth)"
Add-Bullet "Register, login, logout"
Add-Bullet "Forgot password, reset password"
Add-Bullet "Get current user profile"

Add-H2 "3.3 User and Settings"
Add-Bullet "Profile: get/update full name, email, password"
Add-Bullet "Settings: get/set active cat ID"
Add-Bullet "Notification settings: reminders, notify-before minutes, push flag"
Add-Bullet "Feeding schedules: CRUD for user meal time slots"

Add-H2 "3.4 Cats and Nutrition"
Add-Bullet "CRUD operations for cats"
Add-Bullet "Resolve QR payload to cat"
Add-Bullet "Calculate calories (live computation)"
Add-Bullet "Get/save nutrition plan"
Add-Bullet "Upcoming feeding and daily feeding status"
Add-Bullet "Feeding logs: list and mark as fed"
Add-Bullet "Weight logs: list and add entries"
Add-Bullet "Weight progress analytics"

Add-H2 "3.5 Dashboard and Sync"
Add-Bullet "Dashboard summary (active cat, plan, today status, cat count)"
Add-Bullet "Recent activity (feeding + weight events)"
Add-Bullet "Full mobile sync payload for authenticated users"
Add-Bullet "Food brands list with kcal per 100g"

Add-H1 "4. Database Design (9 Core Tables)"
Add-Bullet "User - Account credentials"
Add-Bullet "Profile - Full name, active cat reference"
Add-Bullet "NotificationSettings - Reminder preferences"
Add-Bullet "FeedingSchedule - User meal times"
Add-Bullet "FoodBrand - Food catalog with kcal per 100g"
Add-Bullet "Cat - Cat profiles and QR code"
Add-Bullet "CatNutritionPlan - Versioned calorie and portion plans"
Add-Bullet "FeedingLog - Meal records"
Add-Bullet "WeightLog - Weight history"
Add-Bullet "PasswordResetToken - Hashed reset codes (15-minute expiry)"
Add-P ""
Add-P "Relationships: One user has many cats. One cat has many feeding logs, weight logs, and nutrition plans. Each cat is linked to a food brand. Profile stores optional active cat ID."

Add-H1 "5. Nutrition Calculation Logic"
Add-P "RER (Resting Energy Requirement): RER = 70 × weight(kg)^0.75"
Add-P "Daily Calories (MER): Daily kcal = RER × activity factor × health factor"
Add-P ""
Add-P "Activity Factors: Sedentary 1.2, Lightly Active 1.4, Moderately Active 1.6, Very Active 1.8"
Add-P "Health Factors: Healthy 1.0, Overweight 0.85, Underweight 1.15, Senior 1.1, Kitten 2.0"
Add-P ""
Add-P "Portions: Grams/day = (daily kcal / kcal per 100g) × 100. Grams/meal and kcal/meal = daily values divided by number of meal slots."
Add-P ""
Add-P "Plans are recalculated when weight or profile changes. Previous plans are versioned using an isCurrent flag."

Add-H1 "6. Security Features"
Add-Bullet "Passwords hashed with bcrypt (cost factor 12)"
Add-Bullet "JWT tokens with 30-day expiry"
Add-Bullet "Protected API routes require Bearer token"
Add-Bullet "Users can only access their own cats and data"
Add-Bullet "Password change requires current password verification"
Add-Bullet "Reset codes hashed in database, 15-minute expiry"
Add-Bullet "Optional email delivery via Resend API"
Add-Bullet "CORS configuration and request body size limit (2MB)"
Add-Bullet "Input validation with Zod schemas"

Add-H1 "7. Deployment and Infrastructure"
Add-Bullet "Mobile: EAS Build profiles (development, preview APK, production AAB)"
Add-Bullet "Backend: Express server on configurable port"
Add-Bullet "Database: Supabase PostgreSQL with supabase_complete.sql setup script"
Add-Bullet "31 SQL query scripts mirroring API operations"
Add-Bullet "Supabase storage bucket prepared for cat photos"
Add-Bullet "Deep linking via catcal:// URL scheme"

Add-H1 "8. Research Feature Summary (Numbered List)"
$i = 1
$features = @(
    "Multi-user account system with secure authentication",
    "Multi-cat profile management with photos and demographics",
    "Automated calorie requirement calculation (RER/MER-based)",
    "Personalized meal portion recommendations (grams and kcal per meal)",
    "Configurable daily feeding schedule (1 to 6 meals)",
    "Meal logging with timestamp and historical records",
    "Daily feeding progress tracking (meals completed, calories remaining)",
    "Weight monitoring with trend analysis",
    "QR code generation for each registered cat",
    "QR code scanning for quick profile access",
    "QR export (share and save to gallery)",
    "Dashboard with active cat summary and recent activity",
    "Light, dark, and system theme support",
    "Offline guest mode with local persistence",
    "Cloud sync for authenticated users",
    "Password recovery via email verification code",
    "Notification preference storage for feeding reminders",
    "RESTful API with 31+ documented database operations",
    "Relational database with 9 normalized tables",
    "Cross-platform mobile deployment (Android APK via EAS)",
    "Philippines timezone support for greetings and meal times",
    "Responsive UI for phones and tablets",
    "Loading and feedback UX for slow network operations",
    "Legal compliance screens (Terms of Service, Privacy Policy)",
    "Food brand database with caloric density values"
)
foreach ($f in $features) {
    Add-P "$i. $f"
    $i++
}

Add-H1 "9. System Limitations (Research Scope)"
Add-Bullet "No automatic physical feeder or IoT device integration"
Add-Bullet "No RFID - QR code only"
Add-Bullet "No AI image recognition for cats"
Add-Bullet "Push notifications preference stored but delivery not fully implemented"
Add-Bullet "Calorie estimates are informational, not a substitute for veterinary advice"
Add-Bullet "Cat photos stored locally; cloud upload prepared but not fully wired"

Add-P ""
Add-P "- End of Document -"

$saveFormat = 16
$doc.SaveAs2($outPath, $saveFormat)
$doc.Close()
$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null

Write-Output "Created: $outPath"
