import {
  AgentConfig, AgentStatus, AnalyzerRun, AnalyzerStatus, Column, DataSource, DataSourceType,
  Instruction, InstructionScope, ReadinessSeverity, SemanticModel, SyncStatus, Table, ID,
  InstructionHistory, InstructionChangeType
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

// Add descriptions and synonyms to Sales table columns
salesTable.description = "Contains all sales transactions and order data for revenue analysis";
salesTable.synonyms = ["Orders", "Transactions", "Sales Data"];
salesTable.columns[0].description = "Unique identifier for each sales order";
salesTable.columns[0].synonyms = ["Order Number", "Transaction ID"];
salesTable.columns[4].description = "Total revenue generated from the sale in USD";
salesTable.columns[4].synonyms = ["Sales Amount", "Total Sales", "Income"];
salesTable.columns[6].description = "Profit margin percentage calculated as (Revenue - Cost) / Revenue";
salesTable.synonyms = ["Margin Percent", "Profit Margin", "Gross Margin"];

const customersTable = t("Customers", [
  c("CustomerId", "number"),
  c("CustomerName", "string"),
  c("Segment", "string"),
  c("Country", "string"),
]);

// Add descriptions and synonyms to Customers table
customersTable.description = "Master list of all customers with demographic and segmentation data";
customersTable.synonyms = ["Clients", "Accounts", "Customer Master"];
customersTable.columns[2].description = "Customer segmentation category (Enterprise, SMB, Individual)";
customersTable.columns[2].synonyms = ["Customer Type", "Segment", "Category"];

const salesModel: SemanticModel = {
  id: id(),
  sourceId: dataSources[0].id,
  name: "Contoso Sales Model",
  versionTag: "v1",
  tables: [salesTable, customersTable],
  description: "Primary sales analytics model containing order and customer data for business intelligence",
  synonyms: ["Sales Analytics", "Revenue Model", "Sales DB"],
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
  c("SKU", "string"),
  c("ProductName", "string"),
  c("Category", "string"),
  c("QuantityOnHand", "number"),
  c("ReorderLevel", "number"),
  c("UnitCost", "decimal"),
  c("Location", "string"),
  c("LastStockCheck", "date"),
]);

// Add descriptions and synonyms to Inventory table
inventoryTable.description = "Real-time inventory levels and stock information for all products across warehouse locations";
inventoryTable.synonyms = ["Stock", "Warehouse Stock", "Product Inventory"];
inventoryTable.columns[4].description = "Current quantity of product available in warehouse";
inventoryTable.columns[4].synonyms = ["Stock Level", "Available Quantity", "On Hand"];
inventoryTable.columns[5].description = "Minimum stock level that triggers a reorder";
inventoryTable.columns[5].synonyms = ["Min Stock", "Reorder Point", "Safety Stock"];

const ordersTable = t("Orders", [
  c("OrderId", "number"),
  c("OrderDate", "date"),
  c("Status", "string"),
  c("CustomerId", "number"),
  c("TotalAmount", "number"),
  c("ShippingMethod", "string"),
  c("EstimatedDelivery", "date"),
]);

ordersTable.description = "Order fulfillment tracking and order management data";
ordersTable.synonyms = ["Purchase Orders", "Order Management"];

const shipmentsTable = t("Shipments", [
  c("ShipmentId", "number"),
  c("OrderId", "number"),
  c("TrackingNumber", "string"),
  c("Carrier", "string"),
  c("ShipDate", "date"),
  c("DeliveryDate", "date"),
  c("Status", "string"),
]);

shipmentsTable.description = "Shipment tracking and delivery information";
shipmentsTable.columns[2].description = "Carrier-provided tracking number for package tracking";
shipmentsTable.columns[2].synonyms = ["Tracking Code", "Package Number", "Waybill"];

const warehouseModel: SemanticModel = {
  id: id(),
  sourceId: dataSources[1].id,
  name: "Warehouse Data Model",
  versionTag: "v1",
  tables: [inventoryTable, ordersTable, shipmentsTable],
  description: "Operational data model for warehouse management, inventory tracking, and order fulfillment",
  synonyms: ["Warehouse DB", "Inventory System", "Fulfillment Model"],
  instructions: [
    {
      id: id(),
      scope: InstructionScope.Model,
      targetId: "" as ID,
      content:
        "Focus on inventory levels and fulfillment metrics. Always highlight items below reorder level.",
      createdAt: new Date().toISOString(),
    },
  ],
};
warehouseModel.instructions![0].targetId = warehouseModel.id;

// Documentation Model (URL)
const documentationTable = t("Articles", [
  c("ArticleId", "number"),
  c("Title", "string"),
  c("Content", "string"),
  c("Category", "string"),
  c("Tags", "string"),
  c("Author", "string"),
  c("PublishedDate", "date"),
  c("LastModified", "date"),
  c("ViewCount", "number"),
]);

const faqTable = t("FAQ", [
  c("FAQId", "number"),
  c("Question", "string"),
  c("Answer", "string"),
  c("Category", "string"),
  c("HelpfulCount", "number"),
  c("CreatedDate", "date"),
]);

const searchLogsTable = t("SearchLogs", [
  c("SearchId", "number"),
  c("SearchTerm", "string"),
  c("ResultCount", "number"),
  c("ClickedArticleId", "number"),
  c("SearchDate", "datetime"),
  c("UserId", "string"),
]);

const docsModel: SemanticModel = {
  id: id(),
  sourceId: dataSources[2].id,
  name: "Help Documentation",
  versionTag: "v1",
  tables: [documentationTable, faqTable, searchLogsTable],
  instructions: [
    {
      id: id(),
      scope: InstructionScope.Model,
      targetId: "" as ID,
      content:
        "Prioritize recent and high-view count articles. Use natural language when referencing article titles.",
      createdAt: new Date().toISOString(),
    },
  ],
};
docsModel.instructions![0].targetId = docsModel.id;

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

// Add table/column-level instructions to Warehouse Model
const inventoryInstruction: Instruction = {
  id: id(),
  scope: InstructionScope.Table,
  targetId: inventoryTable.id,
  content:
    "QuantityOnHand represents current stock. Flag items where QuantityOnHand < ReorderLevel as needing restock.",
  createdAt: new Date().toISOString(),
};

const quantityOnHandNote: Instruction = {
  id: id(),
  scope: InstructionScope.Column,
  targetId: inventoryTable.columns.find(c => c.name === "QuantityOnHand")!.id,
  content:
    "Always compare with ReorderLevel. Highlight low stock situations prominently.",
  createdAt: new Date().toISOString(),
};

const shipmentsInstruction: Instruction = {
  id: id(),
  scope: InstructionScope.Table,
  targetId: shipmentsTable.id,
  content:
    "Status values: Pending, Shipped, In Transit, Delivered, Cancelled. Calculate delivery time as DeliveryDate - ShipDate.",
  createdAt: new Date().toISOString(),
};

inventoryTable.instructions = [inventoryInstruction];
inventoryTable.columns.find(c => c.name === "QuantityOnHand")!.instructions = [quantityOnHandNote];
shipmentsTable.instructions = [shipmentsInstruction];

// Add table/column-level instructions to Documentation Model
const articlesInstruction: Instruction = {
  id: id(),
  scope: InstructionScope.Table,
  targetId: documentationTable.id,
  content:
    "ViewCount indicates popularity. Sort by PublishedDate desc for latest content, or by ViewCount desc for most popular.",
  createdAt: new Date().toISOString(),
};

const viewCountNote: Instruction = {
  id: id(),
  scope: InstructionScope.Column,
  targetId: documentationTable.columns.find(c => c.name === "ViewCount")!.id,
  content:
    "High view count (>1000) indicates important articles. Use this as a relevance signal.",
  createdAt: new Date().toISOString(),
};

const faqInstruction: Instruction = {
  id: id(),
  scope: InstructionScope.Table,
  targetId: faqTable.id,
  content:
    "FAQ items are concise Q&A pairs. HelpfulCount shows user ratings. Prioritize FAQs with high helpful counts.",
  createdAt: new Date().toISOString(),
};

const searchLogsInstruction: Instruction = {
  id: id(),
  scope: InstructionScope.Table,
  targetId: searchLogsTable.id,
  content:
    "Analyze search patterns to identify gaps in documentation. Look for searches with low ResultCount.",
  createdAt: new Date().toISOString(),
};

documentationTable.instructions = [articlesInstruction];
documentationTable.columns.find(c => c.name === "ViewCount")!.instructions = [viewCountNote];
faqTable.instructions = [faqInstruction];
searchLogsTable.instructions = [searchLogsInstruction];

// ---- Analyzer Runs (per model) ----

// Sales Model Analysis
export const salesAnalyzerRun: AnalyzerRun = {
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
    narrative:
      'AI interpretation: Sales-focused relational model emphasizing revenue, customer segmentation, and order performance across regions. Ideal for trend analysis and KPI storytelling.',
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

// Warehouse Model Analysis
export const warehouseAnalyzerRun: AnalyzerRun = {
  id: id(),
  modelId: warehouseModel.id,
  status: AnalyzerStatus.Success,
  startedAt: new Date(Date.now() - 120_000).toISOString(),
  finishedAt: new Date(Date.now() - 60_000).toISOString(),
  progress: 1,
  summary: {
    readinessScore: 85,
    tablesAnalyzed: warehouseModel.tables.length,
    columnsAnalyzed: warehouseModel.tables.reduce((n, t) => n + t.columns.length, 0),
    quickWins: 2,
    blockers: 0,
    narrative:
      'AI interpretation: Operational warehouse dataset covering inventory health, fulfillment, and shipping logistics. Optimized for spotting stock risks and delivery delays.',
  },
  findings: [
    {
      id: id(),
      severity: ReadinessSeverity.Warn,
      entityType: "table",
      entityId: ordersTable.id,
      title: "Missing relationship to Shipments table",
      recommendation:
        "Define explicit join on OrderId to enable tracking queries across orders and shipments.",
    },
    {
      id: id(),
      severity: ReadinessSeverity.Warn,
      entityType: "column",
      entityId: inventoryTable.columns.find(c => c.name === "Location")!.id,
      title: "Location values need standardization",
      recommendation:
        "Standardize warehouse location codes (e.g., 'WH-A1', 'WH-B2') to avoid confusion with free-text entries.",
    },
    {
      id: id(),
      severity: ReadinessSeverity.Info,
      entityType: "column",
      entityId: shipmentsTable.columns.find(c => c.name === "Status")!.id,
      title: "Add status transition rules",
      recommendation:
        "Document valid status transitions (e.g., Pending → Shipped → Delivered) to help AI understand shipment lifecycle.",
    },
    {
      id: id(),
      severity: ReadinessSeverity.Info,
      entityType: "table",
      entityId: inventoryTable.id,
      title: "Consider adding supplier information",
      recommendation:
        "Add a Suppliers dimension table to enable supply chain queries and lead time analysis.",
    },
  ],
};

// Documentation Model Analysis
export const docsAnalyzerRun: AnalyzerRun = {
  id: id(),
  modelId: docsModel.id,
  status: AnalyzerStatus.Success,
  startedAt: new Date(Date.now() - 180_000).toISOString(),
  finishedAt: new Date(Date.now() - 120_000).toISOString(),
  progress: 1,
  summary: {
    readinessScore: 92,
    tablesAnalyzed: docsModel.tables.length,
    columnsAnalyzed: docsModel.tables.reduce((n, t) => n + t.columns.length, 0),
    quickWins: 1,
    blockers: 0,
    narrative:
      'AI interpretation: Knowledge base model combining articles, FAQs, and search telemetry. Suited for conversational guidance and content gap discovery.',
  },
  findings: [
    {
      id: id(),
      severity: ReadinessSeverity.Info,
      entityType: "column",
      entityId: documentationTable.columns.find(c => c.name === "Tags")!.id,
      title: "Define tag taxonomy",
      recommendation:
        "Create a controlled vocabulary for tags to improve searchability and categorization consistency.",
    },
    {
      id: id(),
      severity: ReadinessSeverity.Info,
      entityType: "column",
      entityId: searchLogsTable.columns.find(c => c.name === "SearchTerm")!.id,
      title: "Add stemming guidance for search terms",
      recommendation:
        "Document how search term variants should be handled (e.g., 'setup' vs 'set up' vs 'setting up').",
    },
    {
      id: id(),
      severity: ReadinessSeverity.Info,
      entityType: "table",
      entityId: faqTable.id,
      title: "Link FAQs to related articles",
      recommendation:
        "Add a RelatedArticleId field to enable cross-referencing between FAQ answers and detailed articles.",
    },
  ],
};

// Default analyzer run (backward compatibility)
export const lastAnalyzerRun: AnalyzerRun = salesAnalyzerRun;

// ---- Agent Configs (versioned) ----
const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

export const agentConfigs: AgentConfig[] = [
  {
    id: id(),
    name: "Sales Assistant",
    subheader: "Your AI-powered sales analytics expert",
    suggestedPrompts: [
      "What are my top 10 sales by Region?",
      "Who are my best performing Sales Rep?",
      "Show me monthly revenue trends for this year"
    ],
    customInstructions: "You are a sales analytics expert. Always provide insights in a business-friendly tone. When analyzing sales data, focus on actionable recommendations and highlight trends that matter to sales leadership. Format currency values in USD and percentages with 2 decimal places.",
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
    subheader: "Real-time inventory insights at your fingertips",
    suggestedPrompts: [
      "What products are low in stock?",
      "Show me inventory by location"
    ],
    customInstructions: "You are an inventory management specialist. Always alert users to items that are below reorder levels. When providing inventory data, organize by location and highlight any critical stock situations. Use clear, concise language suitable for warehouse operations.",
    modelId: warehouseModel.id,
    versionTag: "v1",
    status: AgentStatus.Draft,
    createdAt: yesterday.toISOString(),
    updatedAt: now.toISOString(),
    instructionIds: [
      ...(warehouseModel.instructions ?? []).map(i => i.id),
      inventoryInstruction.id,
      quantityOnHandNote.id,
      shipmentsInstruction.id,
    ],
    sourceIds: [dataSources[1].id],
  },
  {
    id: id(),
    name: "Documentation Assistant",
    subheader: "Quick answers from your knowledge base",
    suggestedPrompts: [
      "How do I configure user permissions?",
      "What's new in the latest version?",
      "Where can I find troubleshooting guides?"
    ],
    customInstructions: "You are a helpful documentation assistant. Always provide step-by-step instructions when explaining how to do something. Include relevant links to full documentation when available. Keep answers concise but comprehensive, and use a friendly, approachable tone.",
    modelId: docsModel.id,
    versionTag: "v1",
    status: AgentStatus.Draft,
    createdAt: now.toISOString(),
    instructionIds: [
      ...(docsModel.instructions ?? []).map(i => i.id),
      articlesInstruction.id,
      viewCountNote.id,
      faqInstruction.id,
      searchLogsInstruction.id,
    ],
    sourceIds: [dataSources[2].id],
  },
];

// ---- Instruction History (Mock Evolution) ----

// Helper to create timestamps
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const mockInstructionHistory: InstructionHistory[] = [
  // === Sales Model History ===
  
  // Sales Model - Description and synonyms added
  {
    id: id(),
    instructionId: `desc_${salesModel.id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Description: ${salesModel.description}`,
    timestamp: daysAgo(15),
    targetId: salesModel.id,
    scope: InstructionScope.Model,
  },
  {
    id: id(),
    instructionId: `syn_${salesModel.id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Synonyms: ${salesModel.synonyms?.join(', ')}`,
    timestamp: daysAgo(15),
    targetId: salesModel.id,
    scope: InstructionScope.Model,
  },
  
  // Sales Model - Model-level instruction evolution
  {
    id: id(),
    instructionId: salesModel.instructions![0].id,
    changeType: InstructionChangeType.Added,
    content: "Focus on revenue and margin analysis.",
    timestamp: daysAgo(14),
    targetId: salesModel.id,
    scope: InstructionScope.Model,
  },
  {
    id: id(),
    instructionId: salesModel.instructions![0].id,
    changeType: InstructionChangeType.Edited,
    content: "Focus on revenue, margin analysis, and customer segmentation.",
    previousContent: "Focus on revenue and margin analysis.",
    timestamp: daysAgo(10),
    targetId: salesModel.id,
    scope: InstructionScope.Model,
  },
  {
    id: id(),
    instructionId: salesModel.instructions![0].id,
    changeType: InstructionChangeType.Edited,
    content: salesModel.instructions![0].content,
    previousContent: "Focus on revenue, margin analysis, and customer segmentation.",
    timestamp: daysAgo(7),
    targetId: salesModel.id,
    scope: InstructionScope.Model,
  },
  
  // Sales Table - Description and synonyms
  {
    id: id(),
    instructionId: `desc_${salesTable.id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Description: ${salesTable.description}`,
    timestamp: daysAgo(13),
    targetId: salesTable.id,
    scope: InstructionScope.Table,
  },
  {
    id: id(),
    instructionId: `syn_${salesTable.id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Synonyms: ${salesTable.synonyms?.join(', ')}`,
    timestamp: daysAgo(13),
    targetId: salesTable.id,
    scope: InstructionScope.Table,
  },
  
  // Sales Table - KPI instruction
  {
    id: id(),
    instructionId: salesFastFacts.id,
    changeType: InstructionChangeType.Added,
    content: "When asked for KPIs, include Revenue and Cost.",
    timestamp: daysAgo(12),
    targetId: salesTable.id,
    scope: InstructionScope.Table,
  },
  {
    id: id(),
    instructionId: salesFastFacts.id,
    changeType: InstructionChangeType.Edited,
    content: salesFastFacts.content,
    previousContent: "When asked for KPIs, include Revenue and Cost.",
    timestamp: daysAgo(8),
    targetId: salesTable.id,
    scope: InstructionScope.Table,
  },
  
  // Revenue Column - Description and synonyms
  {
    id: id(),
    instructionId: `desc_${salesTable.columns[4].id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Description: ${salesTable.columns[4].description}`,
    timestamp: daysAgo(11),
    targetId: salesTable.columns.find(c => c.name === "Revenue")!.id,
    scope: InstructionScope.Column,
  },
  {
    id: id(),
    instructionId: `syn_${salesTable.columns[4].id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Synonyms: ${salesTable.columns[4].synonyms?.join(', ')}`,
    timestamp: daysAgo(11),
    targetId: salesTable.columns.find(c => c.name === "Revenue")!.id,
    scope: InstructionScope.Column,
  },
  
  // OrderId Column - Description and synonyms
  {
    id: id(),
    instructionId: `desc_${salesTable.columns[0].id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Description: ${salesTable.columns[0].description}`,
    timestamp: daysAgo(10),
    targetId: salesTable.columns.find(c => c.name === "OrderId")!.id,
    scope: InstructionScope.Column,
  },
  {
    id: id(),
    instructionId: `syn_${salesTable.columns[0].id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Synonyms: ${salesTable.columns[0].synonyms?.join(', ')}`,
    timestamp: daysAgo(10),
    targetId: salesTable.columns.find(c => c.name === "OrderId")!.id,
    scope: InstructionScope.Column,
  },
  
  // MarginPct Column - Description first
  {
    id: id(),
    instructionId: `desc_${salesTable.columns[6].id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Description: ${salesTable.columns[6].description}`,
    timestamp: daysAgo(9),
    targetId: salesTable.columns.find(c => c.name === "MarginPct")!.id,
    scope: InstructionScope.Column,
  },
  
  // MarginPct Column
  {
    id: id(),
    instructionId: marginPctNote.id,
    changeType: InstructionChangeType.Added,
    content: "MarginPct is a percentage. Always format as percentage.",
    timestamp: daysAgo(9),
    targetId: salesTable.columns.find(c => c.name === "MarginPct")!.id,
    scope: InstructionScope.Column,
  },
  {
    id: id(),
    instructionId: marginPctNote.id,
    changeType: InstructionChangeType.Edited,
    content: marginPctNote.content,
    previousContent: "MarginPct is a percentage. Always format as percentage.",
    timestamp: daysAgo(6),
    targetId: salesTable.columns.find(c => c.name === "MarginPct")!.id,
    scope: InstructionScope.Column,
  },
  
  // Deleted instruction example (Revenue column - no longer exists)
  {
    id: id(),
    instructionId: "deleted_revenue_instruction" as ID,
    changeType: InstructionChangeType.Added,
    content: "Revenue should always be shown in USD with $ symbol.",
    timestamp: daysAgo(11),
    targetId: salesTable.columns.find(c => c.name === "Revenue")!.id,
    scope: InstructionScope.Column,
  },
  {
    id: id(),
    instructionId: "deleted_revenue_instruction" as ID,
    changeType: InstructionChangeType.Deleted,
    content: "Revenue should always be shown in USD with $ symbol.",
    timestamp: daysAgo(5),
    targetId: salesTable.columns.find(c => c.name === "Revenue")!.id,
    scope: InstructionScope.Column,
  },
  
  // Customers Table - Description and synonyms
  {
    id: id(),
    instructionId: `desc_${customersTable.id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Description: ${customersTable.description}`,
    timestamp: daysAgo(12),
    targetId: customersTable.id,
    scope: InstructionScope.Table,
  },
  {
    id: id(),
    instructionId: `syn_${customersTable.id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Synonyms: ${customersTable.synonyms?.join(', ')}`,
    timestamp: daysAgo(12),
    targetId: customersTable.id,
    scope: InstructionScope.Table,
  },
  
  // Customers Segment Column - Description and synonyms
  {
    id: id(),
    instructionId: `desc_${customersTable.columns[2].id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Description: ${customersTable.columns[2].description}`,
    timestamp: daysAgo(10),
    targetId: customersTable.columns.find(c => c.name === "Segment")!.id,
    scope: InstructionScope.Column,
  },
  {
    id: id(),
    instructionId: `syn_${customersTable.columns[2].id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Synonyms: ${customersTable.columns[2].synonyms?.join(', ')}`,
    timestamp: daysAgo(10),
    targetId: customersTable.columns.find(c => c.name === "Segment")!.id,
    scope: InstructionScope.Column,
  },
  
  // === Warehouse Model History ===
  
  // Warehouse Model - Description and synonyms
  {
    id: id(),
    instructionId: `desc_${warehouseModel.id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Description: ${warehouseModel.description}`,
    timestamp: daysAgo(8),
    targetId: warehouseModel.id,
    scope: InstructionScope.Model,
  },
  {
    id: id(),
    instructionId: `syn_${warehouseModel.id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Synonyms: ${warehouseModel.synonyms?.join(', ')}`,
    timestamp: daysAgo(8),
    targetId: warehouseModel.id,
    scope: InstructionScope.Model,
  },
  
  // Warehouse Model - Model-level
  {
    id: id(),
    instructionId: warehouseModel.instructions![0].id,
    changeType: InstructionChangeType.Added,
    content: "Focus on inventory tracking.",
    timestamp: daysAgo(6),
    targetId: warehouseModel.id,
    scope: InstructionScope.Model,
  },
  {
    id: id(),
    instructionId: warehouseModel.instructions![0].id,
    changeType: InstructionChangeType.Edited,
    content: warehouseModel.instructions![0].content,
    previousContent: "Focus on inventory tracking.",
    timestamp: daysAgo(3),
    targetId: warehouseModel.id,
    scope: InstructionScope.Model,
  },
  
  // Inventory Table - Description and synonyms
  {
    id: id(),
    instructionId: `desc_${inventoryTable.id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Description: ${inventoryTable.description}`,
    timestamp: daysAgo(7),
    targetId: inventoryTable.id,
    scope: InstructionScope.Table,
  },
  {
    id: id(),
    instructionId: `syn_${inventoryTable.id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Synonyms: ${inventoryTable.synonyms?.join(', ')}`,
    timestamp: daysAgo(7),
    targetId: inventoryTable.id,
    scope: InstructionScope.Table,
  },
  
  // Inventory Table
  {
    id: id(),
    instructionId: inventoryInstruction.id,
    changeType: InstructionChangeType.Added,
    content: inventoryInstruction.content,
    timestamp: daysAgo(5),
    targetId: inventoryTable.id,
    scope: InstructionScope.Table,
  },
  
  // QuantityOnHand Column - Description and synonyms
  {
    id: id(),
    instructionId: `desc_${inventoryTable.columns[4].id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Description: ${inventoryTable.columns[4].description}`,
    timestamp: daysAgo(6),
    targetId: inventoryTable.columns.find(c => c.name === "QuantityOnHand")!.id,
    scope: InstructionScope.Column,
  },
  {
    id: id(),
    instructionId: `syn_${inventoryTable.columns[4].id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Synonyms: ${inventoryTable.columns[4].synonyms?.join(', ')}`,
    timestamp: daysAgo(6),
    targetId: inventoryTable.columns.find(c => c.name === "QuantityOnHand")!.id,
    scope: InstructionScope.Column,
  },
  
  // ReorderLevel Column - Description and synonyms
  {
    id: id(),
    instructionId: `desc_${inventoryTable.columns[5].id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Description: ${inventoryTable.columns[5].description}`,
    timestamp: daysAgo(5),
    targetId: inventoryTable.columns.find(c => c.name === "ReorderLevel")!.id,
    scope: InstructionScope.Column,
  },
  {
    id: id(),
    instructionId: `syn_${inventoryTable.columns[5].id}` as ID,
    changeType: InstructionChangeType.Edited,
    content: `Synonyms: ${inventoryTable.columns[5].synonyms?.join(', ')}`,
    previousContent: "Synonyms: Min Stock, Reorder Point",
    timestamp: daysAgo(4),
    targetId: inventoryTable.columns.find(c => c.name === "ReorderLevel")!.id,
    scope: InstructionScope.Column,
  },
  
  // QuantityOnHand Column
  {
    id: id(),
    instructionId: quantityOnHandNote.id,
    changeType: InstructionChangeType.Added,
    content: "Compare with ReorderLevel to identify low stock.",
    timestamp: daysAgo(4),
    targetId: inventoryTable.columns.find(c => c.name === "QuantityOnHand")!.id,
    scope: InstructionScope.Column,
  },
  {
    id: id(),
    instructionId: quantityOnHandNote.id,
    changeType: InstructionChangeType.Edited,
    content: quantityOnHandNote.content,
    previousContent: "Compare with ReorderLevel to identify low stock.",
    timestamp: hoursAgo(48),
    targetId: inventoryTable.columns.find(c => c.name === "QuantityOnHand")!.id,
    scope: InstructionScope.Column,
  },
  
  // Shipments Table - Description
  {
    id: id(),
    instructionId: `desc_${shipmentsTable.id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Description: ${shipmentsTable.description}`,
    timestamp: hoursAgo(48),
    targetId: shipmentsTable.id,
    scope: InstructionScope.Table,
  },
  
  // TrackingNumber Column - Description and synonyms
  {
    id: id(),
    instructionId: `desc_${shipmentsTable.columns[2].id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Description: ${shipmentsTable.columns[2].description}`,
    timestamp: hoursAgo(40),
    targetId: shipmentsTable.columns.find(c => c.name === "TrackingNumber")!.id,
    scope: InstructionScope.Column,
  },
  {
    id: id(),
    instructionId: `syn_${shipmentsTable.columns[2].id}` as ID,
    changeType: InstructionChangeType.Added,
    content: `Synonyms: ${shipmentsTable.columns[2].synonyms?.join(', ')}`,
    timestamp: hoursAgo(40),
    targetId: shipmentsTable.columns.find(c => c.name === "TrackingNumber")!.id,
    scope: InstructionScope.Column,
  },
  
  // Shipments Table
  {
    id: id(),
    instructionId: shipmentsInstruction.id,
    changeType: InstructionChangeType.Added,
    content: shipmentsInstruction.content,
    timestamp: hoursAgo(36),
    targetId: shipmentsTable.id,
    scope: InstructionScope.Table,
  },
  
  // === Documentation Model History ===
  
  // Documentation Model - Model-level
  {
    id: id(),
    instructionId: docsModel.instructions![0].id,
    changeType: InstructionChangeType.Added,
    content: "Focus on helping users find relevant documentation.",
    timestamp: hoursAgo(72),
    targetId: docsModel.id,
    scope: InstructionScope.Model,
  },
  {
    id: id(),
    instructionId: docsModel.instructions![0].id,
    changeType: InstructionChangeType.Edited,
    content: docsModel.instructions![0].content,
    previousContent: "Focus on helping users find relevant documentation.",
    timestamp: hoursAgo(24),
    targetId: docsModel.id,
    scope: InstructionScope.Model,
  },
  
  // Articles Table
  {
    id: id(),
    instructionId: articlesInstruction.id,
    changeType: InstructionChangeType.Added,
    content: articlesInstruction.content,
    timestamp: hoursAgo(60),
    targetId: documentationTable.id,
    scope: InstructionScope.Table,
  },
  
  // ViewCount Column
  {
    id: id(),
    instructionId: viewCountNote.id,
    changeType: InstructionChangeType.Added,
    content: "High view count indicates important articles.",
    timestamp: hoursAgo(48),
    targetId: documentationTable.columns.find(c => c.name === "ViewCount")!.id,
    scope: InstructionScope.Column,
  },
  {
    id: id(),
    instructionId: viewCountNote.id,
    changeType: InstructionChangeType.Edited,
    content: viewCountNote.content,
    previousContent: "High view count indicates important articles.",
    timestamp: hoursAgo(12),
    targetId: documentationTable.columns.find(c => c.name === "ViewCount")!.id,
    scope: InstructionScope.Column,
  },
  
  // FAQ Table
  {
    id: id(),
    instructionId: faqInstruction.id,
    changeType: InstructionChangeType.Added,
    content: faqInstruction.content,
    timestamp: hoursAgo(36),
    targetId: faqTable.id,
    scope: InstructionScope.Table,
  },
  
  // SearchLogs Table
  {
    id: id(),
    instructionId: searchLogsInstruction.id,
    changeType: InstructionChangeType.Added,
    content: "Track search patterns to identify documentation gaps.",
    timestamp: hoursAgo(24),
    targetId: searchLogsTable.id,
    scope: InstructionScope.Table,
  },
  {
    id: id(),
    instructionId: searchLogsInstruction.id,
    changeType: InstructionChangeType.Edited,
    content: searchLogsInstruction.content,
    previousContent: "Track search patterns to identify documentation gaps.",
    timestamp: hoursAgo(6),
    targetId: searchLogsTable.id,
    scope: InstructionScope.Table,
  },
  
  // Recent addition example
  {
    id: id(),
    instructionId: "recent_addition" as ID,
    changeType: InstructionChangeType.Added,
    content: "When referencing timestamps, always use user's local timezone.",
    timestamp: hoursAgo(2),
    targetId: documentationTable.columns.find(c => c.name === "PublishedDate")!.id,
    scope: InstructionScope.Column,
  },
];