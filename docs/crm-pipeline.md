# Yacht-sales pipeline (HubSpot)

**HubSpot owns the pipeline. The custom admin owns lead intake/triage.**
This doc describes how to configure the HubSpot Deal pipeline so the admin's
"Convert to deal" flow + read-only deal panel work cleanly.

## Recommended stages

Configure these in HubSpot → Settings → Objects → Deals → Pipelines (use the
default "Sales Pipeline" unless you split charters/brokerage into multiple
pipelines later).

| # | Stage label                   | Probability |
|---|-------------------------------|-------------|
| 1 | New inquiry                   | 10%         |
| 2 | Contacted / discovery         | 20%         |
| 3 | Viewing or sea trial scheduled | 40%        |
| 4 | Offer submitted               | 60%         |
| 5 | Negotiation / MOA signed      | 75%         |
| 6 | Survey & sea trial            | 85%         |
| 7 | Closed won                    | 100%        |
| 8 | Closed lost                   | 0%          |

**The labels above are what staff see in the admin's "Convert to deal" modal.**
The admin renders the live label and probability returned from
`GET /crm/v3/pipelines/deals` — no hardcoded list, so renaming stages in
HubSpot reflects in the admin within an hour (the in-process cache TTL).

## Why these stages and not HubSpot's defaults

HubSpot ships generic SaaS-flavoured stages (Appointment Scheduled,
Qualified to Buy, Decision Maker Bought-In, etc.). Those don't fit a
6-month yacht sale. The list above is tuned to the actual events that
move a yacht deal:

- **Viewing or sea trial scheduled** is the meaningful inflection — this
  is when buyers stop tyre-kicking.
- **MOA signed** (Memorandum of Agreement) is the contract milestone.
- **Survey & sea trial** is the technical-acceptance gate that often
  reopens negotiation.

## What the admin reads

For each lead with `inquiries.hasDeal=true`, the admin's lead detail panel
fetches `/crm/v3/objects/deals/{id}` live every page load (no DB mirror)
and renders:

- Deal name
- Current stage (label + probability)
- Amount (formatted USD)
- Close date
- Last activity date
- Owner (HubSpot user id, displayed as-is for now — could be enriched if needed)
- "Open in HubSpot" deep link

If the deal was deleted in HubSpot (404 from the API), the panel surfaces
a "Deal removed in HubSpot — clear association" affordance that nulls the
local `hubspot_deal_id`.

## What the admin never stores

- The deal's current stage. Codex audit flagged that mirroring this would
  cause the admin to lie when HubSpot moves the deal to Closed Lost.
- The deal's amount (the `amount` field in the convert modal is sent to
  HubSpot at create time but never stored locally).
- Activity history, sequences, tasks. HubSpot owns those entirely.

## Required HubSpot env vars

```
HUBSPOT_ACCESS_TOKEN=pat-...      # Private app token with deals + contacts r/w
HUBSPOT_PORTAL_ID=...             # Used to construct deep links like
                                  # https://app.hubspot.com/contacts/<portal>/deal/<id>
```

Without `HUBSPOT_PORTAL_ID` the panel still renders deal data but the
"Open in HubSpot" link is hidden.

## Permissions

`POST /api/admin/leads/[id]/convert-to-deal` requires `role='admin'`, not
`role='staff'`. The endpoint accepts a free-form `amount` field that creates
a record in the pipeline of record — codex audit correctly flagged that
audit logging alone is not a sufficient control. Staff users can view the
panel and trigger refreshes; only admins can convert.

`GET /api/admin/leads/[id]/deal` and `DELETE /api/admin/leads/[id]/deal`
both require `role IN ('staff','admin')`.
