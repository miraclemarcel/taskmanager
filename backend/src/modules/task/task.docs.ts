import type { ModuleDocs } from "../../docs/components";

const SECURITY = [{ ApiKeyAuth: [] }];

const EXAMPLE_TASK = {
  id: "cmf1x2y3z0000abcd1234efgh",
  title: "Buy groceries",
  dueDate: "2026-10-11",
  completed: false,
  createdAt: "2026-10-10T09:15:00.000Z",
  updatedAt: "2026-10-10T09:15:00.000Z",
};

const EXAMPLE_TASK_2 = {
  id: "cmf1x2y3z0001abcd1234ijkl",
  title: "Finish quarterly report",
  dueDate: "2026-10-11",
  completed: true,
  createdAt: "2026-10-10T11:02:41.000Z",
  updatedAt: "2026-10-11T08:47:12.000Z",
};

const EXAMPLE_TASK_3 = {
  id: "cmf1x2y3z0002abcd1234mnop",
  title: "Call the dentist",
  dueDate: null,
  completed: false,
  createdAt: "2026-10-10T16:20:05.000Z",
  updatedAt: "2026-10-10T16:20:05.000Z",
};

const idParam = {
  name: "id",
  in: "path",
  required: true,
  description: "The task's unique identifier (a cuid), as returned in the `id` field when the task was created or listed.",
  schema: { type: "string", minLength: 1 },
  example: "cmf1x2y3z0000abcd1234efgh",
};

const todayParam = {
  name: "today",
  in: "query",
  required: false,
  description: [
    "The caller's **local** calendar date in `YYYY-MM-DD` format.",
    "",
    "\"Today\" depends on the user's time zone, so clients should send the date as the user sees it",
    "(e.g. in JavaScript: `new Date().toLocaleDateString('en-CA')`). It is used to decide which tasks belong to the",
    "*Today* view/count — tasks whose `dueDate` equals this value. If omitted, the server's local date is used,",
    "which may differ from the user's date around midnight.",
  ].join("\n"),
  schema: { type: "string", format: "date", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
  example: "2026-10-11",
};

const taskResponseContent = (example: object) => ({
  "application/json": {
    schema: { $ref: "#/components/schemas/TaskResponse" },
    example: { success: true, data: example },
  },
});

export const taskDocs: ModuleDocs = {
  tags: [
    {
      name: "Tasks",
      description: [
        "Create and manage to-do tasks. A task has a title, an optional due date (a calendar day, no time) and a completed flag.",
        "",
        "**Typical workflow**",
        "1. **Create** a task with `POST /api/v1/tasks` (title required, due date optional).",
        "2. **List** tasks with `GET /api/v1/tasks`, choosing a `view`: `all`, `today` (due on the caller's `today` date, completed or not) or `completed`. Narrow results further with `search` (case-insensitive match on title).",
        "3. **Edit** a task's title, due date or completion with `PATCH /api/v1/tasks/{id}`.",
        "4. **Toggle** completion in one click with `PATCH /api/v1/tasks/{id}/toggle` — no body needed.",
        "5. **Delete** a task permanently with `DELETE /api/v1/tasks/{id}`.",
        "",
        "**Dashboard cards** — `GET /api/v1/tasks/summary` returns the counts (`all`, `today`, `completed`, `pending`) shown on the dashboard. Re-fetch it after any create, update, toggle or delete so the cards stay in sync with the list.",
        "",
        "**Dates** — `dueDate` is a plain calendar day (`YYYY-MM-DD`) with no time zone. Because \"today\" differs between time zones, pass the user's local date in the `today` query parameter for the list and summary endpoints.",
      ].join("\n"),
    },
  ],

  paths: {
    "/api/v1/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks",
        description: [
          "Returns tasks matching the selected `view` and optional `search` term, ordered by `createdAt` ascending (oldest first).",
          "",
          "- `view=all` (default) — every task.",
          "- `view=today` — tasks whose `dueDate` equals the `today` parameter (or the server's date if omitted), whether completed or not.",
          "- `view=completed` — tasks with `completed: true`, regardless of due date.",
          "",
          "`search` is applied on top of the view as a case-insensitive substring match on `title`.",
          "`meta.count` is the number of tasks returned in `data`. The list is not paginated.",
        ].join("\n"),
        operationId: "listTasks",
        security: SECURITY,
        parameters: [
          {
            name: "view",
            in: "query",
            required: false,
            description:
              "Which subset of tasks to return. `all` = every task; `today` = due on the `today` date (completed or not); `completed` = completed tasks only.",
            schema: { type: "string", enum: ["all", "today", "completed"], default: "all" },
            example: "today",
          },
          {
            name: "search",
            in: "query",
            required: false,
            description:
              "Optional text to filter by. Matches tasks whose title contains this text, ignoring case (e.g. `report` matches \"Finish quarterly Report\"). Leading/trailing whitespace is ignored; an empty value means no filter.",
            schema: { type: "string", maxLength: 200 },
            example: "report",
          },
          todayParam,
        ],
        responses: {
          "200": {
            description: "Tasks matching the filters, oldest first.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskListResponse" },
                examples: {
                  all: {
                    summary: "view=all",
                    value: { success: true, data: [EXAMPLE_TASK, EXAMPLE_TASK_2, EXAMPLE_TASK_3], meta: { count: 3 } },
                  },
                  today: {
                    summary: "view=today&today=2026-10-11",
                    value: { success: true, data: [EXAMPLE_TASK, EXAMPLE_TASK_2], meta: { count: 2 } },
                  },
                  empty: {
                    summary: "No matches",
                    value: { success: true, data: [], meta: { count: 0 } },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },

      post: {
        tags: ["Tasks"],
        summary: "Create a task",
        description: [
          "Creates a new, not-yet-completed task and returns it.",
          "",
          "- `title` is required; surrounding whitespace is trimmed and the result must be 1–200 characters.",
          "- `dueDate` is optional; send a `YYYY-MM-DD` calendar date, or `null`/omit it for no due date.",
          "- Unknown fields are rejected with `400 VALIDATION_ERROR` (e.g. you cannot set `completed` or `id` on create).",
          "",
          "The new task appears at the end of `GET /api/v1/tasks` (ordered by creation time).",
        ].join("\n"),
        operationId: "createTask",
        security: SECURITY,
        requestBody: {
          required: true,
          description: "The task to create.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTaskInput" },
              examples: {
                withDueDate: { summary: "With a due date", value: { title: "Buy groceries", dueDate: "2026-10-11" } },
                noDueDate: { summary: "Without a due date", value: { title: "Call the dentist" } },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Task created. The body contains the stored task, including its generated `id` and timestamps.",
            content: taskResponseContent(EXAMPLE_TASK),
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },

    "/api/v1/tasks/summary": {
      get: {
        tags: ["Tasks"],
        summary: "Get task counts for the dashboard",
        description: [
          "Returns the counts that power the dashboard summary cards:",
          "",
          "- `all` — total number of tasks.",
          "- `today` — tasks whose `dueDate` equals the `today` parameter (completed or not); matches `GET /api/v1/tasks?view=today`.",
          "- `completed` — tasks with `completed: true`; matches `view=completed`.",
          "- `pending` — tasks not yet completed (`all - completed`).",
          "",
          "Counts ignore any search term. Pass the same `today` value you use for the list so the numbers agree.",
        ].join("\n"),
        operationId: "getTaskSummary",
        security: SECURITY,
        parameters: [todayParam],
        responses: {
          "200": {
            description: "Current task counts.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskSummaryResponse" },
                example: { success: true, data: { all: 3, today: 2, completed: 1, pending: 2 } },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },

    "/api/v1/tasks/{id}": {
      get: {
        tags: ["Tasks"],
        summary: "Get a task",
        description: "Returns a single task by its `id`. Responds `404 NOT_FOUND` if no task has that id (e.g. it was deleted).",
        operationId: "getTask",
        security: SECURITY,
        parameters: [idParam],
        responses: {
          "200": { description: "The requested task.", content: taskResponseContent(EXAMPLE_TASK) },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },

      patch: {
        tags: ["Tasks"],
        summary: "Update a task",
        description: [
          "Partially updates a task. Send only the fields you want to change; omitted fields keep their current values.",
          "",
          "- At least one of `title`, `dueDate` or `completed` must be present, otherwise `400 VALIDATION_ERROR`.",
          "- `title` is trimmed and must be 1–200 characters.",
          "- `dueDate: null` removes the due date; a `YYYY-MM-DD` string sets it.",
          "- Unknown fields (e.g. `id`, `createdAt`) are rejected with `400`.",
          "",
          "`updatedAt` is refreshed on every successful update. To simply flip completion, `PATCH /api/v1/tasks/{id}/toggle` is more convenient.",
        ].join("\n"),
        operationId: "updateTask",
        security: SECURITY,
        parameters: [idParam],
        requestBody: {
          required: true,
          description: "The fields to change.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTaskInput" },
              examples: {
                rename: { summary: "Rename", value: { title: "Buy groceries and snacks" } },
                reschedule: { summary: "Change due date", value: { dueDate: "2026-10-14" } },
                clearDueDate: { summary: "Remove due date", value: { dueDate: null } },
                complete: { summary: "Mark completed", value: { completed: true } },
                multiple: {
                  summary: "Several fields at once",
                  value: { title: "Buy groceries", dueDate: "2026-10-12", completed: false },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Task updated. The body contains the task as stored after the update.",
            content: taskResponseContent({
              ...EXAMPLE_TASK,
              title: "Buy groceries and snacks",
              updatedAt: "2026-10-11T10:05:30.000Z",
            }),
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },

      delete: {
        tags: ["Tasks"],
        summary: "Delete a task",
        description:
          "Permanently deletes a task. This cannot be undone. Responds `204` with an empty body on success, or `404 NOT_FOUND` if the task does not exist (including if it was already deleted).",
        operationId: "deleteTask",
        security: SECURITY,
        parameters: [idParam],
        responses: {
          "204": { description: "Task deleted. No response body." },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },

    "/api/v1/tasks/{id}/toggle": {
      patch: {
        tags: ["Tasks"],
        summary: "Toggle task completion",
        description:
          "Flips the task's `completed` flag (`false` → `true`, `true` → `false`) and returns the updated task. No request body is needed — this is the endpoint behind the checkbox in the task list. Responds `404 NOT_FOUND` if the task does not exist.",
        operationId: "toggleTask",
        security: SECURITY,
        parameters: [idParam],
        responses: {
          "200": {
            description: "Completion toggled. The body contains the updated task.",
            content: taskResponseContent({ ...EXAMPLE_TASK, completed: true, updatedAt: "2026-10-11T10:07:02.000Z" }),
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
  },

  schemas: {
    Task: {
      type: "object",
      description: "A to-do item.",
      required: ["id", "title", "dueDate", "completed", "createdAt", "updatedAt"],
      properties: {
        id: {
          type: "string",
          description: "Unique identifier (cuid) generated by the server. Use it in `/api/v1/tasks/{id}` paths.",
          example: "cmf1x2y3z0000abcd1234efgh",
          readOnly: true,
        },
        title: {
          type: "string",
          minLength: 1,
          maxLength: 200,
          description: "What needs to be done. Stored trimmed; 1–200 characters.",
          example: "Buy groceries",
        },
        dueDate: {
          type: "string",
          format: "date",
          nullable: true,
          description:
            "Calendar day the task is due, as `YYYY-MM-DD` (no time or time zone), or `null` if the task has no due date.",
          example: "2026-10-11",
        },
        completed: {
          type: "boolean",
          description: "Whether the task is done. New tasks start as `false`.",
          example: false,
        },
        createdAt: {
          type: "string",
          format: "date-time",
          description: "When the task was created (UTC, ISO 8601). Lists are ordered by this field, oldest first.",
          example: "2026-10-10T09:15:00.000Z",
          readOnly: true,
        },
        updatedAt: {
          type: "string",
          format: "date-time",
          description: "When the task was last modified (UTC, ISO 8601).",
          example: "2026-10-10T09:15:00.000Z",
          readOnly: true,
        },
      },
      example: EXAMPLE_TASK,
    },

    TaskResponse: {
      type: "object",
      description: "Success envelope containing a single task.",
      required: ["success", "data"],
      properties: {
        success: { type: "boolean", enum: [true], example: true },
        data: { $ref: "#/components/schemas/Task" },
      },
    },

    TaskListResponse: {
      type: "object",
      description: "Success envelope containing a list of tasks plus metadata.",
      required: ["success", "data", "meta"],
      properties: {
        success: { type: "boolean", enum: [true], example: true },
        data: {
          type: "array",
          description: "Matching tasks, ordered by `createdAt` ascending.",
          items: { $ref: "#/components/schemas/Task" },
        },
        meta: {
          type: "object",
          required: ["count"],
          properties: {
            count: { type: "integer", minimum: 0, description: "Number of tasks in `data`.", example: 3 },
          },
        },
      },
    },

    TaskSummary: {
      type: "object",
      description: "Task counts for the dashboard cards.",
      required: ["all", "today", "completed", "pending"],
      properties: {
        all: { type: "integer", minimum: 0, description: "Total number of tasks.", example: 3 },
        today: {
          type: "integer",
          minimum: 0,
          description: "Tasks due on the requested `today` date, completed or not.",
          example: 2,
        },
        completed: { type: "integer", minimum: 0, description: "Tasks marked completed.", example: 1 },
        pending: { type: "integer", minimum: 0, description: "Tasks not yet completed (`all - completed`).", example: 2 },
      },
    },

    TaskSummaryResponse: {
      type: "object",
      description: "Success envelope containing task counts.",
      required: ["success", "data"],
      properties: {
        success: { type: "boolean", enum: [true], example: true },
        data: { $ref: "#/components/schemas/TaskSummary" },
      },
    },

    CreateTaskInput: {
      type: "object",
      description: "Body for creating a task. Unknown fields are rejected.",
      required: ["title"],
      additionalProperties: false,
      properties: {
        title: {
          type: "string",
          minLength: 1,
          maxLength: 200,
          description: "What needs to be done. Whitespace is trimmed before the 1–200 character check, so `\"   \"` is invalid.",
          example: "Buy groceries",
        },
        dueDate: {
          type: "string",
          format: "date",
          nullable: true,
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "Optional due date as a `YYYY-MM-DD` calendar day. Omit or send `null` for no due date.",
          example: "2026-10-11",
        },
      },
      example: { title: "Buy groceries", dueDate: "2026-10-11" },
    },

    UpdateTaskInput: {
      type: "object",
      description: "Body for partially updating a task. Send at least one field; unknown fields are rejected.",
      minProperties: 1,
      additionalProperties: false,
      properties: {
        title: {
          type: "string",
          minLength: 1,
          maxLength: 200,
          description: "New title. Trimmed; must be 1–200 characters after trimming.",
          example: "Buy groceries and snacks",
        },
        dueDate: {
          type: "string",
          format: "date",
          nullable: true,
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "New due date as `YYYY-MM-DD`, or `null` to remove the due date.",
          example: "2026-10-14",
        },
        completed: {
          type: "boolean",
          description: "Set the completion state explicitly.",
          example: true,
        },
      },
      example: { title: "Buy groceries and snacks", dueDate: "2026-10-14" },
    },
  },
};
