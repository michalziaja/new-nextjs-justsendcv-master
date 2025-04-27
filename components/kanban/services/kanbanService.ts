import { createClient } from "@/utils/supabase/client";
import { KanbanBoard, Task, TaskStatus, Column } from "../types";
// import { v4 as uuidv4 } from "uuid";

// Interfejs dla danych tablicy Kanban przechowywanych w Supabase
export interface KanbanBoardData {
  id: string;
  name: string;
  user_id: string;
  columns: Record<string, {
    title: string;
    tasks: Record<string, Task>;
  }>;
  column_order: TaskStatus[];
  created_at: string;
  updated_at: string;
}

// Konwersja danych z formatu Supabase do formatu używanego przez komponenty
export const mapSupabaseToKanbanBoard = (data: KanbanBoardData): KanbanBoard => {
  const tasks: Record<string, Task> = {};
  const columns: Record<string, Column> = {};

  // Mapowanie kolumn i zadań
  Object.entries(data.columns).forEach(([columnId, columnData]) => {
    // Dodaj wszystkie zadania do wspólnej puli
    Object.entries(columnData.tasks).forEach(([taskId, task]) => {
      tasks[taskId] = task;
    });

    // Mapuj kolumnę
    columns[columnId as TaskStatus] = {
      id: columnId as TaskStatus,
      title: columnData.title,
      taskIds: Object.keys(columnData.tasks || {})
    };
  });

  return {
    tasks,
    columns,
    columnOrder: data.column_order
  };
};

// Konwersja danych z formatu używanego przez komponenty do formatu Supabase
export const mapKanbanBoardToSupabase = (board: KanbanBoard): Partial<KanbanBoardData> => {
  const columns: Record<string, { title: string; tasks: Record<string, Task> }> = {};

  // Dla każdej kolumny, utwórz odpowiednią strukturę
  Object.entries(board.columns).forEach(([columnId, column]) => {
    const columnTasks: Record<string, Task> = {};
    
    // Dodaj zadania należące do tej kolumny
    column.taskIds.forEach(taskId => {
      if (board.tasks[taskId]) {
        columnTasks[taskId] = board.tasks[taskId];
      }
    });

    columns[columnId] = {
      title: column.title,
      tasks: columnTasks
    };
  });

  return {
    columns,
    column_order: board.columnOrder
  };
};

// Pobranie lub utworzenie tablicy Kanban
export const getOrCreateKanbanBoard = async (): Promise<KanbanBoard> => {
  const supabase = createClient();
  
  // Pobierz dane użytkownika
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nie znaleziono użytkownika");
  
  // Sprawdź czy istnieje tablica dla użytkownika
  const { data: boards, error } = await supabase
    .from("kanban_boards")
    .select("*")
    .eq("user_id", user.id)
    .limit(1);
  
  if (error) {
    console.error("Błąd podczas pobierania tablicy Kanban:", error);
    throw error;
  }
  
  // Jeśli tablica istnieje, zwróć ją
  if (boards && boards.length > 0) {
    return mapSupabaseToKanbanBoard(boards[0] as KanbanBoardData);
  }
  
  // Jeśli nie istnieje, utwórz nową tablicę
  const initialTasks: Record<string, Task> = {
    "task-1": {
      id: "task-1",
      title: "Przygotować CV",
      description: "Zaktualizować CV o najnowsze doświadczenia",
      priority: "high",
      status: "todo",
      createdAt: new Date().toISOString(),
      tags: ["CV"],
    },
    "task-2": {
      id: "task-2",
      title: "Wysłać aplikację",
      description: "Aplikować na wybrane stanowisko",
      priority: "medium",
      status: "todo",
      createdAt: new Date().toISOString(),
      tags: ["Aplikacja"],
    }
  };

  // Początkowe kolumny
  const initialColumns: Record<string, Column> = {
    todo: {
      id: "todo",
      title: "Do zrobienia",
      taskIds: ["task-1", "task-2"],
    },
    "in-progress": {
      id: "in-progress",
      title: "W trakcie",
      taskIds: [],
    },
    done: {
      id: "done",
      title: "Ukończone",
      taskIds: [],
    }
  };

  // Początkowa kolejność kolumn
  const initialColumnOrder: TaskStatus[] = ["todo", "in-progress", "done"];

  const initialBoard: KanbanBoard = {
    tasks: initialTasks,
    columns: initialColumns,
    columnOrder: initialColumnOrder,
  };

  // Konwertuj do formatu Supabase
  const supabaseData = mapKanbanBoardToSupabase(initialBoard);
  
  // Utwórz nową tablicę w bazie danych
  const { data: newBoard, error: createError } = await supabase
    .from("kanban_boards")
    .insert({
      user_id: user.id,
      name: "Moja tablica Kanban",
      ...supabaseData
    })
    .select()
    .single();
  
  if (createError) {
    console.error("Błąd podczas tworzenia tablicy Kanban:", createError);
    throw createError;
  }
  
  return initialBoard;
};

// Aktualizacja tablicy Kanban
export const updateKanbanBoard = async (board: KanbanBoard): Promise<void> => {
  const supabase = createClient();
  
  // Pobierz dane użytkownika
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nie znaleziono użytkownika");
  
  // Konwertuj dane do formatu Supabase
  const supabaseData = mapKanbanBoardToSupabase(board);
  
  // Pobierz ID tablicy użytkownika
  const { data: boards, error: fetchError } = await supabase
    .from("kanban_boards")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);
  
  if (fetchError) {
    console.error("Błąd podczas pobierania ID tablicy:", fetchError);
    throw fetchError;
  }
  
  if (!boards || boards.length === 0) {
    throw new Error("Nie znaleziono tablicy dla użytkownika");
  }
  
  const boardId = boards[0].id;
  
  // Aktualizuj tablicę
  const { error: updateError } = await supabase
    .from("kanban_boards")
    .update(supabaseData)
    .eq("id", boardId);
  
  if (updateError) {
    console.error("Błąd podczas aktualizacji tablicy Kanban:", updateError);
    throw updateError;
  }
}; 