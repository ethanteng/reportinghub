import { create } from 'zustand';
import {
  DataSource,
  SemanticModel,
  AnalyzerRun,
  AgentConfig,
  AgentStatus,
  ID,
  Table,
  Column,
  InstructionHistory,
  InstructionChangeType,
  InstructionScope,
  VisibilityOverrides,
  ModelVisibilityOverrides,
} from '../../lib/types';
import { 
  dataSources, 
  model, 
  models, 
  lastAnalyzerRun, 
  agentConfigs,
  salesAnalyzerRun,
  warehouseAnalyzerRun,
  docsAnalyzerRun,
  mockInstructionHistory,
} from '../../lib/mockData';

export type SelectedEntity =
  | { type: 'model'; data: SemanticModel }
  | { type: 'table'; data: Table; modelId: ID }
  | { type: 'column'; data: Column; tableId: ID; modelId: ID }
  | { type: 'source'; data: DataSource }
  | null;

interface BiGeniusStore {
  // Data
  dataSources: DataSource[];
  model: SemanticModel;
  models: SemanticModel[];
  analyzerRun: AnalyzerRun | null;
  analyzerRuns: Map<ID, AnalyzerRun>; // Map of model ID to analyzer run
  agentConfigs: AgentConfig[];
  instructionHistory: InstructionHistory[]; // Track all instruction changes
  
  // UI State
  selectedEntity: SelectedEntity;
  selectedSourceIds: ID[];
  inspectorOpen: boolean;
  currentAgentId: ID | null; // Currently active agent being configured
  
  // Actions
  setDataSources: (sources: DataSource[]) => void;
  updateDataSource: (id: ID, updates: Partial<DataSource>) => void;
  addDataSource: (source: DataSource) => void;
  removeDataSource: (id: ID) => void;
  setModel: (model: SemanticModel) => void;
  setModels: (models: SemanticModel[]) => void;
  updateModel: (modelId: ID, updates: Partial<SemanticModel>) => void;
  setAnalyzerRun: (run: AnalyzerRun | null) => void;
  getAnalyzerRunForModel: (modelId: ID) => AnalyzerRun | null;
  setSelectedEntity: (entity: SelectedEntity) => void;
  toggleSourceSelection: (id: ID) => void;
  clearSourceSelection: () => void;
  setInspectorOpen: (open: boolean) => void;
  setCurrentAgentId: (id: ID | null) => void;
  addAgentConfig: (config: AgentConfig) => void;
  updateAgentConfig: (id: ID, updates: Partial<AgentConfig>) => void;
  deleteAgentConfig: (id: ID) => void;
  cloneAgentConfig: (id: ID) => AgentConfig;
  getCurrentAgent: () => AgentConfig | null;
  
  // Instruction History
  addInstructionHistory: (entry: InstructionHistory) => void;
  getInstructionHistoryForEntity: (targetId: ID) => InstructionHistory[];
  
  // Helper to get instruction count
  getInstructionCount: () => number;

  // Visibility controls
  isTableIncluded: (modelId: ID, tableId: ID) => boolean;
  isColumnIncluded: (modelId: ID, tableId: ID, columnId: ID) => boolean;
  setTableInclusion: (modelId: ID, tableId: ID, included: boolean) => void;
  setColumnInclusion: (modelId: ID, tableId: ID, columnId: ID, included: boolean) => void;
}

export const useBiGeniusStore = create<BiGeniusStore>((set, get) => ({
  // Initial data
  dataSources: [...dataSources],
  model: model,
  models: [...models],
  analyzerRun: lastAnalyzerRun,
  analyzerRuns: new Map([
    [salesAnalyzerRun.modelId, salesAnalyzerRun],
    [warehouseAnalyzerRun.modelId, warehouseAnalyzerRun],
    [docsAnalyzerRun.modelId, docsAnalyzerRun],
  ]),
  agentConfigs: [...agentConfigs],
  instructionHistory: [...mockInstructionHistory],
  
  // Initial UI state
  selectedEntity: null,
  selectedSourceIds: [],
  inspectorOpen: false,
  currentAgentId: agentConfigs.length > 0 ? agentConfigs[agentConfigs.length - 1].id : null,
  
  // Actions
  setDataSources: (sources) => set({ dataSources: sources }),
  
  updateDataSource: (id, updates) =>
    set((state) => ({
      dataSources: state.dataSources.map((ds) =>
        ds.id === id ? { ...ds, ...updates } : ds
      ),
    })),
  
  addDataSource: (source) =>
    set((state) => ({
      dataSources: [...state.dataSources, source],
    })),
  
  removeDataSource: (id) =>
    set((state) => ({
      dataSources: state.dataSources.filter((ds) => ds.id !== id),
      selectedSourceIds: state.selectedSourceIds.filter((sid) => sid !== id),
      selectedEntity: state.selectedEntity?.type === 'source' && state.selectedEntity.data.id === id
        ? null
        : state.selectedEntity,
    })),
  
  setModel: (model) => set({ model }),
  
  setModels: (models) => set({ models }),
  
  updateModel: (modelId, updates) =>
    set((state) => ({
      models: state.models.map((m) => (m.id === modelId ? { ...m, ...updates } : m)),
      model: state.model.id === modelId ? { ...state.model, ...updates } : state.model,
    })),
  
  setAnalyzerRun: (run) => 
    set((state) => {
      if (!run) return { analyzerRun: null };
      
      // Update both the singular property and the Map
      const newAnalyzerRuns = new Map(state.analyzerRuns);
      newAnalyzerRuns.set(run.modelId, run);
      
      return {
        analyzerRun: run,
        analyzerRuns: newAnalyzerRuns,
      };
    }),
  
  getAnalyzerRunForModel: (modelId) => {
    const state = get();
    return state.analyzerRuns.get(modelId) || null;
  },
  
  setSelectedEntity: (entity) =>
    set({ selectedEntity: entity, inspectorOpen: entity !== null }),
  
  toggleSourceSelection: (id) =>
    set((state) => ({
      selectedSourceIds: state.selectedSourceIds.includes(id)
        ? state.selectedSourceIds.filter((sid) => sid !== id)
        : [...state.selectedSourceIds, id],
    })),
  
  clearSourceSelection: () => set({ selectedSourceIds: [] }),
  
  setInspectorOpen: (open) => set({ inspectorOpen: open }),
  
  setCurrentAgentId: (id) => set({ currentAgentId: id }),
  
  getCurrentAgent: () => {
    const state = get();
    if (!state.currentAgentId) return null;
    return state.agentConfigs.find((config) => config.id === state.currentAgentId) || null;
  },
  
  addAgentConfig: (config) =>
    set((state) => ({
      agentConfigs: [...state.agentConfigs, config],
      currentAgentId: config.id, // Set as current agent when created
    })),
  
  updateAgentConfig: (id, updates) =>
    set((state) => ({
      agentConfigs: state.agentConfigs.map((config) =>
        config.id === id
          ? { ...config, ...updates, updatedAt: new Date().toISOString() }
          : config
      ),
    })),
  
  deleteAgentConfig: (id) =>
    set((state) => ({
      agentConfigs: state.agentConfigs.filter((config) => config.id !== id),
    })),
  
  cloneAgentConfig: (id) => {
    const state = get();
    const original = state.agentConfigs.find((config) => config.id === id);
    if (!original) throw new Error('Agent not found');
    
    const versionNum = parseInt(original.versionTag.replace('v', ''), 10);
    const clone: AgentConfig = {
      ...original,
      id: `config_${Date.now()}` as ID,
      name: `${original.name} (Copy)`,
      versionTag: `v${versionNum + 1}`,
      status: AgentStatus.Draft,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: undefined,
      clonedFromId: original.id,
      visibilityOverrides: original.visibilityOverrides
        ? JSON.parse(JSON.stringify(original.visibilityOverrides))
        : undefined,
    };
    
    set((state) => ({
      agentConfigs: [...state.agentConfigs, clone],
    }));
    
    return clone;
  },
  
  getInstructionCount: () => {
    const state = get();
    let count = 0;
    
    // Count instructions across all models
    state.models.forEach((model) => {
      count += (model.instructions?.length || 0);
      
      model.tables.forEach((table) => {
        count += (table.instructions?.length || 0);
        table.columns.forEach((column) => {
          count += (column.instructions?.length || 0);
        });
      });
    });
    
    return count;
  },

  // Instruction History Actions
  addInstructionHistory: (entry) => 
    set((state) => ({
      instructionHistory: [...state.instructionHistory, entry],
    })),

  getInstructionHistoryForEntity: (targetId) => {
    const state = get();
    return state.instructionHistory
      .filter((h) => h.targetId === targetId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  isTableIncluded: (modelId, tableId) => {
    const state = get();
    const agent = state.getCurrentAgent();
    if (!agent) return true;

    const overrides = agent.visibilityOverrides;
    if (!overrides) return true;

    const modelOverrides = overrides[modelId];
    if (!modelOverrides) return true;

    return !modelOverrides.excludedTableIds.includes(tableId);
  },

  isColumnIncluded: (modelId, tableId, columnId) => {
    const state = get();
    const tableIncluded = state.isTableIncluded(modelId, tableId);
    if (!tableIncluded) return false;

    const agent = state.getCurrentAgent();
    if (!agent) return true;

    const overrides = agent.visibilityOverrides;
    if (!overrides) return true;

    const modelOverrides = overrides[modelId];
    if (!modelOverrides) return true;

    return !modelOverrides.excludedColumnIds.includes(columnId);
  },

  setTableInclusion: (modelId, tableId, included) => {
    const state = get();
    const { currentAgentId, agentConfigs } = state;
    if (!currentAgentId) return;

    const updatedAgentConfigs = agentConfigs.map((config) => {
      if (config.id !== currentAgentId) {
        return config;
      }

      const overrides: VisibilityOverrides = { ...(config.visibilityOverrides ?? {}) };
      const modelOverrides: ModelVisibilityOverrides = overrides[modelId]
        ? {
            excludedTableIds: [...overrides[modelId].excludedTableIds],
            excludedColumnIds: [...overrides[modelId].excludedColumnIds],
          }
        : { excludedTableIds: [], excludedColumnIds: [] };

      if (included) {
        modelOverrides.excludedTableIds = modelOverrides.excludedTableIds.filter((id) => id !== tableId);
        // When re-including a table, clear any column overrides for that table to avoid stale entries
        const table = state.models
          .find((m) => m.id === modelId)
          ?.tables.find((t) => t.id === tableId);
        if (table) {
          const columnIds = table.columns.map((c) => c.id);
          modelOverrides.excludedColumnIds = modelOverrides.excludedColumnIds.filter(
            (id) => !columnIds.includes(id)
          );
        }
      } else {
        if (!modelOverrides.excludedTableIds.includes(tableId)) {
          modelOverrides.excludedTableIds.push(tableId);
        }
        // Also remove any column overrides belonging to the table (redundant when table hidden)
        const table = state.models
          .find((m) => m.id === modelId)
          ?.tables.find((t) => t.id === tableId);
        if (table) {
          const columnIds = new Set(table.columns.map((c) => c.id));
          modelOverrides.excludedColumnIds = modelOverrides.excludedColumnIds.filter(
            (id) => !columnIds.has(id)
          );
        }
      }

      if (modelOverrides.excludedTableIds.length === 0 && modelOverrides.excludedColumnIds.length === 0) {
        delete overrides[modelId];
      } else {
        overrides[modelId] = modelOverrides;
      }

      const visibilityOverrides = Object.keys(overrides).length > 0 ? overrides : undefined;

      return {
        ...config,
        visibilityOverrides,
        updatedAt: new Date().toISOString(),
      };
    });

    set({ agentConfigs: updatedAgentConfigs });
  },

  setColumnInclusion: (modelId, tableId, columnId, included) => {
    const state = get();
    const { currentAgentId, agentConfigs } = state;
    if (!currentAgentId) return;

    const updatedAgentConfigs = agentConfigs.map((config) => {
      if (config.id !== currentAgentId) {
        return config;
      }

      const overrides: VisibilityOverrides = { ...(config.visibilityOverrides ?? {}) };
      const modelOverrides: ModelVisibilityOverrides = overrides[modelId]
        ? {
            excludedTableIds: [...overrides[modelId].excludedTableIds],
            excludedColumnIds: [...overrides[modelId].excludedColumnIds],
          }
        : { excludedTableIds: [], excludedColumnIds: [] };

      // If user is including a column and the table was previously excluded, re-include the table
      if (included && modelOverrides.excludedTableIds.includes(tableId)) {
        modelOverrides.excludedTableIds = modelOverrides.excludedTableIds.filter((id) => id !== tableId);
      }

      if (included) {
        modelOverrides.excludedColumnIds = modelOverrides.excludedColumnIds.filter((id) => id !== columnId);
      } else {
        if (!modelOverrides.excludedColumnIds.includes(columnId)) {
          modelOverrides.excludedColumnIds.push(columnId);
        }
      }

      if (modelOverrides.excludedTableIds.length === 0 && modelOverrides.excludedColumnIds.length === 0) {
        delete overrides[modelId];
      } else {
        overrides[modelId] = modelOverrides;
      }

      const visibilityOverrides = Object.keys(overrides).length > 0 ? overrides : undefined;

      return {
        ...config,
        visibilityOverrides,
        updatedAt: new Date().toISOString(),
      };
    });

    set({ agentConfigs: updatedAgentConfigs });
  },
}));

