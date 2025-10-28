// -------- Enums / Common --------
export type ID = string;

export enum DataSourceType {
  PowerBI = "powerbi",
  SQL = "sql",
  File = "file",
  URL = "url",
}

export enum SyncStatus {
  Idle = "idle",
  Syncing = "syncing",
  Success = "success",
  Error = "error",
}

export enum AnalyzerStatus {
  NotRun = "not_run",
  Queued = "queued",
  Running = "running",
  Success = "success",
  Error = "error",
}

export enum InstructionScope {
  Model = "model",
  Table = "table",
  Column = "column",
}

export enum ReadinessSeverity {
  Info = "info",
  Warn = "warn",
  Blocker = "blocker",
}

// -------- Core Entities --------
export interface DataSource {
  id: ID;
  type: DataSourceType;
  name: string;           // immutable source name
  alias?: string;         // display name user can set
  details: Record<string, any>; // type-specific connection info
  lastSyncAt?: string;
  status: SyncStatus;
}

export interface SemanticModel {
  id: ID;
  sourceId: ID;           // typically a Power BI model source
  name: string;
  versionTag: string;     // "v1", "v2"
  tables: Table[];
  instructions?: Instruction[]; // scope=model
}

export interface Table {
  id: ID;
  name: string;
  columns: Column[];
  instructions?: Instruction[]; // scope=table
}

export interface Column {
  id: ID;
  name: string;
  dataType: string;       // string | number | date | bool etc.
  instructions?: Instruction[]; // scope=column
}

export interface Instruction {
  id: ID;
  scope: InstructionScope;
  targetId: ID;           // modelId | tableId | columnId
  content: string;        // NL instructions
  createdAt: string;
  updatedAt?: string;
}

export enum InstructionChangeType {
  Added = 'added',
  Edited = 'edited',
  Deleted = 'deleted',
}

export interface InstructionHistory {
  id: ID;
  instructionId: ID;
  changeType: InstructionChangeType;
  content: string;        // The content at this point in time
  previousContent?: string; // For edits, what it was before
  timestamp: string;
  targetId: ID;           // The entity this instruction applies to
  scope: InstructionScope;
}

// Analyzer
export interface AnalyzerRun {
  id: ID;
  modelId: ID;
  status: AnalyzerStatus;
  startedAt?: string;
  finishedAt?: string;
  progress?: number;      // 0..1
  summary?: AnalyzerSummary;
  findings?: AnalyzerFinding[];
  errorMessage?: string;
}

export interface AnalyzerSummary {
  readinessScore: number; // 0..100
  tablesAnalyzed: number;
  columnsAnalyzed: number;
  quickWins: number;
  blockers: number;
}

export interface AnalyzerFinding {
  id: ID;
  severity: ReadinessSeverity;
  entityType: "table" | "column" | "model";
  entityId: ID;
  title: string;
  recommendation: string;
}

export enum AgentStatus {
  Draft = 'draft',
  Live = 'live',
  Archived = 'archived',
}

// Versioned agent config (what the user will "publish")
export interface AgentConfig {
  id: ID;
  name: string;
  subheader?: string;    // Optional subheader shown in chat widget
  suggestedPrompts?: string[];  // Up to 3 suggested prompts for chat widget
  modelId: ID;
  versionTag: string;    // v1, v2, etc.
  status: AgentStatus;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  clonedFromId?: ID;
  // denormalized snapshot for portability
  instructionIds: ID[];
  sourceIds: ID[];
}