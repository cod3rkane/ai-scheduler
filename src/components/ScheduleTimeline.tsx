import React from 'react';
import { Calendar } from 'lucide-react';

interface Assignment {
  date: string;
  worker_id: number;
  worker_name: string;
  role: string;
}

interface Worker {
  id: number;
  name: string;
  role: string;
}

interface Props {
  data: {
    assignments: Assignment[];
    workers: Worker[];
    dates: string[];
  };
}

export const ScheduleTimeline: React.FC<Props> = ({ data }) => {
  const { assignments, workers, dates } = data;

  if (!dates || dates.length === 0) {
    return (
      <div className="p-8 text-center border rounded-lg bg-muted/50 text-muted-foreground">
        No schedule data available for the selected period.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 font-semibold text-lg">
        <Calendar className="w-5 h-5" />
        <span>Staff Schedule Overview</span>
      </div>
      
      <div className="overflow-x-auto border rounded-xl shadow-sm bg-background">
        <div className="min-w-max">
          {/* Header Row */}
          <div className="grid grid-cols-[180px_repeat(var(--cols),120px)]" style={{ '--cols': dates.length } as any}>
            <div className="sticky left-0 z-10 p-4 font-bold border-b border-r bg-muted/80 backdrop-blur-sm">
              Worker
            </div>
            {dates.map((date) => (
              <div key={date} className="p-4 font-bold border-b text-center bg-muted/30">
                <div className="text-xs uppercase text-muted-foreground">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-sm">
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}

            {/* Worker Rows */}
            {workers.map((worker) => (
              <React.Fragment key={worker.id}>
                <div className="sticky left-0 z-10 p-4 border-b border-r font-medium bg-background/95 backdrop-blur-sm">
                  <div className="text-sm">{worker.name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">{worker.role}</div>
                </div>
                {dates.map((date) => {
                  const assignment = assignments.find(
                    (a) => a.worker_id === worker.id && a.date === date
                  );
                  return (
                    <div
                      key={date}
                      className="p-4 border-b flex justify-center items-center transition-colors hover:bg-muted/5"
                    >
                      {assignment ? (
                        <div 
                          className="h-8 w-full max-w-[80px] bg-blue-100 border border-blue-200 rounded-md flex items-center justify-center text-[10px] font-bold text-blue-700 animate-in fade-in zoom-in duration-300 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                          title={`${worker.name} - ${assignment.role}`}
                        >
                          ASSIGNED
                        </div>
                      ) : (
                        <div className="h-1 w-1 bg-muted rounded-full" />
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
