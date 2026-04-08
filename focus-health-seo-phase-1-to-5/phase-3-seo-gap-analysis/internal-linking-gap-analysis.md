# Internal Linking Gap Analysis — Focus Health

---

## Current Internal Link Map

### Pages Linking OUT (Outbound Internal Links)

| Page | Links To |
|------|----------|
| Home | `/partners#opportunity-form`, `/contact`, 5 facility pages, `/track-record/first-choice-emergency-room` |
| Platform | `/partners`, `/track-record` |
| Market | `/partners`, `/platform` |
| Track Record | `/our-process`, `/leadership`, `/partners`, 6 facility pages |
| Leadership | `/partners`, `/track-record`, `/contact` |
| Partners | `/platform`, `/track-record`, `/leadership` |
| Investors | `/leadership`, `/partners#opportunity-form`, `/market`, `/track-record` |
| Our Process | `/leadership`, `/investors`, `/contact`, 5 facility pages |
| Insights Hub | Individual post pages only |
| Contact | None |
| Each Facility Page | `/track-record`, `/contact`, `/`, `/platform`, `/investors`, `/our-process`, 4 other facility pages |

### Pages Receiving Inbound Internal Links

| Page | Linked From (Body Content, Excl. Nav/Footer) |
|------|----------------------------------------------|
| `/partners` or `/partners#opportunity-form` | Home (×3+), Platform, Market (×2), Track Record, Leadership, Investors |
| `/track-record` | Platform (×2), Track Record sub-nav, Leadership, Partners, Investors, All facility pages |
| `/contact` | Home, Leadership, Our Process, All facility pages |
| `/leadership` | Track Record, Partners, Investors, Our Process |
| `/platform` | Market, Partners, All facility pages |
| `/investors` | Our Process, All facility pages |
| `/market` | Investors |
| `/our-process` | Track Record, All facility pages |
| `/insights` | **None from body content** |
| Facility pages | Home (map), Track Record (cards), Our Process (cards) |

---

## Critical Internal Linking Gaps

### Gap 1: `/insights` Receives Zero Body-Content Links

The Insights hub is linked from the navbar and footer but has **zero contextual body-content links** from any other page. This means:
- No internal link equity flows to the content hub from core pages
- Search engines may interpret the insights section as low-priority
- Readers on conversion pages are never directed to educational content

**Pages that should link to `/insights`:**
- Home (add "Read Our Latest Insights" link in a relevant section)
- Platform (link to platform insight article)
- Market (link to Texas market insight article)
- Track Record (link to operational readiness article)
- Partners (link to investor checklist article)
- Investors (link to investor checklist and market articles)
- All facility pages (link in cross-linking section)

### Gap 2: `/market` Receives Only One Body-Content Link

The Market page is only linked from `/investors`. Despite being a core strategic page about the Texas opportunity, it receives minimal internal link equity.

**Pages that should link to `/market`:**
- Home (from the market section CTA — currently opens a modal instead)
- Platform (add "Explore the Texas Market" link)
- Track Record (add "See the Market Opportunity" link)
- Partners (add market context link)
- Facility pages (add "Texas FSER Market" link)

### Gap 3: Contact Page Has Zero Outbound Links

The contact page is a dead end. Users who reach it have no pathway back to other content.

**Should link to:**
- `/partners` (for investment enquiries)
- `/investors` (for investor deck requests)
- `/leadership` (to meet the team)
- `/track-record` (to view the portfolio)

### Gap 4: Insight Posts Lack In-Article Internal Links

Based on the blog post structure, individual insight articles may not contain contextual internal links within their body text. Each article should link to:
- Its corresponding pillar page (Market, Platform, Track Record, etc.)
- At least 2 other insight articles for cluster linking
- A conversion page (Partners or Investors) as the end-of-article CTA

### Gap 5: Cross-Facility Linking Excludes First Choice ER

The facility cross-linking sections on each ER page link to four other facilities but do not include First Choice Emergency Room (Houston). As a pre-launch facility actively seeking investment, it should be cross-linked from all active facility pages.

---

## Navigation Linking Gaps

### Main Navbar

| Present | Missing |
|---------|---------|
| Home, Platform, Market, Track Record, Leadership, Partners, Insights, Contact | `/investors`, `/our-process` |

### Footer

| Present | Missing |
|---------|---------|
| Platform, Market, Track Record, Leadership, Insights, Partners variations, Contact | `/investors`, `/our-process`, individual facility pages, `/about` (future) |

---

## Internal Link Equity Distribution

Using a simplified model where each internal link passes proportional equity:

| Page | Estimated Authority Level | Status |
|------|--------------------------|--------|
| `/partners` | **Highest** — receives most internal links from body content + nav + footer | Over-concentrated |
| `/track-record` | **High** — well-linked from body content + nav + footer | Good |
| `/contact` | **High** — linked from nav + footer + many pages | Good |
| `/leadership` | **Medium-High** — linked from nav + footer + several pages | Good |
| `/platform` | **Medium** — linked from nav + footer + some pages | Adequate |
| `/investors` | **Low** — no nav/footer links, few body content links | **Under-served** |
| `/our-process` | **Low** — no nav/footer links, few body content links | **Under-served** |
| `/insights` | **Low** — nav/footer only, zero body content links | **Under-served** |
| `/market` | **Low** — nav/footer + only one body content link | **Under-served** |
| Facility pages | **Medium** — linked from 2–3 hub pages + cross-links | Adequate |

---

## Recommended Internal Linking Architecture

### Tier 1: Hub Pages (Should Have Most Inbound Links)
- Home
- Track Record (portfolio hub)
- Partners (conversion hub)
- Insights (content hub)

### Tier 2: Supporting Pages (Should Link Up to Hubs and Down to Detail)
- Platform → links to Track Record, Facility pages, Insights
- Market → links to Track Record, Facility pages, Insights
- Investors → links to Track Record, Partners, Insights
- Our Process → links to Track Record, Facility pages, Insights
- Leadership → links to Track Record, Partners, Insights

### Tier 3: Detail Pages (Should Link Up to Hubs and Across to Peers)
- Facility pages → link to Track Record, Insights, each other
- Insight posts → link to pillar pages, Partners/Investors, each other

---

## Action Items

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | Add contextual links to `/insights` from 6+ core pages | Low | High |
| 2 | Add contextual links to `/market` from 4+ core pages | Low | Medium |
| 3 | Add outbound links from Contact page to 4 core pages | Low | Medium |
| 4 | Add `/investors` and `/our-process` to footer navigation | Low | Medium |
| 5 | Add First Choice ER to facility cross-linking sections | Low | Medium |
| 6 | Add in-article internal links to all 6 existing insight posts | Medium | High |
| 7 | Add links from insight posts to conversion pages (Partners, Investors) | Medium | High |
| 8 | Create `/facilities` hub page as central internal linking node | Medium | Medium |
