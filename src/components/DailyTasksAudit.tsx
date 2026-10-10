import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DailyTask } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Flame,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';

interface DailyTasksAuditProps {
  selectedDate: string;
}

export const DailyTasksAudit: React.FC<DailyTasksAuditProps> = ({ selectedDate }) => {
  const { tasks, addTask, updateTaskStatus, deleteTask, getTasksForDate } = useApp();
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskCategory, setNewTaskCategory] = useState<DailyTask['category']>('deep-work');

  const activeTasks = getTasksForDate(selectedDate);

  const completedCount = activeTasks.filter((t) => t.status === 'completed').length;
  const failedCount = activeTasks.filter((t) => t.status === 'failed').length;
  const totalCount = activeTasks.length;
  const executionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, newTaskCategory, selectedDate);
    setNewTaskTitle('');
  };

  return (
    <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-5 sm:p-6 space-y-5">
      {/* Header with Failure / Execution Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-wider font-mono">
              Daily Non-Negotiables & Execution Audit
            </h2>
            {failedCount > 0 ? (
              <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-950/70 border border-rose-800/80 px-2 py-0.5 rounded animate-pulse">
                {failedCount} FAILED
              </span>
            ) : completedCount === totalCount && totalCount > 0 ? (
              <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                100% EXECUTED
              </span>
            ) : (
              <span className="text-[11px] font-mono text-neutral-400">
                {completedCount}/{totalCount} Completed
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 pt-0.5">
            Strict accountability. If you fold on a commitment, you are called out directly. No excuses.
          </p>
        </div>

        {/* Execution Rate Metric */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-xs text-neutral-400 font-mono">Execution Rate</div>
            <div className={`text-xl font-bold font-mono tabular-nums ${failedCount > 0 ? 'text-rose-400' : 'text-neutral-100'}`}>
              {executionRate}%
            </div>
          </div>
        </div>
      </div>

      {/* HARSH FAILURE BANNER IF ANY TASK IS FAILED */}
      {failedCount > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-rose-400 uppercase">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>FAILURE TO EXECUTE DETECTED</span>
          </div>
          <p className="text-xs text-rose-300 leading-relaxed">
            You committed to these standards and quit when friction appeared. Giving up on your declared non-negotiables is a failure of your will, not your circumstances. Face this truth without defense.
          </p>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2.5">
        {activeTasks.map((task) => {
          const isDone = task.status === 'completed';
          const isFailed = task.status === 'failed';

          return (
            <div
              key={task.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isFailed
                  ? 'bg-rose-950/20 border-rose-900/60'
                  : isDone
                  ? 'bg-neutral-950/40 border-neutral-800/60 opacity-80'
                  : 'bg-neutral-950/70 border-neutral-800'
              }`}
            >
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  {/* Status Indicator Icon */}
                  <div className="shrink-0 mt-0.5 sm:mt-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isFailed ? (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-neutral-500" />
                    )}
                  </div>

                  {/* Task details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs sm:text-sm font-medium ${
                          isDone
                            ? 'line-through text-neutral-400'
                            : isFailed
                            ? 'text-rose-200 font-semibold'
                            : 'text-neutral-100'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">
                        · {task.category}
                      </span>
                    </div>

                    {/* Harsh failure message if marked failed */}
                    {isFailed && (
                      <div className="mt-1 text-xs text-rose-400 font-mono">
                        FAILURE: You quit on this task. {task.failureReason || 'Friction defeated your declared intention.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateTaskStatus(task.id, isDone ? 'pending' : 'completed')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isDone
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {isDone ? 'Executed' : 'Execute'}
                  </button>

                  <button
                    onClick={() =>
                      updateTaskStatus(
                        task.id,
                        isFailed ? 'pending' : 'failed',
                        'Weakness accepted over discipline.'
                      )
                    }
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isFailed
                        ? 'bg-rose-900/60 text-rose-200 border border-rose-700'
                        : 'bg-neutral-900 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-300 border border-neutral-800'
                    }`}
                  >
                    {isFailed ? 'Failed ✕' : 'Fail'}
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Task Form */}
      <form onSubmit={handleAddTask} className="pt-2 flex flex-col sm:flex-row items-center gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a daily non-negotiable (e.g. 90-min Deep Code Block)..."
          className="flex-1 w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/80"
        />

        <select
          value={newTaskCategory}
          onChange={(e) => setNewTaskCategory(e.target.value as DailyTask['category'])}
          className="w-full sm:w-auto px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-300 focus:outline-none cursor-pointer"
        >
          <option value="deep-work">Deep Work</option>
          <option value="fitness">Fitness</option>
          <option value="health">Health</option>
          <option value="learning">Learning</option>
          <option value="discipline">Discipline</option>
          <option value="custom">Custom</option>
        </select>

        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Commit</span>
        </button>
      </form>
    </div>
  );
};
