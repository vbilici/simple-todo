"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
  CardFooter,
} from "../ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Todo, TODO_FORM_MODE, type TodoWithChildren } from "@/types/todo";
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Tag,
  Trash2,
  Edit,
  Plus,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteTodo, toggleTodo } from "@/app/actions/todos";
import { format } from "date-fns";
import { UpsertTodoForm } from "./upsert-todo-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function TodoItem({
  todo,
  level,
  availableTodos,
}: {
  todo: TodoWithChildren;
  level: number;
  availableTodos?: Todo[];
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddSubtaskDialogOpen, setIsAddSubtaskDialogOpen] = useState(false);

  return (
    <>
      <Card className="w-full group" style={{ marginLeft: level * 20 }}>
        <CardHeader>
          <div className="flex items-start gap-3 justify-between">
            <div className="flex items-start gap-2">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={async (checked) => {
                  try {
                    await toggleTodo(todo.id, checked as boolean);
                    toast.success("Todo updated successfully");
                  } catch (error) {
                    toast.error(
                      "Failed to update todo. Error: " +
                        (error as Error).message
                    );
                  }
                }}
              />
              <CardTitle
                className={
                  todo.completed ? "line-through text-muted-foreground" : ""
                }
              >
                <div className="flex items-center gap-2">
                  <span>{todo.title}</span>
                  <Badge
                    variant={
                      todo.priority === "high"
                        ? "destructive"
                        : todo.priority === "medium"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {todo.priority}
                  </Badge>
                </div>
              </CardTitle>
            </div>
            {todo.children.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          {todo.description && (
            <CardDescription>{todo.description}</CardDescription>
          )}

          {todo.due_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(todo.due_date), "MMM dd, yyyy")}
            </span>
          )}
        </CardHeader>

        <CardContent>
          {todo.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {todo.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Tag className="h-4 w-4" /> {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddSubtaskDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
            </Button>
          </div>
        </CardFooter>
      </Card>
          {isExpanded &&
            todo.children.length > 0 &&
            todo.children.map((childTodo) => (
              <TodoItem
                key={childTodo.id}
                todo={childTodo}
                level={level + 1}
                availableTodos={availableTodos}
              />
            ))}
      <UpsertTodoForm
        mode={TODO_FORM_MODE.UPDATE}
        todo={todo}
        availableTodos={availableTodos}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <UpsertTodoForm
        mode={TODO_FORM_MODE.CREATE}
        open={isAddSubtaskDialogOpen}
        onOpenChange={setIsAddSubtaskDialogOpen}
        parentId={todo.id}
        availableTodos={availableTodos}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{todo.title}&quot;? This
              action cannot be undone
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await deleteTodo(todo.id);
                  setIsDeleteDialogOpen(false);
                  toast.success("Todo deleted successfully");
                } catch (error) {
                  toast.error(
                    "Failed to delete todo. Error: " + (error as Error).message
                  );
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
