"use client";
import type { Todo, TodoFilters, TodoWithChildren } from "@/types/todo";
import { TodoItem } from "./todo-item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useState,
  useOptimistic,
  useTransition,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTodo } from "@/app/actions/todos";
import { toast } from "sonner";

function buildTodoTree(todos: Todo[]): TodoWithChildren[] {
  const todoMap = new Map<string, TodoWithChildren>();

  todos.forEach((todo) => {
    todoMap.set(todo.id, { ...todo, children: [] });
  });

  todoMap.forEach((todo) => {
    if (todo.parent_id !== null) {
      const parentTodo = todoMap.get(todo.parent_id);
      if (parentTodo) {
        parentTodo.children.push(todo);
      }
    }
  });

  const rootTodos: TodoWithChildren[] = [];
  todoMap.forEach((todo) => {
    if (todo.parent_id === null) {
      rootTodos.push(todo);
    }
  });

  return rootTodos;
}

export function TodoList({ todos }: { todos: Todo[] }) {
  const [filter, setFilter] = useState<TodoFilters>("all");
  const [isPending, startTransition] = useTransition();
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (currentTodos, newTitle: string) => {
      const tempTodo: Todo = {
        id: `temp-${Date.now()}`,
        user_id: "temp-user",
        parent_id: null,
        title: newTitle,
        description: null,
        priority: "medium",
        completed: false,
        due_date: null,
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return [tempTodo, ...currentTodos];
    }
  );

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [isPending]);

  const handleQuickAdd = async () => {
    const inputValue = inputRef.current?.value || "";
    const trimmedTitle = inputValue.trim();
    if (trimmedTitle === "") return;

    if(inputRef.current) {
      inputRef.current.value = "";
    }

    startTransition(async () => {
      addOptimisticTodo(trimmedTitle);

      const formData = new FormData();
      formData.append("title", trimmedTitle);
      formData.append("priority", "medium");

      const result = await createTodo(null, formData);
      if (result?.error) {
        toast.error("Failed to create todo. Error: " + result.error);
      }
    });
  };

  const filteredTodos = useMemo(() => {
    return optimisticTodos.filter((todo) => {
      if (todo.parent_id !== null) {
        return true;
      }

      if (filter === "all") return true;
      if (filter === "completed") return todo.completed;
      if (filter === "pending") return !todo.completed;
    });
  }, [optimisticTodos, filter]);

  const nestedTodos = useMemo(() => {
    return buildTodoTree(filteredTodos);
  }, [filteredTodos]);

  if (nestedTodos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No todos found. Create your first todo!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <Input
        ref={inputRef}
        placeholder="Quick add todo..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleQuickAdd();
          }
        }}
        disabled={isPending}
        className="w-full"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Filter: {filter}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setFilter("all")}>
            All Todos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFilter("completed")}>
            Completed Todos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFilter("pending")}>
            Pending Todos
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {nestedTodos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          level={0}
          availableTodos={optimisticTodos}
        />
      ))}
    </div>
  );
}
