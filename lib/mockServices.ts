import {
  AnalyzerRun, AnalyzerStatus, DataSource, ID, Instruction, InstructionScope,
  SemanticModel, SyncStatus, ReadinessSeverity, AnalyzerFinding
} from "./types";
import { dataSources, model } from "./mockData";

// simulate latency
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function syncDataSource(sourceId: ID): Promise<DataSource> {
  const src = dataSources.find(s => s.id === sourceId);
  if (!src) throw new Error("Source not found");
  src.status = SyncStatus.Syncing;
  await sleep(800);
  // pretend success every time
  src.status = SyncStatus.Success;
  src.lastSyncAt = new Date().toISOString();
  return src;
}

export async function runAnalyzer(modelRef: SemanticModel, onProgress?: (p: number) => void): Promise<AnalyzerRun> {
  const run: AnalyzerRun = {
    id: `an_${Date.now()}` as ID,
    modelId: modelRef.id,
    status: AnalyzerStatus.Queued,
    startedAt: new Date().toISOString(),
    progress: 0,
  };
  run.status = AnalyzerStatus.Running;

  for (let i = 1; i <= 5; i++) {
    await sleep(400);
    run.progress = i / 5;
    onProgress?.(run.progress);
  }

  // fabricate a simple summary
  run.status = AnalyzerStatus.Success;
  run.finishedAt = new Date().toISOString();
  run.progress = 1;
  run.summary = {
    readinessScore: 80 + Math.floor(Math.random() * 5), // 80–84
    tablesAnalyzed: modelRef.tables.length,
    columnsAnalyzed: modelRef.tables.reduce((n, t) => n + t.columns.length, 0),
    quickWins: 2,
    blockers: 0,
  };
  
  // Generate sample findings
  const findings: AnalyzerFinding[] = [];
  
  // Add findings based on the model structure
  if (modelRef.tables.length > 0) {
    const firstTable = modelRef.tables[0];
    
    // Quick Win - Add description
    findings.push({
      id: `f_${Date.now()}_1` as ID,
      severity: ReadinessSeverity.Info,
      entityType: "table",
      entityId: firstTable.id,
      title: `Consider adding description for ${firstTable.name}`,
      recommendation: "Table descriptions help the AI understand the business context and generate better queries.",
    });
    
    // Quick Win - Add synonyms
    if (firstTable.columns.length > 0) {
      const firstColumn = firstTable.columns[0];
      findings.push({
        id: `f_${Date.now()}_2` as ID,
        severity: ReadinessSeverity.Info,
        entityType: "column",
        entityId: firstColumn.id,
        title: `Add business-friendly synonyms for ${firstColumn.name}`,
        recommendation: `Consider adding synonyms like "${firstColumn.name.toLowerCase()}", "number", or domain-specific terms to improve query accuracy.`,
      });
    }
  }
  
  // Add a warning if model has multiple tables
  if (modelRef.tables.length > 1) {
    findings.push({
      id: `f_${Date.now()}_3` as ID,
      severity: ReadinessSeverity.Warn,
      entityType: "model",
      entityId: modelRef.id,
      title: "Define relationships between tables",
      recommendation: "Explicitly define foreign key relationships to help the AI understand how tables join together.",
    });
  }
  
  run.findings = findings;
  return run;
}

export function addInstruction(
  scope: InstructionScope,
  targetId: ID,
  content: string
): Instruction {
  const instruction: Instruction = {
    id: `inst_${Date.now()}` as ID,
    scope,
    targetId,
    content,
    createdAt: new Date().toISOString(),
  };
  // caller is responsible for inserting into model/table/column collection
  return instruction;
}