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

// Zmienna do blokowania równoczesnych wywołań
let isCreatingBoard = false;

// Pobranie lub utworzenie tablicy Kanban
export const getOrCreateKanbanBoard = async (): Promise<KanbanBoard> => {
  // Jeśli już trwa tworzenie, poczekaj na zakończenie
  if (isCreatingBoard) {
    console.log("Inne wywołanie już tworzy tablicę - oczekiwanie");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getOrCreateKanbanBoard();
  }
  
  try {
    // Ustawienie blokady
    isCreatingBoard = true;
    
    const supabase = createClient();
    
    // Pobierz dane użytkownika
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nie znaleziono użytkownika");
    
    // Sprawdź czy istnieje tablica dla użytkownika
    const { data: boards, error } = await supabase
      .from("kanban_boards")
      .select("*")
      .eq("user_id", user.id);
    
    if (error) {
      console.error("Błąd podczas pobierania tablicy Kanban:", error);
      throw error;
    }
    
    // Jeśli tablica istnieje, zwróć ją (nawet jeśli jest ich więcej)
    if (boards && boards.length > 0) {
      // Jeśli jest więcej niż jedna tablica, usuń duplikaty
      if (boards.length > 1) {
        console.warn(`Znaleziono ${boards.length} tablic dla użytkownika. Używamy pierwszej i usuwamy pozostałe.`);
        
        // Zachowujemy pierwszą tablicę, usuwamy pozostałe
        const boardToKeep = boards[0];
        const boardsToDelete = boards.slice(1).map(board => board.id);
        
        // Usuwamy duplikaty
        if (boardsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from("kanban_boards")
            .delete()
            .in("id", boardsToDelete);
          
          if (deleteError) {
            console.error("Błąd podczas usuwania duplikatów tablic:", deleteError);
          }
        }
        
        return mapSupabaseToKanbanBoard(boardToKeep as KanbanBoardData);
      }
      
      return mapSupabaseToKanbanBoard(boards[0] as KanbanBoardData);
    }
    
    // Jeśli nie istnieje, utwórz nową tablicę
    const initialTasks: Record<string, Task> = {
      "task-1": {
        id: "task-1",
        title: "Przygotować CV",
        description: "Przygotować CV pod konkretną ofertę pracy",
        priority: "high",
        status: "todo",
        createdAt: new Date().toISOString(),
        tags: ["CV"],
      },
    "task-2": {
      id: "task-2",
      title: "Zapisać oferty pracy",
      description: "Zapisać pierwsze interesujące oferty pracy",
      priority: "medium",
      status: "in-progress",
      createdAt: new Date().toISOString(),
      tags: ["oferty pracy"],
    }
  };

    // Początkowe kolumny
    const initialColumns: Record<string, Column> = {
      todo: {
        id: "todo",
        title: "Do zrobienia",
        taskIds: ["task-1"],
      },
      "in-progress": {
        id: "in-progress",
        title: "W trakcie",
        taskIds: ["task-2"],
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
    
    // Sprawdzamy ponownie czy tablica została utworzona w międzyczasie
    const { data: checkBoards, error: checkError } = await supabase
      .from("kanban_boards")
      .select("id")
      .eq("user_id", user.id);
      
    if (checkError) {
      console.error("Błąd podczas sprawdzania tablic:", checkError);
      throw checkError;
    }
    
    // Jeśli tablica została utworzona w międzyczasie, zwracamy ją
    if (checkBoards && checkBoards.length > 0) {
      console.log("Tablica została już utworzona w międzyczasie");
      
      // Pobierz pełne dane tablicy
      const { data: existingBoard, error: fetchError } = await supabase
        .from("kanban_boards")
        .select("*")
        .eq("id", checkBoards[0].id)
        .single();
        
      if (fetchError || !existingBoard) {
        console.error("Błąd podczas pobierania istniejącej tablicy:", fetchError);
        throw fetchError || new Error("Nie udało się pobrać istniejącej tablicy");
      }
      
      return mapSupabaseToKanbanBoard(existingBoard as KanbanBoardData);
    }
    
    console.log("Tworzenie nowej tablicy Kanban");
    
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
    
    if (!newBoard) {
      throw new Error("Tablica została utworzona, ale nie udało się jej pobrać");
    }
    
    // Zwróć zmapowaną tablicę z danych z bazy, a nie initialBoard
    return mapSupabaseToKanbanBoard(newBoard as KanbanBoardData);
  } finally {
    // Zawsze zwalniamy blokadę, nawet w przypadku błędu
    isCreatingBoard = false;
  }
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
    .eq("user_id", user.id);
  
  if (fetchError) {
    console.error("Błąd podczas pobierania ID tablicy:", fetchError);
    throw fetchError;
  }
  
  if (!boards || boards.length === 0) {
    console.error("Nie znaleziono tablicy dla użytkownika");
    return; // Nie tworzymy nowej tablicy, po prostu wracamy
  }
  
  // Jeśli znaleziono więcej niż jedną tablicę, użyj pierwszej (resztę usuń)
  if (boards.length > 1) {
    console.warn(`Znaleziono ${boards.length} tablic podczas aktualizacji. Używamy pierwszej.`);
    
    // Zachowujemy pierwszą tablicę, usuwamy pozostałe
    const boardToKeep = boards[0];
    const boardsToDelete = boards.slice(1).map(board => board.id);
    
    // Usuwamy duplikaty
    if (boardsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("kanban_boards")
        .delete()
        .in("id", boardsToDelete);
      
      if (deleteError) {
        console.error("Błąd podczas usuwania duplikatów tablic:", deleteError);
      }
    }
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