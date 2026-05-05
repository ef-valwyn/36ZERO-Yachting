/**
 * HubSpot Deals integration.
 *
 * The admin custom-builds intake/triage; HubSpot owns the sales pipeline.
 * This module is the bridge: a one-way "create the deal" call from admin,
 * plus a live read for the lead-detail panel. We never mirror deal *stage*
 * locally — the read is always live so closing a deal in HubSpot reflects
 * immediately in the admin.
 */

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3';

/**
 * HubSpot association type id for Deal → Contact (HUBSPOT_DEFINED).
 * https://developers.hubspot.com/docs/api/crm/associations
 */
const DEAL_TO_CONTACT_ASSOCIATION_TYPE_ID = 3;

export interface CreateDealInput {
  /** HubSpot contact id to associate the deal to. Required. */
  contactId: string;
  /** Display name for the deal. Defaults to lead name + vessel. */
  dealName: string;
  /** HubSpot pipeline stage internal id. */
  stage: string;
  /** Optional pipeline id. Defaults to 'default' (HubSpot's only pipeline on Free CRM). */
  pipeline?: string;
  /** Optional deal amount. */
  amount?: number | null;
  /** Optional close date in YYYY-MM-DD. */
  closeDate?: string | null;
}

export interface DealSummary {
  id: string;
  dealName: string | null;
  pipeline: string | null;
  dealStage: string | null;
  amount: number | null;
  closeDate: string | null;
  ownerId: string | null;
  lastActivityAt: string | null;
}

export type CreateDealResult =
  | { ok: true; dealId: string }
  | { ok: false; error: string };

export type GetDealResult =
  | { ok: true; deal: DealSummary }
  | { ok: false; error: string; status: number };

export interface PipelineStage {
  id: string;
  label: string;
  displayOrder: number;
  /** 0..1, where 1 is fully closed (won or lost) */
  probability: number;
}

export interface Pipeline {
  id: string;
  label: string;
  stages: PipelineStage[];
}

/**
 * Create a Deal and associate it to the given Contact in one atomic POST.
 * HubSpot v3 accepts `associations` inline so we don't have to make a
 * separate association call afterwards.
 */
export async function createDealFromInquiry(
  input: CreateDealInput
): Promise<CreateDealResult> {
  if (!HUBSPOT_ACCESS_TOKEN) return { ok: false, error: 'HubSpot not configured' };

  const properties: Record<string, string> = {
    dealname: input.dealName,
    pipeline: input.pipeline ?? 'default',
    dealstage: input.stage,
  };
  if (input.amount != null && Number.isFinite(input.amount)) {
    properties.amount = input.amount.toString();
  }
  if (input.closeDate) {
    properties.closedate = input.closeDate;
  }

  try {
    const res = await fetch(`${HUBSPOT_API_URL}/objects/deals`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties,
        associations: [
          {
            to: { id: input.contactId },
            types: [
              {
                associationCategory: 'HUBSPOT_DEFINED',
                associationTypeId: DEAL_TO_CONTACT_ASSOCIATION_TYPE_ID,
              },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('[hubspot-deals] create failed', res.status, body);
      return { ok: false, error: `HubSpot ${res.status}` };
    }
    const data = (await res.json()) as { id?: string };
    if (!data.id) return { ok: false, error: 'HubSpot returned no deal id' };
    return { ok: true, dealId: data.id };
  } catch (err) {
    console.error('[hubspot-deals] create threw', err);
    return { ok: false, error: 'HubSpot request failed' };
  }
}

/**
 * Fetch live deal state for the lead-detail panel. Returns 404 distinctly
 * so the UI can offer a "clear association" affordance when the deal has
 * been deleted in HubSpot.
 */
export async function getDealSummary(dealId: string): Promise<GetDealResult> {
  if (!HUBSPOT_ACCESS_TOKEN)
    return { ok: false, error: 'HubSpot not configured', status: 500 };

  const params = new URLSearchParams({
    properties:
      'dealname,pipeline,dealstage,amount,closedate,hubspot_owner_id,notes_last_activity_date',
  });
  try {
    const res = await fetch(
      `${HUBSPOT_API_URL}/objects/deals/${encodeURIComponent(dealId)}?${params.toString()}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
      }
    );
    if (res.status === 404) {
      return { ok: false, error: 'deal_not_found', status: 404 };
    }
    if (!res.ok) {
      const body = await res.text();
      console.error('[hubspot-deals] get failed', res.status, body);
      return { ok: false, error: `HubSpot ${res.status}`, status: res.status };
    }
    const data = (await res.json()) as {
      id?: string;
      properties?: Record<string, string | null | undefined>;
    };
    const p = data.properties ?? {};
    const amount = p.amount ? Number.parseFloat(p.amount) : null;
    return {
      ok: true,
      deal: {
        id: data.id ?? dealId,
        dealName: p.dealname ?? null,
        pipeline: p.pipeline ?? null,
        dealStage: p.dealstage ?? null,
        amount: amount != null && Number.isFinite(amount) ? amount : null,
        closeDate: p.closedate ?? null,
        ownerId: p.hubspot_owner_id ?? null,
        lastActivityAt: p.notes_last_activity_date ?? null,
      },
    };
  } catch (err) {
    console.error('[hubspot-deals] get threw', err);
    return { ok: false, error: 'HubSpot request failed', status: 500 };
  }
}

/**
 * Fetch the deal pipelines + their stages. Cached in-process for an hour;
 * pipeline configs change very rarely and the lead-detail page hits this on
 * every mount of the convert modal.
 */
let _pipelineCache: { value: Pipeline[]; expiresAt: number } | null = null;
const PIPELINE_TTL_MS = 60 * 60 * 1_000;

export async function listPipelines(): Promise<Pipeline[]> {
  if (!HUBSPOT_ACCESS_TOKEN) return [];
  if (_pipelineCache && _pipelineCache.expiresAt > Date.now()) {
    return _pipelineCache.value;
  }
  try {
    const res = await fetch(`${HUBSPOT_API_URL}/pipelines/deals`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
    });
    if (!res.ok) {
      console.error('[hubspot-deals] pipelines failed', res.status, await res.text());
      return [];
    }
    const data = (await res.json()) as {
      results?: Array<{
        id?: string;
        label?: string;
        stages?: Array<{
          id?: string;
          label?: string;
          displayOrder?: number;
          metadata?: { probability?: string };
        }>;
      }>;
    };
    const pipelines: Pipeline[] = (data.results ?? []).map((p) => ({
      id: p.id ?? '',
      label: p.label ?? '',
      stages: (p.stages ?? [])
        .map((s) => {
          const probStr = s.metadata?.probability ?? '0';
          const prob = Number.parseFloat(probStr);
          return {
            id: s.id ?? '',
            label: s.label ?? '',
            displayOrder: s.displayOrder ?? 0,
            probability: Number.isFinite(prob) ? prob : 0,
          };
        })
        .sort((a, b) => a.displayOrder - b.displayOrder),
    }));
    _pipelineCache = { value: pipelines, expiresAt: Date.now() + PIPELINE_TTL_MS };
    return pipelines;
  } catch (err) {
    console.error('[hubspot-deals] pipelines threw', err);
    return [];
  }
}

/**
 * Construct the in-app HubSpot deal URL given a portal id + deal id.
 * Returns null if the portal id env var isn't set.
 */
export function buildHubSpotDealUrl(dealId: string): string | null {
  const portal = process.env.HUBSPOT_PORTAL_ID;
  if (!portal) return null;
  return `https://app.hubspot.com/contacts/${portal}/deal/${dealId}`;
}
