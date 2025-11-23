"use client";
import type { Todo, TodoFilters, TodoWithChildren } from "@/types/todo";
import { TodoItem } from "./todo-item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
  const filteredTodos = todos.filter((todo) => {
    if (todo.parent_id !== null) {
      return true;
    }

    if (filter === "all") return true;
    if (filter === "completed") return todo.completed;
    if (filter === "pending") return !todo.completed;
  });

  const nestedTodos = buildTodoTree(filteredTodos);

  if (nestedTodos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No todos found. Create your first todo!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
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
        <TodoItem key={todo.id} todo={todo} level={0} availableTodos={todos} />
      ))}
    </div>
  );
}
