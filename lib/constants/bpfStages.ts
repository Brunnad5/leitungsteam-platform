/**
 * BPF Stage Konstanten und Hilfsfunktionen
 * 
 * Diese Datei kann sowohl auf Server als auch Client verwendet werden.
 * Die Stage-GUIDs sind fix für den "ideaToSolution" BPF.
 */

// Stage-GUIDs aus Dataverse (ermittelt aus traversedpath)
export const BPF_STAGE_IDS = {
  INITIALISIERUNG: 'd770e370-8da5-48b9-b36e-69a33e7d8879',
  ANALYSE_BEWERTUNG: '65c7768d-2a18-40b9-9dd6-035819e926ba',
  PLANUNG: '49e8aa6a-d56f-48fa-b80a-2edfc816fffa',
  UMSETZUNG: 'b8209429-fea3-4fde-9440-2bc168bf14b3',
} as const;

/**
 * Mappt eine Stage-GUID auf die Phasennummer (1-4)
 */
export function getPhaseFromStageId(stageId?: string): number {
  if (!stageId) return 1;
  
  switch (stageId.toLowerCase()) {
    case BPF_STAGE_IDS.INITIALISIERUNG:
      return 1;
    case BPF_STAGE_IDS.ANALYSE_BEWERTUNG:
      return 2;
    case BPF_STAGE_IDS.PLANUNG:
      return 3;
    case BPF_STAGE_IDS.UMSETZUNG:
      return 4;
    default:
      return 1;
  }
}

/**
 * Mappt eine Stage-GUID auf den Phasennamen
 */
export function getPhaseNameFromStageId(stageId?: string): string {
  if (!stageId) return 'Initialisierung';
  
  switch (stageId.toLowerCase()) {
    case BPF_STAGE_IDS.INITIALISIERUNG:
      return 'Initialisierung';
    case BPF_STAGE_IDS.ANALYSE_BEWERTUNG:
      return 'Analyse & Bewertung';
    case BPF_STAGE_IDS.PLANUNG:
      return 'Planung';
    case BPF_STAGE_IDS.UMSETZUNG:
      return 'Umsetzung';
    default:
      return 'Unbekannt';
  }
}
