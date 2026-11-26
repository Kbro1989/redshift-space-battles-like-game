/**
 * Resource definitions.
 * STATUS: PLACEHOLDER — original resource names unverified.
 * Update when evidence is recovered.
 */
export const RESOURCE_DEFS = {
  credits: {
    id: 'credits',
    label: 'Credits',
    description: 'Universal galactic currency. Used for construction, procurement, and upgrades.',
    evidenceStatus: 'CORROBORATED',
  },
  metal: {
    id: 'metal',
    label: 'Metal',
    description: 'Structural titanium alloy mined from planetary crusts and asteroid belts.',
    evidenceStatus: 'CORROBORATED',
  },
  crystal: {
    id: 'crystal',
    label: 'Crystal',
    description: 'Resonant energy crystals essential for shields, lasers, and advanced electronics.',
    evidenceStatus: 'CORROBORATED',
  },
  helium3: {
    id: 'helium3',
    label: 'Helium-3',
    description: 'Sub-surface geothermal isotope fueling fusion drives and capital ship thrusters.',
    evidenceStatus: 'CORROBORATED',
  },
} as const;

export type ResourceId = keyof typeof RESOURCE_DEFS;
export type ResourceBundle = Partial<Record<ResourceId, number>>;
