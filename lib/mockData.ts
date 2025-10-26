import {
  AgentConfig, AnalyzerRun, AnalyzerStatus, Column, DataSource, DataSourceType,
  Instruction, InstructionScope, ReadinessSeverity, SemanticModel, SyncStatus, Table, ID
} from "./types";

const id = (() => { let n = 0; return () => `id_${++n}` as ID; })();

// ---- Data Sources ----
export const dataSources: DataSource[] = [
  {
    id: id(),
    type: DataSourceType.PowerBI,
    name: "Contoso Sales Model",
    alias: "Sales Model (Prod)",
    details: { workspace: "Sales", dataset: "Sales Core" },
    lastSyncAt: new Date().toISOString(),
    status: SyncStatus.Success,
  },
  {
    id: id(),
    type: DataSourceType.SQL,
    name: "Warehouse (read-only)",
    details: { host: "sql.contoso.com", db: "dwh", schema: "dbo" },
    status: SyncStatus.Idle,
  },
  {
    id: id(),
    type: DataSourceType.URL,
    name: "Help Docs",
    alias: "Docs",
    details: { url: "https://docs.contoso.com/reporting" },
    status: SyncStatus.Success,
  },
];

// ---- Semantic Model (Power BI) ----
const c = (name: string, dataType: string): Column => ({ id: id(), name, dataType });
const t = (name: string, columns: Column[]): Table => ({ id: id(), name, columns });

const salesTable = t("Sales", [
  c("OrderId", "number"),
  c("OrderDate", "date"),
  c("CustomerId", "number"),
  c("Region", "string"),
  c("Revenue", "number"),
  c("Cost", "number"),
  c("MarginPct", "number"),
]);

const customersTable = t("Customers", [
  c("CustomerId", "number"),
  c("CustomerName", "string"),
  c("Segment", "string"),
  c("Country", "string"),
]);

export const model: SemanticModel = {
  id: id(),
  sourceId: dataSources[0].id,
  name: "Contoso Sales Model",
  versionTag: "v1",
  tables: [salesTable, customersTable],
  instructions: [
    {
      id: id(),
      scope: InstructionScope.Model,
      targetId: "", // filled below with model.id
      content:
        "Prefer currency formats in USD. Summarize monthly trends and call out significant YoY changes.",
      createdAt: new Date().toISOString(),
    },
  ],
};
model.instructions![0].targetId = model.id;

// Add table/column-level instructions
const salesFastFacts: Instruction = {
  id: id(),
  scope: InstructionScope.Table,
  targetId: salesTable.id,
  content:
    "When asked for KPIs, include Revenue, Cost, and MarginPct. MarginPct is (Revenue - Cost)/Revenue.",
  createdAt: new Date().toISOString(),
};

const marginPctNote: Instruction = {
  id: id(),
  scope: InstructionScope.Column,
  targetId: salesTable.columns.find(c => c.name === "MarginPct")!.id,
  content:
    "MarginPct is a percentage (0–100). Round to 1 decimal place in answers.",
  createdAt: new Date().toISOString(),
};

salesTable.instructions = [salesFastFacts];
salesTable.columns.find(c => c.name === "MarginPct")!.instructions = [marginPctNote];

// ---- Analyzer (last run, optional seed) ----
export const lastAnalyzerRun: AnalyzerRun = {
  id: id(),
  modelId: model.id,
  status: AnalyzerStatus.Success,
  startedAt: new Date(Date.now() - 60_000).toISOString(),
  finishedAt: new Date().toISOString(),
  progress: 1,
  summary: {
    readinessScore: 78,
    tablesAnalyzed: model.tables.length,
    columnsAnalyzed: model.tables.reduce((n, t) => n + t.columns.length, 0),
    quickWins: 3,
    blockers: 1,
  },
  findings: [
    {
      id: id(),
      severity: ReadinessSeverity.Blocker,
      entityType: "table",
      entityId: customersTable.id,
      title: "Missing join between Customers and Sales",
      recommendation:
        "Define relationship on CustomerId or create a view that enforces referential integrity.",
    },
    {
      id: id(),
      severity: ReadinessSeverity.Warn,
      entityType: "column",
      entityId: salesTable.columns.find(c => c.name === "Region")!.id,
      title: "Inconsistent Region values",
      recommendation:
        "Normalize Region spelling (e.g., 'US', 'USA', 'United States') or provide a mapping.",
    },
    {
      id: id(),
      severity: ReadinessSeverity.Info,
      entityType: "column",
      entityId: salesTable.columns.find(c => c.name === "OrderDate")!.id,
      title: "Consider a Calendar table",
      recommendation:
        "Add a Date dimension to improve time-series queries and YoY calculations.",
    },
  ],
};

// ---- Agent Configs (versioned) ----
export const agentConfigs: AgentConfig[] = [
  {
    id: id(),
    name: "Sales Assistant",
    modelId: model.id,
    versionTag: "v1",
    createdAt: new Date().toISOString(),
    instructionIds: [
      ...(model.instructions ?? []).map(i => i.id),
      salesFastFacts.id,
      marginPctNote.id,
    ],
    sourceIds: [dataSources[0].id, dataSources[2].id],
  },
];