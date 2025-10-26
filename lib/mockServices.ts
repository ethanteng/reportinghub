import {
  AnalyzerRun, AnalyzerStatus, DataSource, ID, Instruction, InstructionScope,
  SemanticModel, SyncStatus
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
  run.findings = [];
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