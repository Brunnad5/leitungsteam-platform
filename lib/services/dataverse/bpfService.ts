/**
 * BPF Service - Lädt Business Process Flow Daten (Server-Only)
 * 
 * Die ideatosolution-Tabelle enthält die echte BPF-Phase für jedes Vorhaben.
 * 
 * Hinweis: Für Client-Komponenten die Konstanten aus '@/lib/constants/bpfStages' importieren.
 */

import { BaseDataverseClient } from './dataverseClient';
import { IdeaToSolutionRecord } from './types';

// Re-export für Kompatibilität (nur auf Server verwenden!)
export { BPF_STAGE_IDS, getPhaseFromStageId, getPhaseNameFromStageId } from '@/lib/constants/bpfStages';

// EntitySet-Name
const ENTITY_SET_NAME = 'cr6df_ideatosolutions';

/**
 * BPF-Client für ideatosolution-Tabelle
 */
class BpfClient extends BaseDataverseClient<IdeaToSolutionRecord> {
  constructor() {
    super(ENTITY_SET_NAME);
  }

  /**
   * Lädt die BPF-Daten für ein Vorhaben
   */
  async getByVorhabenId(vorhabenId: string): Promise<IdeaToSolutionRecord | null> {
    const filter = `_bpf_cr6df_sgsw_digitalisierungsvorhabenid_value eq ${vorhabenId}`;
    const results = await this.list({
      filter,
      top: 1,
      select: [
        'businessprocessflowinstanceid',
        '_activestageid_value',
        'activestagestartedon',
        '_bpf_cr6df_sgsw_digitalisierungsvorhabenid_value',
        'completedon',
      ],
    });
    
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Lädt alle BPF-Daten (für Übersichten)
   */
  async getAll(): Promise<IdeaToSolutionRecord[]> {
    return this.list({
      select: [
        'businessprocessflowinstanceid',
        '_activestageid_value',
        'activestagestartedon',
        '_bpf_cr6df_sgsw_digitalisierungsvorhabenid_value',
        'completedon',
      ],
    });
  }
}

// Singleton-Instanz
export const bpfService = new BpfClient();
