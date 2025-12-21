import React, { useState, useEffect } from 'react';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../../services/api';
import { List, Button, Checkbox, Form, Input, Spin, Alert, Typography, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

const TodoPage = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const response = await getTodos();
        setTodos(response.data);
        setError(null);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('You are not logged in. Please log in to see your todos.');
        } else {
          setError('Failed to fetch todos. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const handleAddTodo = async (values) => {
    try {
      const newTodoData = { title: values.title };
      const response = await createTodo(newTodoData);
      setTodos([response.data, ...todos]);
      form.resetFields();
      message.success('Todo added successfully!');
    } catch (err) {
      message.error('Failed to add todo.');
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const updatedTodo = await updateTodo(id, { completed: !completed });
      setTodos(todos.map(todo => (todo._id === id ? updatedTodo.data : todo)));
    } catch (err) {
      message.error('Failed to update todo.');
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo._id !== id));
      message.success('Todo deleted successfully!');
    } catch (err) {
      message.error('Failed to delete todo.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div style={{ maxWidth: 700, margin: 'auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>My Tasks</Title>
      
      <Form
        form={form}
        onFinish={handleAddTodo}
        layout="inline"
        style={{ marginBottom: 24, display: 'flex' }}
      >
        <Form.Item
          name="title"
          rules={[{ required: true, message: 'Please input a task!' }]}
          style={{ flex: 1 }}
        >
          <Input placeholder="What needs to be done?" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
            Add
          </Button>
        </Form.Item>
      </Form>

      <List
        bordered
        dataSource={todos}
        renderItem={item => (
          <List.Item
            actions={[
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteTodo(item._id)}
              />
            ]}
          >
            <List.Item.Meta
              avatar={
                <Checkbox
                  checked={item.completed}
                  onChange={() => handleToggleComplete(item._id, item.completed)}
                />
              }
              title={
                <span style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>
                  {item.title}
                </span>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: "You have no tasks. Add one above!" }}
      />
    </div>
  );
};

export default TodoPage;
