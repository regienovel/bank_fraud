# Banking Transaction Fraud Detection Demo — Claude.md

## Project Overview

Build a visually stunning, interactive web demo that simulates **AI-powered banking fraud detection** — inspired by Mastercard's Decision Intelligence system — tailored to **Ghana's financial landscape**. This is a live webinar demo for financial services professionals. It must look premium, feel real, and demonstrate the power of AI fraud detection convincingly.

**Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts  
**Deployment:** Vercel  
**No backend required** — all data is generated client-side with realistic simulation logic

---

## Design System

### Visual Identity
- **Theme:** Dark premium financial dashboard — navy/charcoal base with gold and teal accents
- **Primary background:** `#0B1120` (deep navy)
- **Secondary background:** `#131D33` (card surfaces)
- **Card backgrounds:** `#1A2744` with subtle border `#2A3A5A`
- **Gold accent:** `#D4A843` (highlights, important metrics, warnings)
- **Teal accent:** `#0EA5A0` (safe/approved states, positive indicators)
- **Red/coral accent:** `#EF4444` (fraud alerts, high risk)
- **Amber accent:** `#F59E0B` (medium risk, warnings)
- **Green accent:** `#10B981` (approved, low risk)
- **Text primary:** `#F1F5F9` (white-ish)
- **Text secondary:** `#94A3B8` (muted)
- **Text tertiary:** `#64748B` (hints)

### Typography
- Use a clean sans-serif font stack: `"Inter", "SF Pro Display", system-ui, sans-serif`
- Import Inter from Google Fonts (weights: 400, 500, 600, 700)
- Large stat numbers: 48-72px, font-weight 700
- Section headers: 20-24px, font-weight 600
- Body: 14-16px, font-weight 400
- Captions/labels: 11-12px, font-weight 500, uppercase tracking-wider for labels

### Animations
- Use Framer Motion throughout
- Staggered card reveals on load (0.1s delay between cards)
- Number counters that animate up on mount (count-up effect)
- Transactions should stream in with a slide-in-from-right animation
- Risk score bars should animate their width on render
- Pulse animation on new fraud alerts
- Smooth tab/view transitions

### Layout
- Full viewport height dashboard layout
- Responsive: works on 1920px presenter screen and 768px tablet
- Left sidebar (collapsible) with navigation
- Main content area with grid-based card layout
- Generous padding and spacing — this is a PRESENTATION tool, not a cramped dashboard

---

## Application Structure

### Page 1: Live Transaction Monitor (Default View)

The hero view. A real-time transaction feed showing AI scoring every transaction as it arrives.

#### Top Stats Bar (4 cards in a row)
Animated counters showing:
1. **Total Transactions Processed** — starts at 0, counts up as transactions stream in (e.g., "1,247")
2. **Fraud Detected** — count of flagged transactions with red pulse indicator (e.g., "23")
3. **Detection Rate** — percentage with animated ring chart (e.g., "97.3%")
4. **False Positive Rate** — percentage, should be low (e.g., "2.1%")

#### Transaction Feed (Main Area — Left 65%)
A live-scrolling feed of transactions that auto-populates every 0.8-1.5 seconds (randomised interval). Each transaction card shows:

- **Transaction ID** — e.g., `TXN-GH-2026-00847`
- **Timestamp** — realistic Ghana time (WAT/GMT), e.g., "27 Mar 2026, 11:23:47 AM"
- **Sender name** — realistic Ghanaian names (see data section)
- **Receiver/Merchant** — Ghanaian business names or merchant categories
- **Amount** — in GH₵, realistic ranges
- **Transaction type** — Card Payment, Bank Transfer, ATM Withdrawal, Online Purchase, POS Terminal
- **Channel** — Visa Debit, Mastercard, GhIPSS Instant Pay, Mobile Banking App
- **Location** — Ghanaian cities/towns with specific areas (e.g., "Osu, Accra")
- **AI Risk Score** — 0-100 displayed as a colored bar:
  - 0-25: Green (low risk) — `#10B981`
  - 26-50: Teal (normal) — `#0EA5A0`
  - 51-75: Amber (medium risk, review) — `#F59E0B`
  - 76-100: Red (high risk, flagged) — `#EF4444`
- **AI Decision** — badge: "APPROVED" (green), "REVIEW" (amber), "BLOCKED" (red)
- **Risk factors** — when score > 50, show expandable tags like "Velocity spike", "Geo-anomaly", "Unusual amount", "Device mismatch", "Off-hours activity"

Visual treatment:
- Low risk transactions: subtle card with thin left border (green)
- Medium risk: slightly highlighted card with amber left border + subtle amber glow
- High risk: prominent card with red left border + red pulse glow + alert icon
- New transactions slide in from the right with a brief highlight animation
- User can click any transaction to expand and see the full AI analysis

#### AI Analysis Panel (Right 35%)
When a flagged transaction is selected (or auto-selected), show:

1. **Risk Score Breakdown** — horizontal stacked bar showing contribution of each factor:
   - Transaction velocity: X%
   - Geographic anomaly: X%
   - Amount deviation: X%
   - Time-of-day risk: X%
   - Merchant category risk: X%
   - Device/channel risk: X%
   
2. **Decision Explanation** — natural language: "This transaction was flagged because the card was used in Kumasi at 2:14 PM, but a previous transaction occurred in Accra at 2:02 PM — a distance of 248km in 12 minutes, which is physically impossible."

3. **Transaction History Mini-Map** — a small visual showing the last 5 transactions for this account on a simplified Ghana map (dots connected by lines), highlighting the geographic anomaly

4. **Similar Fraud Patterns** — "This matches Pattern #7: Rapid geo-switching" with a match confidence percentage

5. **AI Confidence** — circular gauge showing model confidence (e.g., 94.7%)

### Page 2: Analytics Dashboard

Overview analytics with beautiful charts.

#### Row 1: Key Metrics (4 cards)
- **Total Value Screened** — GH₵ amount with trend arrow
- **Fraud Value Prevented** — GH₵ amount saved
- **Average Processing Time** — milliseconds (e.g., "47ms")
- **AI vs Rule-Based Comparison** — "3.2x more fraud caught"

#### Row 2: Charts (2 columns)
**Left — Fraud by Type (Donut Chart)**
- Card-not-present fraud: 34%
- Account takeover: 22%
- Synthetic identity: 18%
- SIM swap related: 14%
- Counterfeit card: 8%
- Other: 4%

**Right — Fraud by Time of Day (Area Chart)**
- X-axis: 12AM to 11PM
- Show clear spikes at unusual hours (2-5 AM) with annotation
- Overlay: normal transaction volume in teal, fraud attempts in red

#### Row 3: Geographic Heatmap
- Simplified map of Ghana showing fraud concentration by region
- Accra/Tema: highest concentration (expected — highest transaction volume)
- Kumasi: moderate
- Tamale, Cape Coast, Takoradi: lower
- Use a dot/bubble overlay, not a filled choropleth
- Hoverable regions showing stats

#### Row 4: AI vs Rule-Based Comparison
Side-by-side visual comparison:

| Metric | Rule-Based | AI Model |
|--------|-----------|----------|
| Fraud detected | 127 | 389 |
| False positives | 1,247 | 312 |
| Detection rate | 38% | 97.3% |
| Avg response time | 2.3s | 47ms |
| Novel fraud caught | 0 | 43 |

Animate the bars growing to show the dramatic difference. This is a KEY conversion slide for the webinar.

### Page 3: Fraud Investigation Detail

When a user clicks "Investigate" on any flagged transaction, show a detailed investigation view:

1. **Account Profile** — account holder info, account age, typical behaviour patterns
2. **Transaction Timeline** — vertical timeline of last 20 transactions, with the flagged one highlighted
3. **Behavioural Deviation Chart** — spider/radar chart showing:
   - Typical spend amount vs this transaction
   - Typical time of day vs this transaction
   - Typical merchant category vs this
   - Typical location vs this
   - Typical device vs this
4. **Network Analysis** — simple node graph showing connections between the flagged account and known fraud rings (simulated)
5. **AI Recommendation** — "Block and investigate" / "Request additional verification" / "Monitor closely" with confidence score

---

## Data Generation — Ghana-Specific Realism

### Ghanaian Names (use combinations of these)

**First Names (Male):**
Kwame, Kofi, Kwesi, Yaw, Kwadwo, Kwabena, Akwasi, Nana, Kojo, Fiifi, Papa, Ebo, Edem, Selorm, Delali, Senyo, Bright, Emmanuel, Samuel, Daniel, Isaac, Joseph, Michael, Richard, Francis, Bernard, Augustine, Felix, Raymond, Stephen

**First Names (Female):**
Ama, Akua, Abena, Yaa, Adwoa, Afia, Esi, Efua, Akosua, Araba, Naana, Adjoa, Serwa, Maame, Comfort, Grace, Felicia, Patience, Gifty, Mercy, Joyce, Linda, Sarah, Rebecca, Priscilla, Agnes, Cecilia, Lydia, Vida, Millicent

**Last Names:**
Mensah, Asante, Boateng, Owusu, Agyemang, Osei, Amoah, Bonsu, Darko, Appiah, Ofori, Sarpong, Adjei, Badu, Frimpong, Acheampong, Antwi, Gyamfi, Nuamah, Tetteh, Nkrumah, Asamoah, Adu, Amponsah, Quaye, Lartey, Kufuor, Armah, Addo, Ankrah, Boakye, Opoku

### Ghanaian Merchants & Businesses

**Retail/Supermarkets:** Shoprite Accra Mall, Melcom Kaneshie, Palace Supermarket, Koala Supermarket, MaxMart Achimota, Marina Mall, Game Stores West Hills, Citydia East Legon

**Fuel Stations:** Shell Dzorwulu, TotalEnergies Circle, Goil Tema, Star Oil Spintex, Engen Madina, Allied Oil Kasoa

**Restaurants/Food:** KFC Osu, Papaye Airport, Burger King Junction Mall, ChopBar Labone, Buka Restaurant Kumasi, Vida e Caffe Cantonments, Marwako Abelemkpe

**Online/Digital:** Jumia Ghana, Tonaton, Hubtel, ExpressPay, MTN Online, Vodafone Digital, Glovo Ghana

**Hotels:** Kempinski Gold Coast, Labadi Beach Hotel, Movenpick Ambassador, Tang Palace, African Regent, Alisa Hotel

**Transport:** Uber Ghana, Bolt Accra, STC Intercity, VIP Bus Service

**Healthcare:** Korle-Bu Teaching Hospital, 37 Military Hospital, Nyaho Medical Centre, Lister Hospital, Medlab Ghana

**Telecoms:** MTN Ghana, Vodafone Ghana, AirtelTigo, Surfline Communications

### Locations

**Major Cities with Areas:**
- Accra: Osu, East Legon, Airport Residential, Cantonments, Labone, Dzorwulu, Achimota, Spintex, Madina, Tema Community 1, Nungua, Dansoman, Kaneshie, Adabraka, Ridge, Roman Ridge
- Kumasi: Adum, Bantama, Asokwa, Nhyiaeso, Suame, Tafo, Manhyia, Ayigya, Kejetia
- Tamale: Lamashegu, Nyohini, Sakasaka, Changli, Vittin
- Cape Coast: Pedu, Abura, Kotokuraba, UCC Campus
- Takoradi: Market Circle, Beach Road, Anaji, Effia
- Tema: Community 1-25, Harbour Area, Tema New Town
- Ho: Bankoe, Dome, Hliha
- Sunyani: Nkwabeng, Penkwase, New Dormaa
- Koforidua: Adweso, Old Estate, New Juaben

### Transaction Amount Ranges (GH₵)

Realistic for Ghana's economy:
- ATM Withdrawal: 50 - 5,000 (common: 200-1,000)
- POS/Card Payment: 10 - 15,000 (common: 50-500)
- Online Purchase: 20 - 8,000 (common: 100-2,000)
- Bank Transfer: 100 - 500,000 (common: 500-20,000)
- Fuel purchase: 80 - 1,500 (common: 150-400)
- Restaurant: 30 - 800 (common: 50-200)
- Grocery: 50 - 2,000 (common: 100-500)

### Banks & Card Networks
- GCB Bank, Ecobank Ghana, Absa Ghana, Stanbic Bank, CalBank, Fidelity Bank, Republic Bank, Access Bank Ghana, Zenith Bank Ghana, Prudential Bank, First National Bank Ghana, Société Générale Ghana, UBA Ghana, First Atlantic Bank, ADB (Agricultural Development Bank)
- Card networks: Visa Debit, Mastercard, GhIPSS (Ghana Interbank Payment), gh-link

### Fraud Patterns to Simulate

Generate approximately **3-5% of transactions as fraudulent** with these realistic patterns:

1. **Rapid geo-switching** — card used in Accra, then Kumasi 12 minutes later (physically impossible). Most dramatic and easy to understand.

2. **Velocity attack** — 5+ transactions in under 3 minutes from different merchants. Simulate card cloning.

3. **Unusual hour + unusual amount** — large ATM withdrawal at 3:27 AM from an account that typically transacts 9am-6pm.

4. **First-time merchant category** — account holder who only shops at grocery stores suddenly makes a GH₵ 8,000 online electronics purchase.

5. **Micro-test + large withdrawal** — small GH₵ 2 test transaction at a POS terminal, followed by GH₵ 4,500 ATM withdrawal within 10 minutes. Classic stolen card pattern.

6. **Cross-border anomaly** — card used domestically in Accra, then a CNP (card-not-present) transaction from a foreign IP within the hour.

7. **Account takeover signals** — password reset + immediate large transfer + new beneficiary added within 30 minutes.

8. **Round amount pattern** — multiple transactions of exactly GH₵ 1,000, GH₵ 2,000, GH₵ 5,000 in quick succession (structuring).

### AI Model Simulation Logic

For each transaction, calculate a risk score using weighted factors:

```
riskScore = (
  velocityScore * 0.20 +        // How many transactions in last N minutes
  geoAnomalyScore * 0.25 +      // Distance vs time since last transaction
  amountDeviationScore * 0.20 + // How far from account's typical amount
  timeOfDayScore * 0.10 +       // Transaction at unusual hour for this account
  merchantCategoryScore * 0.10 + // New/unusual merchant category
  deviceChannelScore * 0.15     // New device, channel change, etc.
)
```

Each sub-score is 0-100. The weighted total gives the final risk score.

Decision thresholds:
- 0-30: APPROVED (auto-approve)
- 31-60: APPROVED with monitoring
- 61-80: REVIEW (manual review required)
- 81-100: BLOCKED (auto-block, alert generated)

Generate natural language explanations for each decision based on which factors contributed most.

---

## Interactive Features

### Demo Controls (Facilitator Panel)

A floating control panel (toggle-able) that lets the presenter control the demo:

1. **Speed control** — slider to adjust transaction feed speed (0.5x, 1x, 2x, 5x)
2. **Inject fraud** — button to manually inject a specific fraud pattern into the feed with dramatic animation
3. **Pause/Resume** — pause the transaction stream
4. **Reset** — reset all counters and start fresh
5. **Scenario buttons:**
   - "Normal day" — 2% fraud rate, typical patterns
   - "Under attack" — 15% fraud rate, coordinated attack simulation
   - "Mastercard comparison" — split-screen showing rule-based vs AI side by side

### Split-Screen Comparison Mode

When activated, shows two transaction feeds side by side:
- **Left: Rule-Based System** — catches only obvious fraud (exact matches, simple thresholds), misses novel patterns. Shows more false positives (legitimate transactions incorrectly flagged). Slower response time displayed.
- **Right: AI System** — catches all fraud types including novel ones. Fewer false positives. Faster response times. Running count comparison at the bottom.

This is the KILLER feature for the webinar demo. The visual contrast should be immediately obvious.

---

## Technical Implementation Notes

### State Management
- Use React Context or Zustand for global state (transaction feed, stats, selected transaction)
- Transaction generator should run in a `useEffect` with `setInterval`, generating new transactions and pushing them to state

### Transaction Generator
- Create a `generateTransaction()` function that:
  1. Picks a random account profile (pre-generate ~50 account profiles with typical behaviour patterns)
  2. Generates a realistic transaction based on that account's patterns
  3. With probability based on fraud rate, generates a fraudulent transaction instead
  4. Calculates the AI risk score
  5. Generates the natural language explanation
  6. Returns the complete transaction object

### Performance
- Keep maximum 200 transactions in the feed (remove oldest when exceeded)
- Use `React.memo` and `useMemo` for transaction cards
- Virtualise the transaction list if needed (react-window)
- Animations should use `will-change: transform` for GPU acceleration

### Responsive Design
- Primary target: 1920x1080 (presenter's screen)
- Secondary: 1366x768 (laptop)
- Tertiary: 768px (tablet, for attendees following along)

---

## File Structure

```
/app
  /page.tsx                    — Main dashboard (transaction monitor)
  /analytics/page.tsx          — Analytics dashboard
  /investigate/[id]/page.tsx   — Fraud investigation detail
  /layout.tsx                  — Root layout with sidebar
/components
  /dashboard
    TransactionFeed.tsx        — Live transaction feed
    TransactionCard.tsx        — Individual transaction card
    StatsBar.tsx               — Top stats row
    AIAnalysisPanel.tsx        — Right panel AI breakdown
    RiskScoreBar.tsx           — Animated risk score bar
    GhanaMap.tsx               — Simplified Ghana fraud map
  /analytics
    FraudByTypeChart.tsx       — Donut chart
    FraudByTimeChart.tsx       — Area chart
    ComparisonTable.tsx        — AI vs Rule-based
    GeoHeatmap.tsx             — Geographic heatmap
  /investigation
    TransactionTimeline.tsx    — Vertical timeline
    BehaviourRadar.tsx         — Spider/radar chart
    NetworkGraph.tsx           — Fraud network visualization
  /controls
    DemoControls.tsx           — Floating facilitator panel
    SpeedSlider.tsx
    ScenarioButtons.tsx
  /comparison
    SplitScreenView.tsx        — Side-by-side comparison
  /shared
    AnimatedCounter.tsx        — Count-up number animation
    StatusBadge.tsx            — APPROVED/REVIEW/BLOCKED badges
    ConfidenceGauge.tsx        — Circular confidence meter
/lib
  /data
    ghanaData.ts               — Names, locations, merchants, banks
    accountProfiles.ts         — Pre-generated account profiles
  /engine
    transactionGenerator.ts    — Transaction generation logic
    riskScoring.ts             — AI risk score calculation
    fraudPatterns.ts           — Fraud pattern definitions
    explanationGenerator.ts    — Natural language explanations
  /utils
    formatters.ts              — Currency, date, number formatting
    animations.ts              — Shared animation variants
```

---

## Key UX Moments for the Webinar

1. **"Can you spot the fraud?"** — The presenter pauses the feed, shows 10 transactions, and asks the audience to identify the fraudulent ones. Then reveals the AI's analysis.

2. **"Watch this"** — The presenter hits "Inject Fraud" and a dramatic geo-switching fraud appears with full animation and explanation.

3. **"Now compare"** — Split-screen mode activates showing the rule-based system missing fraud that AI catches.

4. **"47 milliseconds"** — The processing time counter prominently shows how fast AI decisions are made.

5. **"This was built in days, not years"** — The simplicity and elegance of the demo itself demonstrates accessibility of AI.

---

## Critical Requirements

- [ ] All monetary values in GH₵ with proper formatting (e.g., GH₵ 1,234.56)
- [ ] All names are realistic Ghanaian names
- [ ] All locations are real Ghanaian places with specific areas
- [ ] All merchants are realistic Ghanaian businesses
- [ ] Time format: 24hr or 12hr with AM/PM, Ghana timezone (GMT/WAT)
- [ ] Fraud explanations reference specific Ghanaian locations and contexts
- [ ] Dashboard must look premium — this represents "what AI can do"
- [ ] Smooth 60fps animations throughout
- [ ] No loading spinners or jank during the demo
- [ ] Works offline after initial load (no API calls during demo)
- [ ] Vercel deployment ready (next.config.js properly configured)
- [ ] The "inject fraud" button must create a DRAMATIC moment — the fraudulent transaction should arrive with sound-like visual fanfare (red flash, pulse, enlarged card)
