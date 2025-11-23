import { Suspense } from "react";
import { UpsertTodoForm } from "@/components/todos/upsert-todo-form";
import { getTodos } from "@/app/actions/todos";
import { TodoList } from "@/components/todos/todo-list";
import { TODO_FORM_MODE } from "@/types/todo";

export default async function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">My Todos</h2>
        <UpsertTodoForm mode={TODO_FORM_MODE.CREATE} />
        <Suspense fallback={<p>Loading todos...</p>}>
          <TodoListSection />
        </Suspense>
      </div>
    </div>
  );
}

async function TodoListSection() {
  const todos = await getTodos();

  return <TodoList todos={todos} />;
}
