import {
  AgentConfig, AgentStatus, AnalyzerRun, AnalyzerStatus, Column, DataSource, DataSourceType,
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

// Sales Model (Power BI)
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

const salesModel: SemanticModel = {
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
salesModel.instructions![0].targetId = salesModel.id;

// Warehouse Model (SQL)
const inventoryTable = t("Inventory", [
  c("ProductId", "number"),
  c("ProductName", "string"),
  c("Quantity", "number"),
  c("Location", "string"),
  c("LastUpdated", "date"),
]);

const ordersTable = t("Orders", [
  c("OrderId", "number"),
  c("OrderDate", "date"),
  c("Status", "string"),
  c("TotalAmount", "number"),
]);

const warehouseModel: SemanticModel = {
  id: id(),
  sourceId: dataSources[1].id,
  name: "Warehouse Data Model",
  versionTag: "v1",
  tables: [inventoryTable, ordersTable],
  instructions: [],
};

// Documentation Model (URL)
const documentationTable = t("Articles", [
  c("ArticleId", "number"),
  c("Title", "string"),
  c("Content", "string"),
  c("Category", "string"),
  c("PublishedDate", "date"),
]);

const docsModel: SemanticModel = {
  id: id(),
  sourceId: dataSources[2].id,
  name: "Help Documentation",
  versionTag: "v1",
  tables: [documentationTable],
  instructions: [],
};

// Export all models as an array
export const models: SemanticModel[] = [salesModel, warehouseModel, docsModel];

// Keep backward compatibility - export the first model as "model"
export const model: SemanticModel = salesModel;

// Add table/column-level instructions to Sales Model
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
  modelId: salesModel.id,
  status: AnalyzerStatus.Success,
  startedAt: new Date(Date.now() - 60_000).toISOString(),
  finishedAt: new Date().toISOString(),
  progress: 1,
  summary: {
    readinessScore: 78,
    tablesAnalyzed: salesModel.tables.length,
    columnsAnalyzed: salesModel.tables.reduce((n, t) => n + t.columns.length, 0),
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
const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

export const agentConfigs: AgentConfig[] = [
  {
    id: id(),
    name: "Sales Assistant",
    modelId: salesModel.id,
    versionTag: "v2",
    status: AgentStatus.Live,
    createdAt: lastWeek.toISOString(),
    updatedAt: yesterday.toISOString(),
    publishedAt: yesterday.toISOString(),
    instructionIds: [
      ...(salesModel.instructions ?? []).map(i => i.id),
      salesFastFacts.id,
      marginPctNote.id,
    ],
    sourceIds: [dataSources[0].id, dataSources[1].id, dataSources[2].id],
  },
  {
    id: id(),
    name: "Warehouse Inventory Bot",
    modelId: warehouseModel.id,
    versionTag: "v1",
    status: AgentStatus.Draft,
    createdAt: yesterday.toISOString(),
    updatedAt: now.toISOString(),
    instructionIds: [],
    sourceIds: [dataSources[1].id],
  },
  {
    id: id(),
    name: "Documentation Assistant",
    modelId: docsModel.id,
    versionTag: "v1",
    status: AgentStatus.Draft,
    createdAt: now.toISOString(),
    instructionIds: [],
    sourceIds: [dataSources[2].id],
  },
];