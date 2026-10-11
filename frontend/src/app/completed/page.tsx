import { TaskView } from "@/components/task-view";

export default function CompletedPage() {
  return (
    <TaskView
      view="completed"
      title="Completed Tasks"
      description="A clear view of everything you’ve accomplished."
      heading="Completed"
      empty={{
        variant: "completed",
        title: "No completed tasks yet",
        description: "Complete a task and it will appear here for easy reference.",
      }}
    />
  );
}
