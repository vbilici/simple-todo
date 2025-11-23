import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TodoList } from "./todo-list";
import { Todo } from "@/types/todo";

// Mock the TodoItem component to simplify testing
vi.mock("./todo-item", () => ({
  TodoItem: ({ todo }: { todo: Todo }) => (
    <div data-testid={`todo-${todo.id}`}>{todo.title}</div>
  ),
}));

// Mock the dropdown components to simplify testing
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <div onClick={onClick} role="menuitem">{children}</div>
  ),
}));

describe("TodoList", () => {
  // Main mock data with mixed scenarios
  const mockTodos: Todo[] = [
    // Completed root todo with a pending child
    {
      id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      user_id: "user-123",
      parent_id: null,
      title: "Completed Root Task",
      description: "This is a completed root task",
      priority: "high",
      completed: true,
      due_date: "2024-12-31",
      tags: ["important", "work"],
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z",
    },
    {
      id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
      user_id: "user-123",
      parent_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      title: "Pending Child of Completed Root",
      description: "Child task that is still pending",
      priority: "medium",
      completed: false,
      due_date: null,
      tags: [],
      created_at: "2024-01-02T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
    },
    // Pending root todo with a completed child
    {
      id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
      user_id: "user-123",
      parent_id: null,
      title: "Pending Root Task",
      description: "This is a pending root task",
      priority: "medium",
      completed: false,
      due_date: "2024-11-30",
      tags: ["personal"],
      created_at: "2024-01-03T00:00:00Z",
      updated_at: "2024-01-10T00:00:00Z",
    },
    {
      id: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
      user_id: "user-123",
      parent_id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
      title: "Completed Child of Pending Root",
      description: "Child task that is completed",
      priority: "low",
      completed: true,
      due_date: null,
      tags: ["quick"],
      created_at: "2024-01-04T00:00:00Z",
      updated_at: "2024-01-05T00:00:00Z",
    },
    // Another pending root todo without children
    {
      id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
      user_id: "user-123",
      parent_id: null,
      title: "Another Pending Root",
      description: null,
      priority: "high",
      completed: false,
      due_date: null,
      tags: [],
      created_at: "2024-01-05T00:00:00Z",
      updated_at: "2024-01-05T00:00:00Z",
    },
    // Another completed root todo without children
    {
      id: "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c",
      user_id: "user-123",
      parent_id: null,
      title: "Another Completed Root",
      description: "Simple completed task",
      priority: "low",
      completed: true,
      due_date: null,
      tags: ["done"],
      created_at: "2024-01-06T00:00:00Z",
      updated_at: "2024-01-07T00:00:00Z",
    },
  ];

  // Empty todos for testing empty state
  const emptyTodos: Todo[] = [];

  

  describe("Rendering", () => {
    it("should show empty message when there are no todos", () => {
      render(<TodoList todos={emptyTodos} />);
      expect(
        screen.getByText("No todos found. Create your first todo!")
      ).toBeInTheDocument();
    });

    it("should render root todos when provided", () => {
      render(<TodoList todos={mockTodos} />);

      // Check for root todos
      expect(
        screen.getByTestId("todo-a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("todo-c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f")
      ).toBeInTheDocument();
    });
  });

  describe("Filter UI", () => {
    it("should show all as the default filter", () => {
      render(<TodoList todos={mockTodos} />);
      expect(screen.getByText("Filter: all")).toBeInTheDocument();
    });

    it("should update button text when filter chaneges", () => {
      render(<TodoList todos={mockTodos} />);

      // initial state
      expect(
        screen.getByRole("button", { name: /filter: all/i })
      ).toBeInTheDocument();

      // Wait for "Completed Todos" to appear
      const completedOption = screen.getByText("Completed Todos"); 
      fireEvent.click(completedOption);

      expect(
        screen.getByRole("button", { name: /filter: completed/i })
      ).toBeInTheDocument();
    });
  });
});
