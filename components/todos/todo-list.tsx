'use client'
import type { Todo, TodoWithChildren }  from '@/types/todo';
import { TodoItem } from './todo-item';

function buildTodoTree(todos: Todo[]): TodoWithChildren[] {
  const todoMap = new Map<string, TodoWithChildren>()

  todos.forEach(todo => {
    todoMap.set(todo.id, {...todo, children: []});
  });

  todoMap.forEach(todo => {
    if (todo.parent_id !== null) {
      const parentTodo = todoMap.get(todo.parent_id);
      if (parentTodo) {
        parentTodo.children.push(todo);
      }
    }
  });

  const rootTodos: TodoWithChildren[] = [];
  todoMap.forEach(todo => {
    if(todo.parent_id === null) {
      rootTodos.push(todo);
    }
  })

  return rootTodos;
}

export function TodoList({todos}: {todos: Todo[]}) {
  const nestedTodos = buildTodoTree(todos);

  if (nestedTodos.length === 0) {
    return <p className="text-sm text-muted-foreground">No todos found. Create your first todo!</p>;
  }
  
  return (
    <div className="flex flex-col gap-4 w-full">
      {nestedTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} level={0} availableTodos={todos}/>
      ))}
    </div>
  );
}