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
export declare class CronPersistence {
    private filePath;
    private jobs;
    private timers;
    constructor(workspacePath: string);
    private load;
    private save;
    private scheduleJob;
    private executeJob;
    addJob(name: string, schedule: string, command: string, agentId: string): CronJob;
    removeJob(id: string): boolean;
    getJob(id: string): CronJob | undefined;
    listJobs(): CronJob[];
    enableJob(id: string): boolean;
    disableJob(id: string): boolean;
    shutdown(): void;
}
//# sourceMappingURL=cron-persist.d.ts.map