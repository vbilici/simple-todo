"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTodo, updateTodo } from "@/app/actions/todos";
import { useState, useActionState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TODO_FORM_MODE, type UpsertTodoFormProps } from "@/types/todo";
import { toast } from "sonner";

export function UpsertTodoForm({
  mode,
  todo,
  open: externalOpen,
  onOpenChange: externalOpenChange,
  triggerButton,
}: UpsertTodoFormProps) {
  const action = mode === TODO_FORM_MODE.UPDATE ? updateTodo : createTodo;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;

  const handleOpenChange = externalOpenChange || setInternalOpen;
  const [dueDate, setDueDate] = useState<Date | undefined>(() => {
    if (mode === TODO_FORM_MODE.UPDATE && todo?.due_date) {
      return new Date(todo.due_date);
    }
    return undefined;
  });
  const [state, formAction, isPending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(
        mode === TODO_FORM_MODE.UPDATE
          ? "Todo updated successfully!"
          : "Todo created successfully!"
      );
      formRef.current?.reset();
      setDueDate(undefined);
      handleOpenChange(false);
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, handleOpenChange, mode]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {externalOpen === undefined && !triggerButton && (
        <DialogTrigger asChild>
          <Button>
            {mode === TODO_FORM_MODE.UPDATE ? "Edit Todo" : "Create Todo"}
          </Button>
        </DialogTrigger>
      )}
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === TODO_FORM_MODE.UPDATE ? "Update Todo" : "Create Todo"}
          </DialogTitle>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="space-y-4">

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              defaultValue={todo?.title}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={todo?.description || ""}
            />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select name="priority" defaultValue={todo?.priority || "medium"}>
              <SelectTrigger id="priority" className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="due_date">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Input
                  id="due_date"
                  name="due_date"
                  type="text"
                  placeholder="Select due date"
                  value={dueDate ? dueDate.toDateString() : ""}
                  readOnly
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          {dueDate && (
            <input
              type="hidden"
              name="due_date"
              value={dueDate.toISOString().split("T")[0]}
            />
          )}
          {mode === TODO_FORM_MODE.UPDATE && todo && (
            <input type="hidden" name="id" value={todo.id} />
          )}

          <Button type="submit" disabled={isPending}>
            {isPending
              ? mode === TODO_FORM_MODE.UPDATE
                ? "Updating ..."
                : "Creating ..."
              : mode === TODO_FORM_MODE.UPDATE
              ? "Update Todo"
              : "Create Todo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
