import { useEffect, useState } from 'react';

import { generateClient } from 'aws-amplify/api';

import * as mutations from '../src/graphql/mutations';
import { listTodos } from '../src/graphql/queries';
import { type CreateTodoInput,type UpdateTodoInput,type DeleteTodoInput, type Todo } from '../src/API';  //API.tsから機能・定義をインポート

import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { type AuthUser } from "aws-amplify/auth";
import { type UseAuthenticator } from "@aws-amplify/ui-react-core";


const initialState: CreateTodoInput = { name: '', description: '' };
const nextTodo: UpdateTodoInput = { id: '', name: '', description: ''};
const deleteTodo: DeleteTodoInput = { id: ''};
const client = generateClient();//APIクライアントを生成

type AppProps = {
  signOut?: UseAuthenticator["signOut"]; //() => void;
  user?: AuthUser;
};
const App: React.FC<AppProps> = ({ signOut, user }) => {
  const [formState, setFormState] = useState<CreateTodoInput>(initialState);
  const [todos, setTodos] = useState<Todo[] | CreateTodoInput[]>([]);
  const todoDetails = {
    id: 'some_id'
  };
  useEffect(() => {//コンポーネントが呼び出された後、フックが呼び出され、関数が呼び出される
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      const todoData = await client.graphql({
        query: listTodos,
      });
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log('error fetching todos');
    }
  }

  async function addTodo() {//新しいtodoを追加する
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await client.graphql({
        query: mutations.createTodo,
        variables: {
          input: todo,
        },
      });
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }
  async function apdateTodo() {
    const todoDetails = {
      id: 'some_id',
      //  _version: 'current_version', // add the "_version" field if your AppSync API has conflict detection (required for DataStore) enabled
      description: 'Updated description'
    };
  
    const updatedTodo = await client.graphql({
      query: mutations.updateTodo,
      variables: { input: todoDetails }
    });
  }
  async function deleteTodo( id : string) {
    try {
      await client.graphql({
      query: mutations.deleteTodo,
      variables: { input: { id } },
    });
      await fetchTodos();
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div style={styles.container}>
    <Heading level={1}>Hello {user?.username}</Heading>
    <Button onClick={signOut}>Sign out</Button>
    <h2>Amplify Todos</h2>
      <input
        onChange={(event) =>
          setFormState({ ...formState, name: event.target.value })
        }
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={(event) =>
          setFormState({ ...formState, description: event.target.value })
        }
        style={styles.input}
        value={formState.description as string}
        placeholder="Description"
      />
      <button style={styles.button} onClick={addTodo}>
        Create Todo
      </button>
      {todos.map((todo, index) => (
        <div key={todo.id ? todo.id : index} style={styles.todo}>
          <p style={styles.todoName}>{todo.name}</p>
          <p style={styles.todoDescription}>{todo.description}</p>
          <button onClick={() => {
            if (typeof todo.id === 'string') {//delete構文が分からず苦労しました。
              deleteTodo(todo.id);
            }
          }}>削除</button>
        </div>
      ))}
        {/* <ul>
        {todos.map((todo) => (
          <li>
            {todo.name}
            <button onClick={deleteTodo(todo.id)}>削除</button>
          </li>
        ))}
      </ul> */}
    </div>
    
  );
};

const styles = {
  container: {
    width: 400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  todo: { marginBottom: 15 },
  input: {
    border: "none",
    backgroundColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  todoDescription: { marginBottom: 0 },
  button: {
    backgroundColor: "black",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: "12px 0px",
  },
} as const;

export default withAuthenticator(App);