"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddSubtaskDialogOpen, setIsAddSubtaskDialogOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  if (isDeleted) {
    return null;
  }

  return (
    <>
      <Card className="w-full group" style={{ marginLeft: level * 20 }}>
        <CardHeader className="relative">
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
                  {todo.priority !== "medium" && (
                  <Badge
                    variant={
                      todo.priority === "high" ? "destructive" : "secondary"
                    }
                  >
                    {todo.priority}
                  </Badge>
                  )}
                </div>
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {todo.due_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(todo.due_date), "MMM dd, yyyy")}
                </span>
              )}

              {(todo.children.length > 0 || todo.description) && (
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

            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 bg-background/90 backdrop-blur-sm rounded-md p-1 z-10">
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
          </div>
          {isExpanded && todo.description && (
            <CardDescription>{todo.description}</CardDescription>
          )}
        </CardHeader>

        {todo.tags?.length > 0 && (
          <CardContent>
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
          </CardContent>
        )}
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
                setIsDeleteDialogOpen(false);
                setIsDeleted(true);
                try {
                  await deleteTodo(todo.id);
                  toast.success("Todo deleted successfully");
                } catch (error) {
                  toast.error(
                    "Failed to delete todo. Error: " + (error as Error).message
                  );
                  setIsDeleted(false);
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
