import { TaskStatus } from "./types";

// Funkcja pomocnicza do określania koloru nagłówka kolumny
export const getColumnHeaderColor = (status: TaskStatus) => {
  switch (status) {
    case "todo":
      return "bg-blue-50/20 dark:bg-blue-950/20 border-blue-500 dark:border-blue-800"
    case "in-progress":
      return "bg-amber-50/20 dark:bg-amber-950/20 border-amber-500 dark:border-amber-800"
    case "review":
      return "bg-purple-50/20 dark:bg-purple-950/10 border-purple-500 dark:border-purple-800"
    case "waiting":
      return "bg-cyan-50/20 dark:bg-cyan-950/20 border-cyan-500 dark:border-cyan-800"
    case "done":
      return "bg-green-50/20 dark:bg-green-950/20 border-green-500 dark:border-green-800"
    default:
      return "bg-gray-50/20 dark:bg-gray-800/20 border-gray-500 dark:border-gray-700"
  }
} 