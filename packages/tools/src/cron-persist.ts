import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  command: string;
  agentId: string;
  createdAt: number;
  nextRunAt: number;
  lastRunAt?: number;
  lastError?: string;
  enabled: boolean;
}

export class CronPersistence {
  private filePath: string;
  private jobs: Map<string, CronJob> = new Map();
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor(workspacePath: string) {
    this.filePath = path.join(workspacePath, "cron-jobs.json");
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = JSON.parse(fs.readFileSync(this.filePath, "utf-8")) as CronJob[];
        for (const job of data) {
          this.jobs.set(job.id, job);
          if (job.enabled) this.scheduleJob(job);
        }
      }
    } catch (err) {
      console.error("[cron] Failed to load cron jobs:", err);
    }
  }

  private save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const data = Array.from(this.jobs.values());
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("[cron] Failed to save cron jobs:", err);
    }
  }

  private scheduleJob(job: CronJob): void {
    // Cancel existing timer
    const existing = this.timers.get(job.id);
    if (existing) clearTimeout(existing);

    const delay = Math.max(0, job.nextRunAt - Date.now());
    const timer = setTimeout(() => {
      this.executeJob(job.id);
    }, delay);
    this.timers.set(job.id, timer);
  }

  private async executeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || !job.enabled) return;

    try {
      const { exec } = await import("node:child_process");
      await new Promise<void>((resolve, reject) => {
        exec(job.command, { timeout: 60000, shell: process.platform === "win32" ? "cmd.exe" : "/bin/bash" }, (error, stdout, stderr) => {
          if (error) {
            job.lastError = stderr || error.message;
            reject(error);
          } else {
            job.lastError = undefined;
            resolve();
          }
        });
      });

      job.lastRunAt = Date.now();
    } catch (err) {
      job.lastError = err instanceof Error ? err.message : String(err);
    }

    // Calculate next run
    job.nextRunAt = parseCronNext(job.schedule);
    this.jobs.set(jobId, job);
    this.save();
    this.scheduleJob(job);
  }

  addJob(name: string, schedule: string, command: string, agentId: string): CronJob {
    const id = crypto.randomUUID();
    const job: CronJob = {
      id, name, schedule, command, agentId,
      createdAt: Date.now(),
      nextRunAt: parseCronNext(schedule),
      enabled: true,
    };
    this.jobs.set(id, job);
    this.save();
    this.scheduleJob(job);
    return job;
  }

  removeJob(id: string): boolean {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
    const deleted = this.jobs.delete(id);
    if (deleted) this.save();
    return deleted;
  }

  getJob(id: string): CronJob | undefined {
    return this.jobs.get(id);
  }

  listJobs(): CronJob[] {
    return Array.from(this.jobs.values());
  }

  enableJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;
    job.enabled = true;
    this.jobs.set(id, job);
    this.save();
    this.scheduleJob(job);
    return true;
  }

  disableJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;
    job.enabled = false;
    this.jobs.set(id, job);
    this.save();
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
    return true;
  }

  shutdown(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}

function parseCronNext(cronExpr: string): number {
  // Simple cron parser — supports: * * * * *, */5 * * * *, 0 9 * * *
  const parts = cronExpr.trim().split(/\s+/);
  if (parts.length !== 5) return Date.now() + 3600000; // Default: 1 hour

  const now = new Date();
  const minute = parts[0] ?? "*";
  const hour = parts[1] ?? "*";

  let next = new Date(now);
  next.setSeconds(0);
  next.setMilliseconds(0);

  if (minute !== "*") {
    const m = parseInt(minute.replace("*/", ""), 10);
    if (minute.startsWith("*/")) {
      next.setMinutes(Math.ceil(next.getMinutes() / m) * m);
    } else {
      next.setMinutes(m);
    }
  } else {
    next.setMinutes(next.getMinutes() + 1);
  }

  if (hour !== "*") {
    next.setHours(parseInt(hour, 10));
  }

  if (next <= now) {
    next.setMinutes(next.getMinutes() + 1);
    if (next <= now) next.setHours(next.getHours() + 1);
  }

  return next.getTime();
}