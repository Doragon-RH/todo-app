import Head from "next/head";
import { Inter } from "next/font/google";
import * as React from 'react';
import Image from 'next/image';
import Link from "@mui/material/Link";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { blue } from '@mui/material/colors';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import {
  Alert,
  Button,
  Card,
  Divider,
  FormLabel,
  Input,
  Slide,
  SlideProps,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { BaseYup } from "./schema/yup";

import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';


import { useEffect, useState } from 'react';

import { generateClient } from 'aws-amplify/api';

import * as mutations from '../src/graphql/mutations';
import { listTodos } from '../src/graphql/queries';
import { type CreateTodoInput,type UpdateTodoInput, type Todo } from '../src/API';  //API.tsから機能・定義をインポート

import { withAuthenticator,  Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { type AuthUser } from "aws-amplify/auth";
import { type UseAuthenticator } from "@aws-amplify/ui-react-core";

Amplify.configure(amplifyconfig);

const SignupSchema = BaseYup.object().shape({
  id: BaseYup.string().required().label("ID"),
  name: BaseYup.string().required().label("予定"),
  description: BaseYup.string().label("詳細"),
  limit: BaseYup.date().required().label("期限"),
});


const initialState: CreateTodoInput = { name: '', description: '', limit: ''};
// const nextTodo: UpdateTodoInput = { id: '', name: '', description: ''};
const client = generateClient();//APIクライアントを生成

type AppProps = {
  signOut?: UseAuthenticator["signOut"]; //() => void;
  user?: AuthUser;
};
const App: React.FC<AppProps> = ({ signOut, user }) => {
  const [formState, setFormState] = useState<CreateTodoInput>(initialState);
  const [todos, setTodos] = useState<Todo[] | CreateTodoInput[]>([]);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(SignupSchema)
  });
  const onSubmit = (data: any) => console.log(data);

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
      if (!formState.name || !formState.description || !formState.limit) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await client.graphql({
        query: mutations.createTodo,
        variables: {
          input: todo,
        },
      });
      await fetchTodos();
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }
  // async function updateTodo() {
  //   const todoDetails = {
  //     id: 'some_id',
  //     //  _version: 'current_version', // add the "_version" field if your AppSync API has conflict detection (required for DataStore) enabled
  //     description: 'Updated description'
  //   };
  
  //   const updatedTodo = await client.graphql({
  //     query: mutations.updateTodo,
  //     variables: { input: todoDetails }
  //   });
  // }
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
    <>
      <main>
      <Stack spacing={3} m={"2rem 1rem"}>
      <Heading level={1}>Hello {user?.username}</Heading>
      <Button onClick={signOut}>Sign out</Button>
      <Box sx={{
        fontSize: "1.5rem",
        padding: "1rem",
      }}>
        <Input {...register('name')}
        onChange={(event) =>
          setFormState({ ...formState, name: event.target.value })
        }
        value={formState.name}
        placeholder="予定"
      />
      {errors.name && <p>{errors.name.message}</p>}
      <Input {...register('description')}
        onChange={(event) =>
          setFormState({ ...formState, description: event.target.value })
        }
        value={formState.description as string}
        placeholder="詳細"
      />
      {errors.description && <p>{errors.description.message}</p>}
        <Input type="date" 
        {...register('limit')} 
        onChange={(event) =>
          setFormState({ ...formState, limit: event.target.value })
        }/>
        {errors.limit && <p>{errors.limit.message}</p>}
      <Button  type="submit" variant="contained" onClick={addTodo}>
        Create Todo
      </Button>
      <Stack spacing={3}>
            <Typography variant="h3">Todo List</Typography>
            <Stack spacing={3}>
              {todos.map((todo) => (
                <Card key={todo.id} sx={{ py: "1rem", px: "2rem" }}>
                  <Stack>
                    <Typography variant="h6" fontWeight={"bold"}>
                      {todo.name}
                    </Typography>
                    <Typography variant="body1">{todo.description}</Typography>
                    <Typography variant="body1">{todo.limit}</Typography>
                  </Stack>
                  <Stack
                    direction={"row"}
                    gap={2}
                    sx={{ justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (typeof todo?.id === "string") {//delete構文が分からず苦労しました。
                          deleteTodo(todo.id);
                        }
                      }}
                    >
                      DONE
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>
          
    {/* {todos.map((todo, index) => (
        <div key={todo.id ? todo.id : index} >
          <p >{todo.name}</p>
          <p >{todo.description}</p>
          <p >{todo.limit}</p>
          <Button onClick={() => {
            if (typeof todo.id === 'string') {
              deleteTodo(todo.id);
            }
          }}>削除</Button>
        </div>
      ))} */}
      </Box>
    
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          height: "auto",
          padding: "0px",
          margin: "40px",
          background: "lightgreen",
          borderRadius: 40,
        }}>
          <Link
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          <Box
            sx={{
              boxShadow: 1,
              borderRadius: 1,
              minWidth: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          > 
            Powered by{' '}
            <Image 
            src="/vercel.svg" 
            alt="Vercel"
            width ={80}
            height={80}
            />
          </Box>
        </Link>
        </Box>
        </Stack>
        </main>
    </>
  );
};


export default withAuthenticator(App);