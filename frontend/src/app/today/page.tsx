import { TaskView } from "@/components/task-view";

export default function TodayPage() {
  return (
    <TaskView
      view="today"
      title="Today’s Tasks"
      description="Welcome back. Let’s make meaningful progress today."
      heading="Today"
      empty={{
        variant: "tasks",
        title: "Your task list is ready",
        description: "Create your first task and start making progress today.",
        action: "Add your first task",
      }}
    />
  );
}
