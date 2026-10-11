import { TaskView } from "@/components/task-view";

export default function AllTasksPage() {
  return (
    <TaskView
      view="all"
      title="My Tasks"
      description="Welcome back. Let’s make meaningful progress today."
      heading="All Tasks"
      empty={{
        variant: "tasks",
        title: "Your task list is ready",
        description: "Create your first task and start making progress today.",
        action: "Add your first task",
      }}
    />
  );
}
