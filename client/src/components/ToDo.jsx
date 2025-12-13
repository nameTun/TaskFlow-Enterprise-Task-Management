import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ToDo = () => {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/todos').then((response) => {
      setTodos(response.data);
    });
  }, []);

  const addTodo = () => {
    axios.post('http://localhost:3000/todos', { text }).then((response) => {
      setTodos([...todos, response.data]);
      setText('');
    });
  };

  const deleteTodo = (id) => {
    axios.delete(`http://localhost:3000/todos/${id}`).then(() => {
      setTodos(todos.filter((todo) => todo.id !== id));
    });
  };

  const toggleComplete = (id, completed) => {
    axios.put(`http://localhost:3000/todos/${id}`, { completed: !completed }).then((response) => {
      setTodos(
        todos.map((todo) => (todo.id === id ? response.data : todo))
      );
    });
  };

  return (
    <div>
      <h1>ToDo List</h1>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
          >
            <span onClick={() => toggleComplete(todo.id, todo.completed)}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ToDo;
