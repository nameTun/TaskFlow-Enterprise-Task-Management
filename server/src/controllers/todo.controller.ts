import { Request, Response } from 'express';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

let todos: Todo[] = [
  { id: 1, text: 'Buy milk', completed: false },
  { id: 2, text: 'Buy eggs', completed: false },
  { id: 3, text: 'Buy bread', completed: false },
];

export const getTodos = (req: Request, res: Response) => {
  res.json(todos);
};

export const addTodo = (req: Request, res: Response) => {
  const { text } = req.body;
  const newTodo: Todo = {
    id: todos.length + 1,
    text,
    completed: false,
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
};

export const updateTodo = (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, completed } = req.body;
  const todo = todos.find((todo) => todo.id === parseInt(id));
  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }
  todo.text = text ?? todo.text;
  todo.completed = completed ?? todo.completed;
  res.json(todo);
};

export const deleteTodo = (req: Request, res: Response) => {
  const { id } = req.params;
  const index = todos.findIndex((todo) => todo.id === parseInt(id));
  if (index === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }
  todos.splice(index, 1);
  res.status(204).send();
};
