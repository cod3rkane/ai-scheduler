'use client';

import { memo } from 'react';
import { type ToolCallMessagePartComponent } from '@assistant-ui/react';
import { ToolFallback } from './tool-fallback';
import { ScheduleTimeline } from '../ScheduleTimeline';

export const VisualScheduleTool: ToolCallMessagePartComponent = memo(({
  toolName,
  result,
  status,
}) => {
  return (
    <ToolFallback.Root defaultOpen={true}>
      <ToolFallback.Trigger toolName={toolName} status={status} />
      <ToolFallback.Content>
        {result ? (
          <div className="p-4">
            <ScheduleTimeline data={result as any} />
          </div>
        ) : (
          <div className="p-4 text-muted-foreground animate-pulse">
            Fetching schedule data...
          </div>
        )}
      </ToolFallback.Content>
    </ToolFallback.Root>
  );
});

VisualScheduleTool.displayName = 'VisualScheduleTool';
