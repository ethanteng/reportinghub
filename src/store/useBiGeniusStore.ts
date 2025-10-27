import { create } from 'zustand';
import {
  DataSource,
  SemanticModel,
  AnalyzerRun,
  AgentConfig,
  ID,
  Table,
  Column,
} from '../../lib/types';
import { dataSources, model, models, lastAnalyzerRun, agentConfigs } from '../../lib/mockData';

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
  agentConfigs: AgentConfig[];
  
  // UI State
  selectedEntity: SelectedEntity;
  selectedSourceIds: ID[];
  inspectorOpen: boolean;
  
  // Actions
  setDataSources: (sources: DataSource[]) => void;
  updateDataSource: (id: ID, updates: Partial<DataSource>) => void;
  addDataSource: (source: DataSource) => void;
  removeDataSource: (id: ID) => void;
  setModel: (model: SemanticModel) => void;
  setModels: (models: SemanticModel[]) => void;
  updateModel: (modelId: ID, updates: Partial<SemanticModel>) => void;
  setAnalyzerRun: (run: AnalyzerRun | null) => void;
  setSelectedEntity: (entity: SelectedEntity) => void;
  toggleSourceSelection: (id: ID) => void;
  clearSourceSelection: () => void;
  setInspectorOpen: (open: boolean) => void;
  addAgentConfig: (config: AgentConfig) => void;
  
  // Helper to get instruction count
  getInstructionCount: () => number;
}

export const useBiGeniusStore = create<BiGeniusStore>((set, get) => ({
  // Initial data
  dataSources: [...dataSources],
  model: model,
  models: [...models],
  analyzerRun: lastAnalyzerRun,
  agentConfigs: [...agentConfigs],
  
  // Initial UI state
  selectedEntity: null,
  selectedSourceIds: [],
  inspectorOpen: false,
  
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
  
  setAnalyzerRun: (run) => set({ analyzerRun: run }),
  
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
  
  addAgentConfig: (config) =>
    set((state) => ({
      agentConfigs: [...state.agentConfigs, config],
    })),
  
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
}));

